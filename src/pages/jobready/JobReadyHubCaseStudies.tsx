import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useAlumniAuth } from "@/contexts/AlumniAuthContext";
import { cn } from "@/lib/utils";
import { ArrowLeft, Check, Download } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

interface CaseStudy {
  id: number;
  title: string;
  role: string;
  difficulty: string;
  estimated_hours: number | null;
  brief: string;
  dataset_url: string | null;
  deliverables: string;
  rubric: string[];
  my_status: "in_progress" | "submitted" | null;
  submission_url: string | null;
  my_notes: string;
  rubric_checked: number[];
}

const statusBadge = (s: CaseStudy["my_status"]) =>
  s === "submitted" ? { label: "Selesai", cls: "bg-green-100 text-green-800" } : s === "in_progress" ? { label: "Dikerjakan", cls: "bg-amber-100 text-amber-800" } : null;

export default function JobReadyHubCaseStudies() {
  const { fetchAsAlumni } = useAlumniAuth();
  const [cases, setCases] = useState<CaseStudy[] | null>(null);
  const [error, setError] = useState(false);
  const [openId, setOpenId] = useState<number | null>(null);
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    setError(false);
    fetchAsAlumni("/alumni/case-studies")
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((d) => setCases(d.cases ?? []))
      .catch(() => setError(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const current = cases?.find((c) => c.id === openId) ?? null;

  const open = (c: CaseStudy) => {
    setOpenId(c.id);
    setUrl(c.submission_url ?? "");
    setNotes(c.my_notes);
    setFormError("");
  };

  const save = async (patch: Record<string, unknown>, successMsg?: string) => {
    if (!current) return;
    setBusy(true);
    setFormError("");
    try {
      const res = await fetchAsAlumni(`/alumni/case-studies/${current.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(typeof d.detail === "string" ? d.detail : "Gagal menyimpan");
      setCases((list) => (list ?? []).map((c) => (c.id === current.id ? { ...c, ...d } : c)));
      if (successMsg) toast.success(successMsg);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Gagal menyimpan");
    } finally {
      setBusy(false);
    }
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-sm">Gagal memuat studi kasus. Periksa koneksi, lalu coba lagi.</p>
          <Button variant="outline" size="sm" onClick={load} className="w-fit">
            Coba lagi
          </Button>
        </CardContent>
      </Card>
    );
  }
  if (cases === null) return <Skeleton className="h-48 w-full" />;

  if (current) {
    const toggleRubric = (i: number) => {
      const next = current.rubric_checked.includes(i) ? current.rubric_checked.filter((x) => x !== i) : [...current.rubric_checked, i];
      save({ rubric_checked: next });
    };
    return (
      <div className="space-y-5 max-w-3xl">
        <button type="button" onClick={() => setOpenId(null)} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Semua studi kasus
        </button>
        <div>
          <p className="text-xs text-muted-foreground">
            {current.role} · {current.difficulty}
            {current.estimated_hours ? ` · sekitar ${current.estimated_hours} jam` : ""}
          </p>
          <h2 className="text-lg font-bold text-foreground">{current.title}</h2>
        </div>
        <Card>
          <CardContent className="p-4 space-y-4">
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Konteks</p>
              <p className="text-sm whitespace-pre-line">{current.brief}</p>
            </div>
            {current.deliverables && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground">Yang dikumpulkan</p>
                <p className="text-sm whitespace-pre-line">{current.deliverables}</p>
              </div>
            )}
            {current.dataset_url ? (
              <Button asChild size="sm" variant="outline" className="gap-2">
                <a href={current.dataset_url} target="_blank" rel="noopener noreferrer">
                  <Download className="w-4 h-4" /> Unduh dataset
                </a>
              </Button>
            ) : (
              <p className="text-xs text-muted-foreground">Dataset sedang disiapkan tim Intelligo.</p>
            )}
          </CardContent>
        </Card>

        {current.rubric.length > 0 && (
          <Card>
            <CardContent className="p-4 space-y-2">
              <p className="font-semibold text-sm">Rubrik penilaian mandiri</p>
              <p className="text-xs text-muted-foreground">Centang kriteria yang menurutmu sudah terpenuhi di hasil kerjamu.</p>
              <ul className="space-y-1">
                {current.rubric.map((r, i) => {
                  const on = current.rubric_checked.includes(i);
                  return (
                    <li key={i}>
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={on}
                        disabled={busy}
                        onClick={() => toggleRubric(i)}
                        className="w-full flex items-start gap-3 rounded-md p-2 text-left text-sm hover:bg-muted"
                      >
                        <span className={cn("mt-0.5 w-5 h-5 shrink-0 rounded border flex items-center justify-center", on ? "bg-green-600 border-green-600 text-white" : "border-border")}>
                          {on && <Check className="w-3 h-3" />}
                        </span>
                        {r}
                      </button>
                    </li>
                  );
                })}
              </ul>
              <p className="text-xs text-muted-foreground tabular-nums">
                {current.rubric_checked.length} dari {current.rubric.length} kriteria
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-4 space-y-3">
            <p className="font-semibold text-sm">Hasil kerjamu</p>
            <div className="space-y-1.5">
              <label htmlFor="case-url" className="text-sm">
                Link hasil kerja (GitHub, Google Drive, Looker Studio, dan sebagainya)
              </label>
              <Input id="case-url" type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="case-notes" className="text-sm">
                Catatan (opsional)
              </label>
              <Textarea id="case-notes" rows={3} maxLength={3000} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
            {formError && (
              <p role="alert" className="text-sm text-destructive">
                {formError}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" disabled={busy} onClick={() => save({ submission_url: url.trim() || null, notes, status: "in_progress" }, "Progres disimpan")}>
                Simpan progres
              </Button>
              <Button size="sm" disabled={busy || !url.trim()} onClick={() => save({ submission_url: url.trim(), notes, status: "submitted" }, "Studi kasus ditandai selesai")}>
                Tandai selesai
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Link hasil kerja bisa dilihat tim Intelligo untuk bahan review saat sesi mentor.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-foreground">Studi Kasus</h2>
        <p className="text-sm text-muted-foreground">
          Latihan tugas take-home seperti di proses rekrutmen: kerjakan dengan dataset yang disediakan, nilai sendiri dengan rubrik, lalu simpan link hasil
          kerjamu. Hasilnya bisa jadi bahan portofolio.
        </p>
      </div>
      {cases.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-sm text-muted-foreground">Studi kasus sedang disiapkan tim Intelligo.</CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {cases.map((c) => {
            const b = statusBadge(c.my_status);
            return (
              <Card key={c.id} className="flex flex-col">
                <CardContent className="p-4 flex flex-col gap-2 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs text-muted-foreground">
                      {c.role} · {c.difficulty}
                      {c.estimated_hours ? ` · sekitar ${c.estimated_hours} jam` : ""}
                    </p>
                    {b && <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", b.cls)}>{b.label}</span>}
                  </div>
                  <p className="font-semibold text-foreground">{c.title}</p>
                  <p className="text-sm text-muted-foreground line-clamp-3 flex-1">{c.brief}</p>
                  <Button size="sm" className="w-fit mt-2" onClick={() => open(c)}>
                    {c.my_status ? "Lanjutkan" : "Lihat soal"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
