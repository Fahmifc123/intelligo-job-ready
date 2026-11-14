import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useAlumniAuth } from "@/contexts/AlumniAuthContext";
import { Loader2, Mic, Square, Volume2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface InterviewAttempt {
  id: number;
  target_role: string | null;
  question: string;
  transcript: string | null;
  score: number | null;
  strengths: string[];
  improvements: string[];
  created_at: string;
}

type Stage = "setup" | "interview" | "summary";
type RecordingState = "idle" | "recording" | "transcribing" | "ready" | "evaluating" | "done";

export default function JobReadyHubInterviewPrep() {
  const { fetchAsAlumni } = useAlumniAuth();
  const [stage, setStage] = useState<Stage>("setup");
  const [targetRole, setTargetRole] = useState("");
  const [loadingSetup, setLoadingSetup] = useState(true);
  const [generatingQuestions, setGeneratingQuestions] = useState(false);
  const [startError, setStartError] = useState("");

  const [questions, setQuestions] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [transcript, setTranscript] = useState("");
  const [feedback, setFeedback] = useState<{ score: number; strengths: string[]; improvements: string[] } | null>(null);
  const [isPlayingQuestion, setIsPlayingQuestion] = useState(false);

  const [history, setHistory] = useState<InterviewAttempt[]>([]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const loadHistory = async () => {
    try {
      const res = await fetchAsAlumni("/alumni/interview/attempts");
      if (res.ok) setHistory(await res.json());
    } catch {
      // riwayat gagal dimuat -- tidak fatal, biarkan kosong
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const profileRes = await fetchAsAlumni("/alumni/profile");
        const profile = profileRes.ok ? await profileRes.json() : {};
        setTargetRole(profile.target_role || "");
      } catch {
        // biarkan kosong, user bisa isi manual
      } finally {
        setLoadingSetup(false);
      }
      await loadHistory();
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStartPractice = async () => {
    if (!targetRole.trim()) {
      toast.error("Isi dulu posisi/role yang ingin dilatih");
      return;
    }
    setGeneratingQuestions(true);
    setStartError("");
    try {
      const res = await fetchAsAlumni("/alumni/interview/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target_role: targetRole, count: 5 }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      if (!data.questions || data.questions.length === 0) throw new Error("No questions");
      setQuestions(data.questions);
      setCurrentIndex(0);
      setTranscript("");
      setFeedback(null);
      setRecordingState("idle");
      setStage("interview");
    } catch {
      const msg = "Pertanyaan interview gagal dibuat. Coba lagi beberapa saat lagi. Kalau masih gagal, hubungi tim Intelligo.";
      setStartError(msg);
      toast.error(msg);
    } finally {
      setGeneratingQuestions(false);
    }
  };

  const handlePlayQuestion = async () => {
    setIsPlayingQuestion(true);
    try {
      const res = await fetchAsAlumni("/alumni/interview/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: questions[currentIndex] }),
      });
      if (!res.ok) throw new Error("Failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.onended = () => setIsPlayingQuestion(false);
      audio.onerror = () => setIsPlayingQuestion(false);
      await audio.play();
    } catch {
      toast.error("Gagal memutar audio pertanyaan");
      setIsPlayingQuestion(false);
    }
  };

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      const mimeType = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "";
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType || "audio/webm" });
        handleStopRecording(blob);
        streamRef.current?.getTracks().forEach((t) => t.stop());
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setRecordingState("recording");
    } catch {
      toast.error("Tidak bisa mengakses mikrofon. Pastikan izin mikrofon diaktifkan.");
    }
  };

  const handleStopRecordingClick = () => {
    mediaRecorderRef.current?.stop();
  };

  const handleStopRecording = async (blob: Blob) => {
    setRecordingState("transcribing");
    try {
      const formData = new FormData();
      formData.append("file", blob, "answer.webm");
      const res = await fetchAsAlumni("/alumni/interview/transcribe", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setTranscript(data.transcript || "");
      setRecordingState("ready");
    } catch {
      toast.error("Gagal mentranskrip jawaban. Coba rekam ulang, atau ketik manual di bawah.");
      setRecordingState("idle");
    }
  };

  const handleGetFeedback = async () => {
    if (!transcript.trim()) {
      toast.error("Jawaban masih kosong. Rekam atau ketik dulu jawabanmu.");
      return;
    }
    setRecordingState("evaluating");
    try {
      const res = await fetchAsAlumni("/alumni/interview/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target_role: targetRole, question: questions[currentIndex], transcript }),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setFeedback({ score: data.score, strengths: data.strengths, improvements: data.improvements });
      setRecordingState("done");
    } catch {
      toast.error("Gagal mendapatkan feedback AI. Coba lagi.");
      setRecordingState("ready");
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setTranscript("");
      setFeedback(null);
      setRecordingState("idle");
    } else {
      loadHistory();
      setStage("summary");
    }
  };

  if (loadingSetup) {
    return <p className="text-muted-foreground">Memuat...</p>;
  }

  if (stage === "setup") {
    return (
      <div className="max-w-2xl space-y-6">
        <Card>
          <CardContent className="p-6 space-y-4">
            <div>
              <h2 className="text-lg font-bold">Latihan Interview dengan AI</h2>
              <p className="text-sm text-muted-foreground mt-1">
                AI akan membuat 5 pertanyaan mock interview sesuai posisi yang kamu tuju. Jawab dengan
                merekam suara, dan dapatkan feedback langsung dari AI.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label>Posisi/Role yang Dituju</Label>
              <Input
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="mis. Data Analyst"
              />
            </div>
            <Button onClick={handleStartPractice} disabled={generatingQuestions} className="gap-2">
              {generatingQuestions ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mic className="w-4 h-4" />}
              {generatingQuestions ? "Menyiapkan pertanyaan..." : startError ? "Coba Lagi" : "Mulai Latihan"}
            </Button>
            {generatingQuestions && (
              <p className="text-xs text-muted-foreground">AI sedang menyusun 5 pertanyaan. Biasanya butuh beberapa detik.</p>
            )}
            {startError && (
              <p role="alert" className="text-sm text-destructive">
                {startError}
              </p>
            )}
          </CardContent>
        </Card>

        {history.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">Riwayat Latihan</h3>
            <div className="space-y-3">
              {history.slice(0, 5).map((attempt) => (
                <Card key={attempt.id}>
                  <CardContent className="p-4 space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <p className="text-sm font-medium">{attempt.question}</p>
                      {attempt.score !== null && (
                        <Badge variant={attempt.score >= 7 ? "default" : "secondary"} className="shrink-0">
                          {attempt.score}/10
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{attempt.target_role}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (stage === "interview") {
    return (
      <div className="max-w-2xl space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Pertanyaan {currentIndex + 1} dari {questions.length}
          </p>
          <Badge variant="outline">{targetRole}</Badge>
        </div>
        <Progress value={((currentIndex + 1) / questions.length) * 100} />

        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <p className="text-base font-semibold">{questions[currentIndex]}</p>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0"
                onClick={handlePlayQuestion}
                disabled={isPlayingQuestion}
                title="Dengarkan pertanyaan"
              >
                {isPlayingQuestion ? <Loader2 className="w-4 h-4 animate-spin" /> : <Volume2 className="w-4 h-4" />}
              </Button>
            </div>

            <Separator />

            <div className="space-y-3">
              <Label>Jawaban Kamu</Label>
              <div className="flex items-center gap-3">
                {recordingState === "idle" && (
                  <Button onClick={handleStartRecording} className="gap-2">
                    <Mic className="w-4 h-4" />
                    Mulai Rekam
                  </Button>
                )}
                {recordingState === "recording" && (
                  <Button onClick={handleStopRecordingClick} variant="destructive" className="gap-2">
                    <Square className="w-4 h-4" />
                    Stop Rekam
                  </Button>
                )}
                {recordingState === "transcribing" && (
                  <Button disabled className="gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Mentranskrip jawaban...
                  </Button>
                )}
                {(recordingState === "ready" || recordingState === "evaluating" || recordingState === "done") && (
                  <Button variant="outline" onClick={handleStartRecording} className="gap-2">
                    <Mic className="w-4 h-4" />
                    Rekam Ulang
                  </Button>
                )}
              </div>

              {(recordingState === "ready" || recordingState === "evaluating" || recordingState === "done") && (
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">
                    Hasil transkrip (bisa kamu edit kalau ada yang salah)
                  </Label>
                  <Textarea value={transcript} onChange={(e) => setTranscript(e.target.value)} rows={4} />
                </div>
              )}

              {recordingState === "ready" && (
                <Button onClick={handleGetFeedback} className="gap-2">
                  Dapatkan Feedback AI
                </Button>
              )}
              {recordingState === "evaluating" && (
                <Button disabled className="gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Menganalisis jawaban...
                </Button>
              )}
            </div>

            {feedback && (
              <div className="rounded-md border border-accent/30 bg-accent/5 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">Skor:</span>
                  <Badge variant={feedback.score >= 7 ? "default" : "secondary"}>{feedback.score}/10</Badge>
                </div>
                {feedback.strengths.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1">Kekuatan</p>
                    <ul className="list-disc list-outside ml-4 text-sm space-y-0.5">
                      {feedback.strengths.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {feedback.improvements.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1">Perlu Diperbaiki</p>
                    <ul className="list-disc list-outside ml-4 text-sm space-y-0.5">
                      {feedback.improvements.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <Button size="sm" onClick={handleNextQuestion}>
                  {currentIndex < questions.length - 1 ? "Pertanyaan Berikutnya" : "Selesai"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // stage === "summary"
  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <CardContent className="p-6 space-y-3 text-center">
          <h2 className="text-lg font-bold">Latihan Selesai! 🎉</h2>
          <p className="text-sm text-muted-foreground">
            Kamu sudah menjawab {questions.length} pertanyaan untuk posisi {targetRole}. Lihat feedback di
            riwayat latihan, atau coba lagi untuk hasil yang lebih baik.
          </p>
          <Button
            onClick={() => {
              setStage("setup");
              setQuestions([]);
            }}
          >
            Latihan Lagi
          </Button>
        </CardContent>
      </Card>

      <div>
        <h3 className="text-sm font-semibold text-muted-foreground mb-3">Riwayat Latihan</h3>
        <div className="space-y-3">
          {history.slice(0, 10).map((attempt) => (
            <Card key={attempt.id}>
              <CardContent className="p-4 space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <p className="text-sm font-medium">{attempt.question}</p>
                  {attempt.score !== null && (
                    <Badge variant={attempt.score >= 7 ? "default" : "secondary"} className="shrink-0">
                      {attempt.score}/10
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{attempt.target_role}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
