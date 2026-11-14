import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAlumniAuth } from "@/contexts/AlumniAuthContext";
import { AlertTriangle, Loader2, Mic, PhoneOff, Radio } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface Quota {
  attempts_used: number;
  attempts_max: number;
  attempts_remaining: number;
}

interface TranscriptLine {
  role: "ai" | "user";
  text: string;
}

type Stage = "setup" | "connecting" | "connected" | "ended";

const MAX_QUESTIONS = 5;
const SESSION_MAX_SECONDS = 10 * 60;
// Setelah pertanyaan ke-5 dijawab, giliran AI berikutnya (ke-6) seharusnya
// jadi ucapan penutup (sesuai instructions di backend) -- beri waktu segini
// buat penutupnya selesai diucapkan sebelum sesi ditutup otomatis.
const CLOSING_GRACE_MS = 15000;

function formatMmSs(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/**
 * Latihan interview suara REALTIME lewat OpenAI Realtime API (WebRTC).
 * Beda dari "Latihan Interview" turn-based yang sudah ada -- di sini
 * percakapan mengalir dua arah secara langsung (AI bisa "mendengar" dan
 * merespons sambil kandidat masih bicara), bukan rekam-transkrip-evaluasi
 * per giliran.
 *
 * Browser konek LANGSUNG ke OpenAI via WebRTC pakai ephemeral token yang
 * di-mint backend -- backend tidak meneruskan audio real-time, cuma
 * membuat token sekali di awal. Karena model realtime jauh lebih mahal,
 * jumlah percobaan per alumnus dibatasi (lihat quota di bawah).
 */
export default function JobReadyHubInterviewRealtime() {
  const { fetchAsAlumni } = useAlumniAuth();
  const [stage, setStage] = useState<Stage>("setup");
  const [targetRole, setTargetRole] = useState("");
  const [loadingSetup, setLoadingSetup] = useState(true);
  const [quota, setQuota] = useState<Quota | null>(null);
  const [transcript, setTranscript] = useState<TranscriptLine[]>([]);
  const [secondsRemaining, setSecondsRemaining] = useState(SESSION_MAX_SECONDS);
  const [questionsAsked, setQuestionsAsked] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const connectionRef = useRef<{ pc: RTCPeerConnection; dc: RTCDataChannel; stream: MediaStream } | null>(null);
  const sessionIdRef = useRef<number | null>(null);
  const transcriptRef = useRef<TranscriptLine[]>([]);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const closingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Dihitung dari event "response.created" -- setiap giliran AI (sapaan+Q1,
  // lalu tanggapan+Q berikutnya, dst) dianggap satu "pertanyaan". Giliran
  // AI ke-(MAX_QUESTIONS+1) seharusnya jadi ucapan penutup (lihat
  // instructions di backend), bukan pertanyaan baru lagi.
  const responseCountRef = useRef(0);
  // Index baris yang sedang "dibangun" untuk masing-masing role. Dilacak
  // eksplisit lewat ref -- BUKAN diasumsikan selalu "baris terakhir" -- karena
  // event transkrip final ucapan kandidat sering baru tiba SETELAH AI sudah
  // mulai menjawab (baris AI baru sudah lebih dulu ditambahkan di array).
  // Kalau asumsinya "baris terakhir", hasil final itu malah nyasar bikin
  // baris duplikat baru di posisi yang salah alih-alih menimpa baris asli.
  const currentUserLineIndexRef = useRef<number | null>(null);
  const currentAiLineIndexRef = useRef<number | null>(null);

  const loadQuota = async () => {
    try {
      const res = await fetchAsAlumni("/alumni/interview/realtime-session/quota");
      if (res.ok) setQuota(await res.json());
    } catch {
      // biarkan null -- tombol mulai tetap tampil, error ditangani saat submit
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const profileRes = await fetchAsAlumni("/alumni/profile");
        const profile = profileRes.ok ? await profileRes.json() : {};
        setTargetRole(profile.target_role || "");
      } catch {
        // biarkan kosong
      } finally {
        setLoadingSetup(false);
      }
      await loadQuota();
    };
    load();

    return () => {
      cleanupConnection();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (stage === "connected" && secondsRemaining === 0) {
      handleEnd();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsRemaining, stage]);

  const cleanupConnection = () => {
    const conn = connectionRef.current;
    if (conn) {
      try {
        conn.dc.close();
        conn.pc.close();
        conn.stream.getTracks().forEach((t) => t.stop());
      } catch {
        // koneksi mungkin sudah tertutup, aman diabaikan
      }
      connectionRef.current = null;
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (closingTimeoutRef.current) {
      clearTimeout(closingTimeoutRef.current);
      closingTimeoutRef.current = null;
    }
  };

  // Nama event data-channel Realtime API sempat berubah antar versi API
  // (mengikuti restrukturisasi "audio.input"/"audio.output" yang juga
  // ditemukan di endpoint mint token) -- jadi di sini dicek beberapa
  // kemungkinan nama sekaligus, plus semua event mentah di-log ke console
  // supaya gampang di-debug lewat DevTools kalau masih ada yang meleset.
  const AI_TRANSCRIPT_DELTA_TYPES = [
    "response.audio_transcript.delta",
    "response.output_audio_transcript.delta",
  ];
  const USER_SPEECH_STARTED_TYPES = ["input_audio_buffer.speech_started"];
  const USER_TRANSCRIPT_DELTA_TYPES = [
    "conversation.item.input_audio_transcription.delta",
  ];
  const USER_TRANSCRIPT_DONE_TYPES = [
    "conversation.item.input_audio_transcription.completed",
    "conversation.item.input_audio_transcription.done",
  ];

  // Mulai baris baru untuk role tertentu, dan INGAT index-nya secara
  // eksplisit lewat ref -- supaya event susulan (delta/final) untuk giliran
  // ini selalu nemplok ke baris yang benar, walau di antaranya sudah ada
  // baris lain (dari role lawan bicara) yang keburu ditambahkan duluan.
  const startLine = (role: "ai" | "user") => {
    transcriptRef.current = [...transcriptRef.current, { role, text: "" }];
    const idx = transcriptRef.current.length - 1;
    if (role === "ai") currentAiLineIndexRef.current = idx;
    else currentUserLineIndexRef.current = idx;
    setTranscript([...transcriptRef.current]);
  };

  // Tambahkan potongan teks (delta) ke baris yang sedang dibangun untuk role
  // ini -- ini yang bikin captionnya muncul kata-per-kata selagi masih
  // bicara, mirip live caption di Gemini, bukan nongol sekaligus di akhir.
  const appendToLine = (role: "ai" | "user", delta: string) => {
    const idxRef = role === "ai" ? currentAiLineIndexRef : currentUserLineIndexRef;
    if (idxRef.current === null) {
      startLine(role);
    }
    const idx = idxRef.current as number;
    const lines = [...transcriptRef.current];
    if (lines[idx] && lines[idx].role === role) {
      lines[idx] = { ...lines[idx], text: lines[idx].text + delta };
      transcriptRef.current = lines;
      setTranscript([...lines]);
    }
  };

  // Timpa teks baris yang sedang dibangun dengan transkrip final (lebih
  // akurat daripada hasil akumulasi delta) begitu API bilang giliran ini
  // sudah selesai, lalu "tutup" giliran itu supaya delta berikutnya untuk
  // role yang sama membuat baris baru, bukan menyambung baris lama.
  const finalizeLine = (role: "ai" | "user", finalText: string) => {
    const idxRef = role === "ai" ? currentAiLineIndexRef : currentUserLineIndexRef;
    if (idxRef.current === null) {
      startLine(role);
    }
    const idx = idxRef.current as number;
    const lines = [...transcriptRef.current];
    if (lines[idx] && lines[idx].role === role) {
      lines[idx] = { ...lines[idx], text: finalText };
      transcriptRef.current = lines;
      setTranscript([...lines]);
    }
    idxRef.current = null;
  };

  const handleRealtimeEvent = (event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);
      // eslint-disable-next-line no-console
      console.log("[realtime event]", data.type, data);

      if (data.type === "response.created") {
        startLine("ai");
        responseCountRef.current += 1;
        setQuestionsAsked(Math.min(responseCountRef.current, MAX_QUESTIONS));
        if (responseCountRef.current === MAX_QUESTIONS + 1) {
          // Ini giliran penutup -- beri waktu AI menyelesaikan ucapan
          // terima kasihnya, baru sesi ditutup otomatis.
          closingTimeoutRef.current = setTimeout(() => {
            handleEnd();
          }, CLOSING_GRACE_MS);
        }
      } else if (AI_TRANSCRIPT_DELTA_TYPES.includes(data.type)) {
        appendToLine("ai", data.delta || "");
      } else if (USER_SPEECH_STARTED_TYPES.includes(data.type)) {
        startLine("user");
      } else if (USER_TRANSCRIPT_DELTA_TYPES.includes(data.type)) {
        appendToLine("user", data.delta || "");
      } else if (USER_TRANSCRIPT_DONE_TYPES.includes(data.type)) {
        finalizeLine("user", data.transcript || "");
      } else if (data.type === "error") {
        console.error("[realtime error event]", data);
        toast.error(data.error?.message || "Terjadi error dari sesi realtime");
      }
    } catch {
      // event tidak dikenali -- abaikan, tidak fatal untuk percakapan
    }
  };

  const handleStart = async () => {
    if (!targetRole.trim()) {
      toast.error("Isi dulu posisi/role yang ingin dilatih");
      return;
    }
    setStage("connecting");
    transcriptRef.current = [];
    currentAiLineIndexRef.current = null;
    currentUserLineIndexRef.current = null;
    responseCountRef.current = 0;
    setTranscript([]);
    setQuestionsAsked(0);
    setSecondsRemaining(SESSION_MAX_SECONDS);

    try {
      const sessionRes = await fetchAsAlumni("/alumni/interview/realtime-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target_role: targetRole }),
      });
      if (!sessionRes.ok) {
        const err = await sessionRes.json().catch(() => ({}));
        throw new Error(err.detail || "Gagal memulai sesi realtime");
      }
      const session = await sessionRes.json();
      sessionIdRef.current = session.session_id;

      // echoCancellation eksplisit -- tanpa ini (terutama tanpa headset),
      // mic bisa menangkap suara AI dari speaker sendiri, membuat AI
      // seolah "mendengar" ucapannya sendiri dan menyahut berulang-ulang.
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      const pc = new RTCPeerConnection();
      pc.addTrack(stream.getAudioTracks()[0], stream);
      pc.ontrack = (e) => {
        // eslint-disable-next-line no-console
        console.log("[realtime] remote audio track received", e.streams[0]);
        if (audioRef.current) {
          audioRef.current.srcObject = e.streams[0];
          audioRef.current.play().catch((err) => {
            console.error("[realtime] audio.play() gagal (kemungkinan diblokir browser):", err);
            toast.error("Audio tidak bisa diputar otomatis. Coba klik di halaman lalu ulangi.");
          });
        }
      };

      const dc = pc.createDataChannel("oai-events");
      dc.onmessage = handleRealtimeEvent;
      dc.onopen = () => {
        // Tanpa ini, AI diam menunggu kandidat bicara duluan (default
        // turn-taking server_vad). Supaya interview terasa natural, AI yang
        // memulai duluan dengan menyapa & menanyakan pertanyaan pertama.
        console.log("[realtime] data channel open -- trigger AI untuk mulai bicara duluan");
        dc.send(
          JSON.stringify({
            type: "response.create",
            response: { output_modalities: ["audio"] },
          })
        );
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // OpenAI memindahkan endpoint SDP exchange ke /v1/realtime/calls di 2026
      // (dulu /v1/realtime?model=... langsung) -- model sudah "dikunci" di
      // ephemeral client secret saat sesi dibuat, jadi tidak perlu lagi
      // dikirim sebagai query param di sini.
      const sdpResponse = await fetch("https://api.openai.com/v1/realtime/calls", {
        method: "POST",
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${session.client_secret}`,
          "Content-Type": "application/sdp",
        },
      });
      if (!sdpResponse.ok) throw new Error("Gagal konek ke OpenAI Realtime API");
      const answerSdp = await sdpResponse.text();
      await pc.setRemoteDescription({ type: "answer", sdp: answerSdp });

      connectionRef.current = { pc, dc, stream };
      setStage("connected");
      setQuota((prev) => (prev ? { ...prev, attempts_remaining: session.attempts_remaining, attempts_used: prev.attempts_used + 1 } : prev));

      // Batas waktu keras -- kalau lupa klik "Selesai Sesi", sesi (dan
      // biayanya) tidak jalan terus tanpa henti.
      timerIntervalRef.current = setInterval(() => {
        setSecondsRemaining((prev) => Math.max(0, prev - 1));
      }, 1000);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal memulai sesi realtime");
      cleanupConnection();
      setStage("setup");
    }
  };

  const handleEnd = async () => {
    cleanupConnection();
    setStage("ended");

    const fullTranscript = transcriptRef.current
      .filter((l) => l.text.trim())
      .map((l) => `${l.role === "ai" ? "Pewawancara" : "Kandidat"}: ${l.text}`)
      .join("\n");

    if (sessionIdRef.current) {
      try {
        await fetchAsAlumni(`/alumni/interview/realtime-session/${sessionIdRef.current}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transcript: fullTranscript }),
        });
      } catch {
        // transcript gagal tersimpan -- tidak fatal, sesi tetap dihitung terpakai
      }
    }
  };

  if (loadingSetup) {
    return <p className="text-muted-foreground">Memuat...</p>;
  }

  return (
    <div className="max-w-2xl space-y-4">
      {/* Selalu di-render (bukan cuma saat stage === "connected") supaya
          audioRef.current sudah terisi SEBELUM koneksi WebRTC dimulai --
          kalau elemen ini baru muncul setelah pc.ontrack keburu terpanggil,
          audioRef.current masih null saat itu dan audio-nya hilang tanpa
          error apa pun. */}
      <audio ref={audioRef} autoPlay hidden />

      <div className="flex items-center gap-2">
        <h2 className="text-lg font-bold">Interview Realtime</h2>
        <Badge variant="secondary">Beta</Badge>
      </div>
      <p className="text-sm text-muted-foreground">
        Latihan interview suara dua arah secara langsung dengan AI, seperti panggilan telepon. Berbeda dari
        menu Latihan Interview biasa, jumlah sesi di sini dibatasi per akun.
      </p>

      {quota && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Sisa percobaan:</span>
          <Badge variant={quota.attempts_remaining > 0 ? "default" : "destructive"}>
            {quota.attempts_remaining} / {quota.attempts_max}
          </Badge>
        </div>
      )}

      {stage === "setup" && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-1.5">
              <Label>Posisi/Role yang Dituju</Label>
              <Input value={targetRole} onChange={(e) => setTargetRole(e.target.value)} placeholder="mis. Data Analyst" />
            </div>

            {quota && quota.attempts_remaining <= 0 ? (
              <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>
                  Kuota latihan interview realtime kamu sudah habis. Coba fitur "Latihan Interview"
                  biasa yang tidak dibatasi jumlah percobaan.
                </p>
              </div>
            ) : (
              <Button onClick={handleStart} className="gap-2">
                <Radio className="w-4 h-4" />
                Mulai Sesi Realtime
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {stage === "connecting" && (
        <Card>
          <CardContent className="p-6 flex flex-col items-center gap-3 text-center">
            <Loader2 className="w-6 h-6 animate-spin text-accent" />
            <p className="text-sm text-muted-foreground">Menghubungkan ke AI Interviewer...</p>
          </CardContent>
        </Card>
      )}

      {stage === "connected" && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 text-sm text-accent font-medium">
                <Mic className="w-4 h-4 animate-pulse" />
                Sesi berlangsung. Bicaralah seperti wawancara biasa.
              </div>
              <Button variant="destructive" size="sm" onClick={handleEnd} className="gap-2">
                <PhoneOff className="w-4 h-4" />
                Selesai Sesi
              </Button>
            </div>

            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <Badge variant={secondsRemaining <= 60 ? "destructive" : "outline"}>
                Sisa waktu: {formatMmSs(secondsRemaining)}
              </Badge>
              <Badge variant="outline">Pertanyaan: {questionsAsked} / {MAX_QUESTIONS}</Badge>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto rounded-md border border-border p-3 bg-secondary/20">
              {transcript.length === 0 && (
                <p className="text-xs text-muted-foreground italic">Menunggu percakapan dimulai...</p>
              )}
              {transcript.map((line, idx) => (
                <p key={idx} className="text-sm">
                  <span className={`font-semibold ${line.role === "ai" ? "text-accent" : "text-foreground"}`}>
                    {line.role === "ai" ? "Pewawancara: " : "Kamu: "}
                  </span>
                  {line.text}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {stage === "ended" && (
        <Card>
          <CardContent className="p-6 space-y-3">
            <h3 className="font-bold">Sesi Selesai</h3>
            <p className="text-sm text-muted-foreground">Transkrip percakapan sudah tersimpan.</p>
            <div className="space-y-2 max-h-80 overflow-y-auto rounded-md border border-border p-3 bg-secondary/20">
              {transcript.map((line, idx) => (
                <p key={idx} className="text-sm">
                  <span className={`font-semibold ${line.role === "ai" ? "text-accent" : "text-foreground"}`}>
                    {line.role === "ai" ? "Pewawancara: " : "Kamu: "}
                  </span>
                  {line.text}
                </p>
              ))}
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setStage("setup");
                setTranscript([]);
              }}
            >
              Kembali ke Setup
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
