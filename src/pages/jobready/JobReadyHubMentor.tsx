import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useAlumniAuth } from "@/contexts/AlumniAuthContext";
import { cn } from "@/lib/utils";
import { CalendarPlus, ExternalLink } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

interface Slot {
  id: number;
  mentor_name: string;
  start_at: string;
  duration_minutes: number;
  topics: string[];
}
interface Booking {
  id: number;
  topic: string;
  notes: string;
  status: string;
  mentor_name: string;
  start_at: string;
  duration_minutes: number;
  meeting_url: string | null;
}

const TZ = "Asia/Jakarta";
const fmtDay = (d: Date) => d.toLocaleDateString("id-ID", { timeZone: TZ, weekday: "long", day: "numeric", month: "long" });
const fmtTime = (d: Date) => d.toLocaleTimeString("id-ID", { timeZone: TZ, hour: "2-digit", minute: "2-digit" });
const wibDay = (d: Date) => new Date(d.getTime() + 7 * 3_600_000).toISOString().slice(0, 10);
const STATUS_LABEL: Record<string, string> = { booked: "Terjadwal", done: "Selesai", no_show: "Tidak hadir", cancelled: "Dibatalkan" };

function calendarUrl(b: Booking) {
  const start = new Date(b.start_at);
  const end = new Date(start.getTime() + b.duration_minutes * 60_000);
  const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `Sesi mentor ${b.topic} - Job Ready Intelligo`,
    dates: `${stamp(start)}/${stamp(end)}`,
    details: [`Mentor: ${b.mentor_name}`, b.meeting_url ? `Link: ${b.meeting_url}` : ""].filter(Boolean).join("\n"),
  });
  if (b.meeting_url) params.set("location", b.meeting_url);
  return `https://calendar.google.com/calendar/render?${params}`;
}

export default function JobReadyHubMentor() {
  const { fetchAsAlumni } = useAlumniAuth();
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [error, setError] = useState(false);
  const [picked, setPicked] = useState<Slot | null>(null);
  const [topic, setTopic] = useState("");
  const [notes, setNotes] = useState("");
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    setError(false);
    Promise.all([
      fetchAsAlumni("/alumni/mentor-slots").then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      }),
      fetchAsAlumni("/alumni/mentor-bookings").then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      }),
    ])
      .then(([s, b]) => {
        setSlots(s.slots ?? []);
        setBookings(b.bookings ?? []);
      })
      .catch(() => setError(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const now = Date.now();
  const upcoming = (bookings ?? []).find((b) => b.status === "booked" && new Date(b.start_at).getTime() + b.duration_minutes * 60_000 > now);
  const history = (bookings ?? []).filter((b) => b !== upcoming);
  const grouped = useMemo(() => {
    const map = new Map<string, Slot[]>();
    for (const s of slots ?? []) {
      const key = wibDay(new Date(s.start_at));
      map.set(key, [...(map.get(key) ?? []), s]);
    }
    return [...map.entries()];
  }, [slots]);

  const openBook = (s: Slot) => {
    setPicked(s);
    setTopic(s.topics[0] ?? "");
    setNotes("");
    setFormError("");
  };

  const book = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!picked) return;
    setBusy(true);
    setFormError("");
    try {
      const res = await fetchAsAlumni(`/alumni/mentor-slots/${picked.id}/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, notes }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(typeof d.detail === "string" ? d.detail : "Gagal memesan sesi");
      }
      toast.success("Sesi mentor berhasil dipesan");
      setPicked(null);
      load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Gagal memesan sesi");
      load();
    } finally {
      setBusy(false);
    }
  };

  const cancel = async (b: Booking) => {
    if (!confirm("Batalkan sesi mentor ini? Slot akan dibuka lagi untuk alumni lain.")) return;
    const res = await fetchAsAlumni(`/alumni/mentor-bookings/${b.id}/cancel`, { method: "POST" });
    if (!res.ok) return toast.error("Gagal membatalkan sesi");
    toast.success("Sesi dibatalkan");
    load();
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-sm">Gagal memuat jadwal mentor. Periksa koneksi, lalu coba lagi.</p>
          <Button variant="outline" size="sm" onClick={load} className="w-fit">
            Coba lagi
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-foreground">Sesi Mentor</h2>
        <p className="text-sm text-muted-foreground">
          Pesan sesi 1-on-1 dengan mentor Intelligo untuk review CV, mock interview, atau konsultasi karier. Satu sesi mendatang per alumni. Waktu dalam WIB.
        </p>
      </div>

      {bookings === null || slots === null ? (
        <Skeleton className="h-48 w-full" />
      ) : (
        <>
          <section className="space-y-3">
            <h3 className="text-base font-semibold">Sesi kamu</h3>
            {upcoming ? (
              <Card className="border-primary/30">
                <CardContent className="p-4 space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {fmtDay(new Date(upcoming.start_at))}, {fmtTime(new Date(upcoming.start_at))} WIB · {upcoming.duration_minutes} menit
                    </p>
                    <p className="font-semibold text-foreground">
                      {upcoming.topic} bersama {upcoming.mentor_name}
                    </p>
                    {upcoming.notes && <p className="text-sm text-muted-foreground">Catatanmu: {upcoming.notes}</p>}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {upcoming.meeting_url ? (
                      <Button asChild size="sm" className="gap-2">
                        <a href={upcoming.meeting_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4" /> Link meeting
                        </a>
                      </Button>
                    ) : (
                      <p className="text-xs text-muted-foreground self-center">Link meeting akan dikirim tim Intelligo.</p>
                    )}
                    <Button asChild size="sm" variant="outline" className="gap-2">
                      <a href={calendarUrl(upcoming)} target="_blank" rel="noopener noreferrer">
                        <CalendarPlus className="w-4 h-4" /> Tambah ke Google Calendar
                      </a>
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => cancel(upcoming)}>
                      Batalkan
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <p className="text-sm text-muted-foreground">Belum ada sesi terjadwal. Pilih slot di bawah.</p>
            )}
          </section>

          <section className="space-y-3">
            <h3 className="text-base font-semibold">Slot tersedia</h3>
            {grouped.length === 0 ? (
              <p className="text-sm text-muted-foreground">Belum ada slot terbuka. Slot baru akan muncul di sini.</p>
            ) : (
              grouped.map(([day, list]) => (
                <div key={day} className="space-y-2">
                  <p className="text-sm font-medium text-foreground capitalize">{fmtDay(new Date(`${day}T12:00:00+07:00`))}</p>
                  <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {list.map((s) => (
                      <li key={s.id}>
                        <Card>
                          <CardContent className="p-3 flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <p className="font-semibold tabular-nums">
                                {fmtTime(new Date(s.start_at))} <span className="text-xs font-normal text-muted-foreground">· {s.duration_minutes} menit</span>
                              </p>
                              <p className="text-sm text-muted-foreground truncate">{s.mentor_name}</p>
                              <p className="text-xs text-muted-foreground truncate">{s.topics.join(", ")}</p>
                            </div>
                            <Button size="sm" disabled={Boolean(upcoming)} onClick={() => openBook(s)} className="shrink-0">
                              Pesan
                            </Button>
                          </CardContent>
                        </Card>
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            )}
            {upcoming && grouped.length > 0 && (
              <p className="text-xs text-muted-foreground">Kamu sudah punya sesi mendatang. Batalkan dulu kalau ingin ganti jadwal.</p>
            )}
          </section>

          {history.length > 0 && (
            <section className="space-y-2">
              <h3 className="text-base font-semibold">Riwayat</h3>
              <ul className="space-y-2">
                {history.slice(0, 10).map((b) => (
                  <li key={b.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-background p-3 text-sm">
                    <span className="min-w-0">
                      {fmtDay(new Date(b.start_at))}, {fmtTime(new Date(b.start_at))} · {b.topic} · {b.mentor_name}
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs font-medium",
                        b.status === "done" ? "bg-green-100 text-green-800" : b.status === "cancelled" ? "bg-muted text-muted-foreground" : "bg-amber-100 text-amber-800"
                      )}
                    >
                      {STATUS_LABEL[b.status] ?? b.status}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}

      <Dialog open={picked !== null} onOpenChange={(o) => !o && setPicked(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Pesan sesi mentor</DialogTitle>
            {picked && (
              <DialogDescription>
                {fmtDay(new Date(picked.start_at))}, {fmtTime(new Date(picked.start_at))} WIB · {picked.duration_minutes} menit bersama {picked.mentor_name}
              </DialogDescription>
            )}
          </DialogHeader>
          {picked && (
            <form onSubmit={book} className="space-y-4">
              <fieldset className="space-y-2">
                <legend className="text-sm font-medium">Topik</legend>
                <div className="flex flex-wrap gap-2">
                  {picked.topics.map((t) => (
                    <button
                      key={t}
                      type="button"
                      aria-pressed={topic === t}
                      onClick={() => setTopic(t)}
                      className={cn("rounded-full border px-3 py-1.5 text-sm", topic === t ? "bg-primary text-primary-foreground border-primary" : "hover:bg-muted")}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </fieldset>
              <div className="space-y-1.5">
                <Label htmlFor="mentor-notes">Yang ingin dibahas (opsional)</Label>
                <Textarea
                  id="mentor-notes"
                  rows={3}
                  maxLength={1000}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="mis. CV untuk posisi Data Analyst, link CV di Google Drive"
                />
              </div>
              {formError && (
                <p role="alert" className="text-sm text-destructive">
                  {formError}
                </p>
              )}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setPicked(null)}>
                  Batal
                </Button>
                <Button type="submit" disabled={busy || !topic}>
                  {busy ? "Memesan..." : "Pesan sesi"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
