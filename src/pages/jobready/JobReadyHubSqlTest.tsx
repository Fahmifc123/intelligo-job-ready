import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useAlumniAuth } from "@/contexts/AlumniAuthContext";
import { SQL_TABLES_INFO, sqlProblems } from "@/data/sqlTestProblems";
import { checkQuery, runQuery, type QueryResult } from "@/lib/sqlRunner";
import { cn } from "@/lib/utils";
import { Check, Loader2, Play } from "lucide-react";
import { useEffect, useState } from "react";

interface ProgressRow {
  problem_id: string;
  solved: boolean | number;
  last_code: string | null;
}

function ResultTable({ result }: { result: QueryResult }) {
  if (result.columns.length === 0) return <p className="text-sm text-muted-foreground">Query tidak menghasilkan tabel.</p>;
  return (
    <div className="overflow-x-auto rounded-md border max-h-72">
      <table className="w-full text-sm">
        <thead className="bg-muted/60 sticky top-0">
          <tr>
            {result.columns.map((c, i) => (
              <th key={i} className="px-3 py-2 text-left font-medium whitespace-nowrap">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {result.rows.slice(0, 100).map((r, i) => (
            <tr key={i} className="border-t">
              {r.map((v, j) => (
                <td key={j} className="px-3 py-1.5 whitespace-nowrap tabular-nums">
                  {v === null ? <span className="text-muted-foreground">NULL</span> : String(v)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function JobReadyHubSqlTest() {
  const { fetchAsAlumni } = useAlumniAuth();
  const [index, setIndex] = useState(0);
  const [codes, setCodes] = useState<Record<string, string>>({});
  const [solved, setSolved] = useState<Record<string, boolean>>({});
  const [result, setResult] = useState<QueryResult | null>(null);
  const [feedback, setFeedback] = useState<{ passed: boolean; message: string } | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<"run" | "check" | null>(null);

  const problem = sqlProblems[index];
  const code = codes[problem.id] ?? "SELECT * FROM customers;";

  useEffect(() => {
    fetchAsAlumni("/alumni/coding-test/progress")
      .then((r) => (r.ok ? r.json() : { progress: [] }))
      .then((d: { progress?: ProgressRow[] }) => {
        const s: Record<string, boolean> = {};
        const c: Record<string, string> = {};
        for (const row of d.progress ?? []) {
          if (!row.problem_id.startsWith("sql-")) continue;
          s[row.problem_id] = Boolean(row.solved);
          if (row.last_code) c[row.problem_id] = row.last_code;
        }
        setSolved(s);
        setCodes((prev) => ({ ...c, ...prev }));
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const select = (i: number) => {
    setIndex(i);
    setResult(null);
    setFeedback(null);
    setError("");
  };

  const run = async (check: boolean) => {
    setBusy(check ? "check" : "run");
    setError("");
    setFeedback(null);
    try {
      if (check) {
        const r = await checkQuery(code, problem.solution, problem.ordered);
        setResult(r.user);
        setFeedback({ passed: r.passed, message: r.message });
        if (r.passed) setSolved((s) => ({ ...s, [problem.id]: true }));
        fetchAsAlumni("/alumni/coding-test/progress", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ problem_id: problem.id, solved: r.passed, code }),
        }).catch(() => {});
      } else {
        setResult(await runQuery(code));
      }
    } catch (e) {
      setResult(null);
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  };

  const solvedCount = sqlProblems.filter((p) => solved[p.id]).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-foreground">Coding Test SQL</h2>
        <p className="text-sm text-muted-foreground">
          Latihan SQL dengan data toko fiktif. Query dijalankan langsung di browser (SQLite) dan dinilai otomatis. {solvedCount} dari {sqlProblems.length} soal selesai.
        </p>
      </div>

      <div className="grid lg:grid-cols-[260px_1fr] gap-6 items-start">
        <nav aria-label="Daftar soal SQL" className="-mx-4 px-4 lg:mx-0 lg:px-0 overflow-x-auto">
          <ol className="flex lg:flex-col gap-2 w-max lg:w-auto">
            {sqlProblems.map((p, i) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => select(i)}
                  aria-current={i === index ? "true" : undefined}
                  className={cn(
                    "w-full flex items-center gap-2 rounded-md border px-3 py-2 text-left text-sm whitespace-nowrap lg:whitespace-normal",
                    i === index ? "border-primary bg-primary/5" : "bg-background hover:bg-muted"
                  )}
                >
                  <span
                    className={cn(
                      "w-6 h-6 shrink-0 rounded-full flex items-center justify-center text-xs font-semibold",
                      solved[p.id] ? "bg-green-600 text-white" : "bg-secondary"
                    )}
                    aria-hidden
                  >
                    {solved[p.id] ? <Check className="w-3.5 h-3.5" /> : i + 1}
                  </span>
                  <span>
                    <span className="block font-medium">{p.title}</span>
                    <span className="text-xs text-muted-foreground">{p.difficulty}</span>
                    {solved[p.id] && <span className="sr-only"> (selesai)</span>}
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </nav>

        <div className="space-y-4 min-w-0">
          <Card>
            <CardContent className="p-4 space-y-3">
              <p className="text-xs text-muted-foreground">
                Soal {index + 1} · {problem.difficulty}
              </p>
              <h3 className="font-semibold text-foreground">{problem.title}</h3>
              <p
                className="text-sm text-foreground/90 [&_code]:rounded [&_code]:bg-muted [&_code]:px-1"
                dangerouslySetInnerHTML={{
                  __html: problem.description
                    .replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
                    .replace(/`(.+?)`/g, "<code>$1</code>"),
                }}
              />
              <details className="text-sm">
                <summary className="cursor-pointer text-muted-foreground">Lihat tabel yang tersedia</summary>
                <ul className="mt-2 space-y-1 font-mono text-xs">
                  {SQL_TABLES_INFO.map((t) => (
                    <li key={t.name}>
                      <span className="font-semibold">{t.name}</span>({t.columns})
                    </li>
                  ))}
                </ul>
              </details>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <label htmlFor="sql-editor" className="text-sm font-medium">
              Query kamu
            </label>
            <Textarea
              id="sql-editor"
              value={code}
              onChange={(e) => setCodes((c) => ({ ...c, [problem.id]: e.target.value }))}
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                  e.preventDefault();
                  run(false);
                }
              }}
              rows={8}
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
              className="font-mono text-sm"
            />
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className="gap-2" onClick={() => run(false)} disabled={busy !== null}>
                {busy === "run" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />} Jalankan
              </Button>
              <Button size="sm" className="gap-2" onClick={() => run(true)} disabled={busy !== null}>
                {busy === "check" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Cek Jawaban
              </Button>
              <span className="text-xs text-muted-foreground self-center hidden sm:inline">Ctrl + Enter untuk menjalankan</span>
            </div>
          </div>

          {feedback && (
            <p
              role="status"
              className={cn("rounded-md px-3 py-2 text-sm", feedback.passed ? "bg-green-50 text-green-800 border border-green-200" : "bg-amber-50 text-amber-900 border border-amber-200")}
            >
              {feedback.message}
              {feedback.passed && index < sqlProblems.length - 1 && (
                <Button variant="link" size="sm" className="px-1 h-auto" onClick={() => select(index + 1)}>
                  Lanjut ke soal berikutnya
                </Button>
              )}
            </p>
          )}
          {error && (
            <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive font-mono break-words">
              {error}
            </p>
          )}
          {result && <ResultTable result={result} />}
        </div>
      </div>
    </div>
  );
}
