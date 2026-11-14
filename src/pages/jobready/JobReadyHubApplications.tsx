import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useAlumniAuth } from "@/contexts/AlumniAuthContext";
import { cn } from "@/lib/utils";
import { ExternalLink, Pencil, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

interface JobApplication {
  id: number;
  company: string;
  position: string;
  job_url: string | null;
  status: string;
  applied_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// Harus sama dengan VALID_APPLICATION_STATUSES di backend.
const STATUSES: { key: string; label: string; className: string }[] = [
  { key: "saved", label: "Disimpan", className: "bg-muted text-foreground" },
  { key: "applied", label: "Melamar", className: "bg-blue-100 text-blue-800" },
  { key: "interview", label: "Tes / Interview", className: "bg-amber-100 text-amber-800" },
  { key: "offer", label: "Offer", className: "bg-violet-100 text-violet-800" },
  { key: "accepted", label: "Diterima", className: "bg-green-100 text-green-800" },
  { key: "rejected", label: "Ditolak", className: "bg-red-100 text-red-800" },
];
const statusOf = (key: string) => STATUSES.find((s) => s.key === key) ?? STATUSES[1];

const emptyForm = { company: "", position: "", job_url: "", status: "applied", applied_date: "", notes: "" };

function formatDate(value: string | null): string {
  if (!value) return "";
  const d = new Date(value.length === 10 ? `${value}T00:00:00` : value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

export default function JobReadyHubApplications() {
  const { fetchAsAlumni } = useAlumniAuth();
  const [applications, setApplications] = useState<JobApplication[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const load = useCallback(async () => {
    setLoadError(false);
    try {
      const res = await fetchAsAlumni("/alumni/job-applications");
      if (!res.ok) throw new Error();
      setApplications(await res.json());
    } catch {
      setLoadError(true);
      setApplications([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const a of applications ?? []) c[a.status] = (c[a.status] ?? 0) + 1;
    return c;
  }, [applications]);

  const visible = (applications ?? []).filter((a) => filter === "all" || a.status === filter);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm, applied_date: new Date().toISOString().slice(0, 10) });
    setFormError("");
    setDialogOpen(true);
  };

  const openEdit = (a: JobApplication) => {
    setEditingId(a.id);
    setForm({
      company: a.company,
      position: a.position,
      job_url: a.job_url ?? "",
      status: a.status,
      applied_date: a.applied_date ?? "",
      notes: a.notes ?? "",
    });
    setFormError("");
    setDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.company.trim() || !form.position.trim()) {
      setFormError("Posisi dan perusahaan wajib diisi.");
      return;
    }
    if (form.job_url.trim() && !/^https?:\/\//.test(form.job_url.trim())) {
      setFormError("Link lowongan harus diawali https://");
      return;
    }
    setIsSaving(true);
    setFormError("");
    const body = JSON.stringify({
      company: form.company.trim(),
      position: form.position.trim(),
      job_url: form.job_url.trim() || null,
      status: form.status,
      applied_date: form.applied_date || null,
      notes: form.notes.trim() || null,
    });
    try {
      const res = await fetchAsAlumni(editingId ? `/alumni/job-applications/${editingId}` : "/alumni/job-applications", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(typeof data.detail === "string" ? data.detail : "Gagal menyimpan lamaran");
      }
      toast.success(editingId ? "Lamaran diperbarui" : "Lamaran ditambahkan");
      setDialogOpen(false);
      await load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Gagal menyimpan lamaran");
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusChange = async (a: JobApplication, status: string) => {
    const previous = applications;
    setApplications((list) => (list ?? []).map((x) => (x.id === a.id ? { ...x, status } : x)));
    try {
      const res = await fetchAsAlumni(`/alumni/job-applications/${a.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setApplications(previous);
      toast.error("Gagal mengubah status");
    }
  };

  const handleDelete = async (a: JobApplication) => {
    if (!confirm(`Hapus lamaran ${a.position} di ${a.company}?`)) return;
    try {
      const res = await fetchAsAlumni(`/alumni/job-applications/${a.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setApplications((list) => (list ?? []).filter((x) => x.id !== a.id));
      toast.success("Lamaran dihapus");
    } catch {
      toast.error("Gagal menghapus lamaran");
    }
  };

  const total = applications?.length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-foreground">Lamaran Saya</h2>
          <p className="text-sm text-muted-foreground">
            Catat setiap lowongan yang kamu simpan atau lamar, dari platform mana pun, lalu pantau statusnya di sini.
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2 w-fit">
          <Plus className="w-4 h-4" />
          Tambah Lamaran
        </Button>
      </div>

      <div className="-mx-4 px-4 md:mx-0 md:px-0 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex gap-2 w-max" role="tablist" aria-label="Filter status lamaran">
          {[{ key: "all", label: "Semua" }, ...STATUSES].map((s) => {
            const n = s.key === "all" ? total : counts[s.key] ?? 0;
            const active = filter === s.key;
            return (
              <button
                key={s.key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(s.key)}
                className={cn(
                  "whitespace-nowrap rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                  active ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border hover:bg-muted"
                )}
              >
                {s.label} <span className="tabular-nums opacity-70">{n}</span>
              </button>
            );
          })}
        </div>
      </div>

      {applications === null ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : loadError ? (
        <Card>
          <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="text-sm">Gagal memuat daftar lamaran. Periksa koneksi, lalu coba lagi.</p>
            <Button variant="outline" size="sm" onClick={load} className="w-fit">
              Coba lagi
            </Button>
          </CardContent>
        </Card>
      ) : visible.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center space-y-3">
            <p className="font-semibold text-foreground">{total === 0 ? "Belum ada lamaran" : "Tidak ada lamaran dengan status ini"}</p>
            <p className="text-sm text-muted-foreground">
              {total === 0
                ? "Tambahkan lowongan yang sedang kamu incar atau sudah kamu lamar supaya progresmu tercatat."
                : "Pilih filter lain untuk melihat lamaranmu."}
            </p>
            {total === 0 && (
              <Button onClick={openCreate} size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Tambah Lamaran Pertama
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-3">
          {visible.map((a) => {
            const st = statusOf(a.status);
            return (
              <li key={a.id}>
                <Card>
                  <CardContent className="p-4 flex flex-col md:flex-row md:items-center gap-4">
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-foreground break-words">{a.position}</p>
                        <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", st.className)}>{st.label}</span>
                      </div>
                      <p className="text-sm text-muted-foreground break-words">
                        {a.company}
                        {a.applied_date && <> · {formatDate(a.applied_date)}</>}
                      </p>
                      {a.notes && <p className="text-sm text-foreground/80 line-clamp-2 break-words">{a.notes}</p>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Select value={a.status} onValueChange={(v) => handleStatusChange(a, v)}>
                        <SelectTrigger className="w-[160px]" aria-label={`Ubah status ${a.position}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUSES.map((s) => (
                            <SelectItem key={s.key} value={s.key}>
                              {s.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {a.job_url && (
                        <Button variant="ghost" size="icon" asChild>
                          <a href={a.job_url} target="_blank" rel="noopener noreferrer" aria-label="Buka lowongan">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => openEdit(a)} aria-label="Ubah lamaran">
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(a)} aria-label="Hapus lamaran">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Ubah Lamaran" : "Tambah Lamaran"}</DialogTitle>
            <DialogDescription>Isi dari lowongan mana saja, misalnya LinkedIn, Glints, atau situs perusahaan.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="app-position">Posisi</Label>
                <Input id="app-position" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} placeholder="mis. Data Analyst" maxLength={150} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="app-company">Perusahaan</Label>
                <Input id="app-company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Nama perusahaan" maxLength={150} required />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="app-url">Link lowongan (opsional)</Label>
              <Input id="app-url" type="url" inputMode="url" value={form.job_url} onChange={(e) => setForm({ ...form, job_url: e.target.value })} placeholder="https://..." maxLength={500} />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="app-status">Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger id="app-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s.key} value={s.key}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="app-date">Tanggal</Label>
                <Input id="app-date" type="date" value={form.applied_date} onChange={(e) => setForm({ ...form, applied_date: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="app-notes">Catatan (opsional)</Label>
              <Textarea id="app-notes" rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="mis. jadwal tes, nama tahap seleksi, hal yang perlu disiapkan" maxLength={2000} />
            </div>
            {formError && (
              <p role="alert" className="text-sm text-destructive">
                {formError}
              </p>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Menyimpan..." : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
