import { CodingTestProblem, codingTestProblems } from "@/data/codingTestProblems";
import { preloadPyodide, runSolution, RunResult } from "@/lib/pyodideRunner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useAlumniAuth } from "@/contexts/AlumniAuthContext";
import { CheckCircle2, Circle, Loader2, Play } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

interface ProgressRow {
  problem_id: string;
  solved: boolean;
  attempts: number;
}

const difficultyTiers: Array<CodingTestProblem["difficulty"]> = ["Pemula", "Menengah", "Lanjutan"];

export default function JobReadyHubCodingTest() {
  const { fetchAsAlumni } = useAlumniAuth();
  const [selectedId, setSelectedId] = useState(codingTestProblems[0].id);
  const [code, setCode] = useState(codingTestProblems[0].starterCode);
  const [progress, setProgress] = useState<Record<string, ProgressRow>>({});
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<RunResult | null>(null);

  const selectedProblem = useMemo(
    () => codingTestProblems.find((p) => p.id === selectedId) || codingTestProblems[0],
    [selectedId]
  );

  useEffect(() => {
    preloadPyodide().catch(() => {
      // Diam-diam gagal di sini -- error yang jelas ("Gagal memuat Python engine...")
      // baru ditampilkan ke user saat mereka benar-benar klik "Run".
    });

    fetchAsAlumni("/alumni/coding-test/progress")
      .then((r) => (r.ok ? r.json() : { progress: [] }))
      .then((data) => {
        const rows: ProgressRow[] = data.progress || [];
        const map: Record<string, ProgressRow> = {};
        rows.forEach((row) => {
          map[row.problem_id] = row;
        });
        setProgress(map);
      })
      .catch(() => {
        // Progress cuma nice-to-have, gagal load tidak boleh menghalangi soal dikerjakan.
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectProblem = (id: string) => {
    setSelectedId(id);
    const problem = codingTestProblems.find((p) => p.id === id);
    setCode(problem?.starterCode || "");
    setResult(null);
  };

  const handleRun = async () => {
    setIsRunning(true);
    setResult(null);
    try {
      const runResult = await runSolution(selectedProblem.setupCode, code);
      setResult(runResult);

      if (!runResult.success) {
        toast.error(runResult.errorMessage || "Kode kamu error, cek lagi ya.");
      } else if (runResult.allPassed) {
        toast.success("Semua test case lolos! 🎉");
      } else {
        toast.error(`${runResult.passedCount}/${runResult.totalCount} test case lolos. Coba lagi.`);
      }

      const solved = runResult.success && runResult.allPassed;
      setProgress((prev) => ({
        ...prev,
        [selectedProblem.id]: {
          problem_id: selectedProblem.id,
          solved: solved || Boolean(prev[selectedProblem.id]?.solved),
          attempts: (prev[selectedProblem.id]?.attempts || 0) + 1,
        },
      }));

      fetchAsAlumni("/alumni/coding-test/progress", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problem_id: selectedProblem.id, solved, code }),
      }).catch(() => {
        // Simpan progress bersifat best-effort, tidak mengganggu alur latihan.
      });
    } finally {
      setIsRunning(false);
    }
  };

  const solvedCount = Object.values(progress).filter((p) => p.solved).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold">Coding Test — Pandas</h2>
          <p className="text-sm text-muted-foreground">
            Latihan manipulasi data dengan pandas, dinilai otomatis lewat test case nyata.
          </p>
        </div>
        <Badge variant="secondary" className="w-fit">
          {solvedCount}/{codingTestProblems.length} soal selesai
        </Badge>
      </div>

      <div className="grid lg:grid-cols-[260px_1fr] gap-4">
        {/* Problem list, dikelompokkan per tingkat kesulitan */}
        <div className="lg:max-h-[calc(100vh-220px)] lg:overflow-y-auto lg:pr-1 space-y-4">
          {difficultyTiers.map((tier) => {
            const problemsInTier = codingTestProblems.filter((p) => p.difficulty === tier);
            if (problemsInTier.length === 0) return null;
            const solvedInTier = problemsInTier.filter((p) => progress[p.id]?.solved).length;
            return (
              <div key={tier} className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">{tier}</p>
                  <p className="text-xs text-muted-foreground">
                    {solvedInTier}/{problemsInTier.length}
                  </p>
                </div>
                {problemsInTier.map((problem) => {
                  const isSolved = progress[problem.id]?.solved;
                  const isActive = problem.id === selectedId;
                  return (
                    <button
                      key={problem.id}
                      onClick={() => selectProblem(problem.id)}
                      className={`w-full text-left p-3 rounded-lg border text-sm transition-colors ${
                        isActive
                          ? "border-accent bg-accent/10"
                          : "border-border/50 bg-card hover:border-accent/30"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {isSolved ? (
                          <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-muted-foreground shrink-0" />
                        )}
                        <span className="font-medium">{problem.title}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Problem detail + editor */}
        <div className="space-y-4 min-w-0">
          <Card>
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold">{selectedProblem.title}</h3>
                <Badge variant="outline">{selectedProblem.difficulty}</Badge>
              </div>
              <p className="text-sm text-foreground/80 whitespace-pre-line">{selectedProblem.description}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between items-center">
                <p className="text-sm font-medium">Kode Kamu</p>
                <Button size="sm" onClick={handleRun} disabled={isRunning} className="gap-2">
                  {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                  {isRunning ? "Menjalankan..." : "Run"}
                </Button>
              </div>
              <Textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                rows={12}
                spellCheck={false}
                className="font-mono text-sm"
              />
            </CardContent>
          </Card>

          {result && (
            <Card>
              <CardContent className="p-4 space-y-2">
                {!result.success ? (
                  <p className="text-sm text-destructive font-mono whitespace-pre-wrap">{result.errorMessage}</p>
                ) : (
                  <>
                    <p className={`text-sm font-medium ${result.allPassed ? "text-green-600" : "text-destructive"}`}>
                      {result.passedCount}/{result.totalCount} test case lolos
                    </p>
                    <div className="space-y-1">
                      {result.results.map((r) => (
                        <div key={r.case} className="flex items-start gap-2 text-sm">
                          {r.passed ? (
                            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                          ) : (
                            <Circle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                          )}
                          <div>
                            <span>Test case {r.case}</span>
                            {r.error && <p className="text-xs text-destructive font-mono">{r.error}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
