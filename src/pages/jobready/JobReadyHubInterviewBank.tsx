import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useAlumniAuth } from "@/contexts/AlumniAuthContext";
import { cn } from "@/lib/utils";
import { Check, ChevronDown } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

interface Question {
  id: number;
  role: string;
  category: string;
  question: string;
  tips: string;
  sample_answer: string;
  my_answer: string;
  is_practiced: boolean;
}
const CATEGORY: Record<string, string> = { behavioral: "Behavioral", technical: "Teknis", case: "Studi kasus" };

export default function JobReadyHubInterviewBank() {
  const { fetchAsAlumni } = useAlumniAuth();
  const [items, setItems] = useState<Question[] | null>(null);
  const [error, setError] = useState(false);
  const [role, setRole] = useState("Semua");
  const [category, setCategory] = useState("all");
  const [openId, setOpenId] = useState<number | null>(null);
  const [drafts, setDrafts] = useState<Record<number, string>>({});
  const [savingId, setSavingId] = useState<number | null>(null);

  const load = useCallback(() => {
    setError(false);
    fetchAsAlumni("/alumni/interview-bank")
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((d) => setItems(d.questions ?? []))
      .catch(() => setError(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const roles = useMemo(() => ["Semua", ...Array.from(new Set((items ?? []).map((q) => q.role)))], [items]);
  const visible = (items ?? []).filter((q) => (role === "Semua" || q.role === role) && (category === "all" || q.category === category));
  const practiced = (items ?? []).filter((q) => q.is_practiced).length;

  const save = async (q: Question, patch: { answer?: string; is_practiced?: boolean }) => {
    setSavingId(q.id);
    try {
      const res = await fetchAsAlumni(`/alumni/interview-bank/${q.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error();
      const d = await res.json();
      setItems((list) => (list ?? []).map((x) => (x.id === q.id ? { ...x, my_answer: d.answer, is_practiced: d.is_practiced } : x)));
      if (patch.answer !== undefined) toast.success("Jawaban latihan disimpan");
    } catch {
      toast.error("Gagal menyimpan");
    } finally {
      setSavingId(null);
    }
  };

  const chip = (active: boolean) =>
    cn("whitespace-nowrap rounded-full border px-3 py-1.5 text-sm", active ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-muted");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-foreground">Bank Pertanyaan Interview</h2>
        <p className="text-sm text-muted-foreground">
          Pertanyaan yang sering muncul per posisi, lengkap dengan tips. Untuk pertanyaan behavioral, susun jawaban dengan metode STAR: Situation, Task, Action,
          Result. {items ? `${practiced} dari ${items.length} sudah kamu latih.` : ""}
        </p>
      </div>

      {error ? (
        <Card>
          <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="text-sm">Gagal memuat pertanyaan. Periksa koneksi, lalu coba lagi.</p>
            <Button variant="outline" size="sm" onClick={load} className="w-fit">
              Coba lagi
            </Button>
          </CardContent>
        </Card>
      ) : items === null ? (
        <Skeleton className="h-48 w-full" />
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-sm text-muted-foreground">Bank pertanyaan sedang disiapkan tim Intelligo.</CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-2">
            <div className="-mx-4 px-4 md:mx-0 md:px-0 overflow-x-auto">
              <div className="flex gap-2 w-max" role="group" aria-label="Filter posisi">
                {roles.map((r) => (
                  <button key={r} type="button" aria-pressed={role === r} onClick={() => setRole(r)} className={chip(role === r)}>
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <div className="-mx-4 px-4 md:mx-0 md:px-0 overflow-x-auto">
              <div className="flex gap-2 w-max" role="group" aria-label="Filter kategori">
                {[["all", "Semua kategori"], ...Object.entries(CATEGORY)].map(([k, v]) => (
                  <button key={k} type="button" aria-pressed={category === k} onClick={() => setCategory(k)} className={chip(category === k)}>
                    {v}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {visible.length === 0 ? (
            <p className="text-sm text-muted-foreground">Tidak ada pertanyaan untuk filter ini.</p>
          ) : (
            <ul className="space-y-2">
              {visible.map((q) => {
                const open = openId === q.id;
                const draft = drafts[q.id] ?? q.my_answer;
                return (
                  <li key={q.id}>
                    <Card>
                      <button
                        type="button"
                        aria-expanded={open}
                        onClick={() => setOpenId(open ? null : q.id)}
                        className="w-full flex items-start gap-3 p-4 text-left"
                      >
                        <span
                          className={cn(
                            "mt-0.5 w-5 h-5 shrink-0 rounded-full border flex items-center justify-center",
                            q.is_practiced ? "bg-green-600 border-green-600 text-white" : "border-border"
                          )}
                          aria-hidden
                        >
                          {q.is_practiced && <Check className="w-3 h-3" />}
                        </span>
                        <span className="flex-1 min-w-0">
                          <span className="block text-xs text-muted-foreground">
                            {q.role} · {CATEGORY[q.category] ?? q.category}
                          </span>
                          <span className="block font-medium text-foreground">{q.question}</span>
                        </span>
                        <ChevronDown className={cn("w-4 h-4 mt-1 shrink-0 transition-transform", open && "rotate-180")} aria-hidden />
                      </button>
                      {open && (
                        <CardContent className="pt-0 px-4 pb-4 space-y-3">
                          {q.tips && (
                            <div>
                              <p className="text-xs font-semibold text-muted-foreground">Tips</p>
                              <p className="text-sm whitespace-pre-line">{q.tips}</p>
                            </div>
                          )}
                          {q.sample_answer && (
                            <div className="rounded-md bg-muted/50 p-3">
                              <p className="text-xs font-semibold text-muted-foreground">Contoh kerangka jawaban</p>
                              <p className="text-sm whitespace-pre-line">{q.sample_answer}</p>
                            </div>
                          )}
                          <div className="space-y-1.5">
                            <label htmlFor={`ans-${q.id}`} className="text-sm font-medium">
                              Jawaban latihanmu (hanya kamu yang bisa melihat)
                            </label>
                            <Textarea
                              id={`ans-${q.id}`}
                              rows={4}
                              maxLength={5000}
                              value={draft}
                              onChange={(e) => setDrafts((d) => ({ ...d, [q.id]: e.target.value }))}
                              placeholder="Tulis poin-poin jawabanmu di sini"
                            />
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Button size="sm" disabled={savingId === q.id || draft === q.my_answer} onClick={() => save(q, { answer: draft })}>
                              Simpan jawaban
                            </Button>
                            <Button size="sm" variant="outline" disabled={savingId === q.id} onClick={() => save(q, { is_practiced: !q.is_practiced })}>
                              {q.is_practiced ? "Tandai belum dilatih" : "Tandai sudah dilatih"}
                            </Button>
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
