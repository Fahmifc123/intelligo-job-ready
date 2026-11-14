import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useAlumniAuth } from "@/contexts/AlumniAuthContext";
import { Loader2, MessageSquareText } from "lucide-react";
import { useEffect, useState } from "react";
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
type RecordingState = "idle" | "evaluating" | "done";

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

  const [history, setHistory] = useState<InterviewAttempt[]>([]);


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

  const handleGetFeedback = async () => {
    if (!transcript.trim()) {
      toast.error("Jawaban masih kosong. Ketik dulu jawabanmu.");
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
      setRecordingState("idle");
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
              <h2 className="text-lg font-bold">Latihan Interview Teks</h2>
              <p className="text-sm text-muted-foreground mt-1">
                AI membuat 5 pertanyaan interview sesuai posisi yang kamu tuju. Ketik jawabanmu, lalu dapatkan skor dan
                feedback dari AI. Cocok untuk menyusun jawaban dengan tenang sebelum latihan suara di Interview Realtime.
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
              {generatingQuestions ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquareText className="w-4 h-4" />}
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
            <p className="text-base font-semibold">{questions[currentIndex]}</p>

            <Separator />

            <div className="space-y-3">
              <Label htmlFor="interview-answer">Jawaban kamu</Label>
              <Textarea
                id="interview-answer"
                value={transcript}
                onChange={(e) => {
                  setTranscript(e.target.value);
                  if (recordingState === "done") setRecordingState("idle");
                }}
                rows={7}
                maxLength={4000}
                placeholder="Tulis jawabanmu seperti sedang menjawab langsung. Untuk pertanyaan pengalaman, pakai alur STAR: situasi, tugas, tindakan, hasil."
                disabled={recordingState === "evaluating"}
              />
              <div className="flex flex-wrap items-center gap-3">
                <Button onClick={handleGetFeedback} disabled={recordingState === "evaluating" || !transcript.trim()} className="gap-2">
                  {recordingState === "evaluating" ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {recordingState === "evaluating" ? "Menganalisis jawaban..." : feedback ? "Nilai ulang jawaban" : "Dapatkan Feedback AI"}
                </Button>
                <span className="text-xs text-muted-foreground tabular-nums">{transcript.trim() ? transcript.trim().split(/\s+/).length : 0} kata</span>
              </div>
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
