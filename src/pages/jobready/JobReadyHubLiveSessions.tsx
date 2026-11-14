import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAlumniAuth } from "@/contexts/AlumniAuthContext";
import { cn } from "@/lib/utils";
import { CalendarPlus, ChevronLeft, ChevronRight, ExternalLink, Video } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

interface LiveSession {
  id: number;
  title: string;
  description: string;
  speaker: string;
  start_at: string;
  duration_minutes: number;
  meeting_url: string | null;
  recording_url: string | null;
  is_cancelled: boolean;
  rsvp_count: number;
  is_rsvp: boolean;
}

const TZ = "Asia/Jakarta";
const WEEKDAYS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

/** Tanggal (YYYY-MM-DD) dalam WIB. */
const wibDay = (d: Date) => new Date(d.getTime() + 7 * 3_600_000).toISOString().slice(0, 10);
const fmtDate = (d: Date) => d.toLocaleDateString("id-ID", { timeZone: TZ, weekday: "long", day: "numeric", month: "long", year: "numeric" });
const fmtTime = (d: Date) => d.toLocaleTimeString("id-ID", { timeZone: TZ, hour: "2-digit", minute: "2-digit" });

function googleCalendarUrl(s: LiveSession): string {
  const start = new Date(s.start_at);
  const end = new Date(start.getTime() + s.duration_minutes * 60_000);
  const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const details = [s.description, s.speaker ? `Pemateri: ${s.speaker}` : "", s.meeting_url ? `Link: ${s.meeting_url}` : ""].filter(Boolean).join("\n\n");
  const params = new URLSearchParams({ action: "TEMPLATE", text: `${s.title} - Live Session Job Ready Intelligo`, dates: `${stamp(start)}/${stamp(end)}`, details });
  if (s.meeting_url) params.set("location", s.meeting_url);
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export default function JobReadyHubLiveSessions() {
  const { fetchAsAlumni } = useAlumniAuth();
  const [sessions, setSessions] = useState<LiveSession[] | null>(null);
  const [error, setError] = useState(false);
  const [month, setMonth] = useState(() => {
    const today = wibDay(new Date());
    return today.slice(0, 7); // YYYY-MM
  });
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = useCallback(() => {
    setError(false);
    fetchAsAlumni("/alumni/live-sessions")
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((d) => setSessions(d.sessions ?? []))
      .catch(() => setError(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const now = Date.now();
  const byDay = useMemo(() => {
    const map: Record<string, LiveSession[]> = {};
    for (const s of sessions ?? []) (map[wibDay(new Date(s.start_at))] ??= []).push(s);
    return map;
  }, [sessions]);

  const upcoming = (sessions ?? []).filter((s) => new Date(s.start_at).getTime() + s.duration_minutes * 60_000 >= now);
  const past = (sessions ?? []).filter((s) => new Date(s.start_at).getTime() + s.duration_minutes * 60_000 < now).reverse();
  const listed = selectedDay ? byDay[selectedDay] ?? [] : upcoming;

  // Grid kalender (Senin sebagai hari pertama).
  const [y, m] = month.split("-").map(Number);
  const first = new Date(Date.UTC(y, m - 1, 1));
  const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const offset = (first.getUTCDay() + 6) % 7;
  const today = wibDay(new Date());
  const monthLabel = first.toLocaleDateString("id-ID", { month: "long", year: "numeric", timeZone: "UTC" });
  const shiftMonth = (delta: number) => {
    const d = new Date(Date.UTC(y, m - 1 + delta, 1));
    setMonth(d.toISOString().slice(0, 7));
    setSelectedDay(null);
  };

  const toggleRsvp = async (s: LiveSession) => {
    setBusyId(s.id);
    try {
      const res = await fetchAsAlumni(`/alumni/live-sessions/${s.id}/rsvp`, { method: s.is_rsvp ? "DELETE" : "POST" });
      if (!res.ok) throw new Error();
      setSessions((list) =>
        (list ?? []).map((x) => (x.id === s.id ? { ...x, is_rsvp: !s.is_rsvp, rsvp_count: x.rsvp_count + (s.is_rsvp ? -1 : 1) } : x))
      );
      toast.success(s.is_rsvp ? "Kehadiran dibatalkan" : "Kamu tercatat ikut sesi ini");
    } catch {
      toast.error("Gagal menyimpan kehadiran");
    } finally {
      setBusyId(null);
    }
  };

  const renderSession = (s: LiveSession, isPast: boolean) => {
    const start = new Date(s.start_at);
    const end = new Date(start.getTime() + s.duration_minutes * 60_000);
    const live = start.getTime() - 15 * 60_000 <= now && now <= end.getTime();
    return (
      <li key={s.id}>
        <Card className={cn(s.is_cancelled && "opacity-70")}>
          <CardContent className="p-4 space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">
                  {fmtDate(start)}, {fmtTime(start)} - {fmtTime(end)} WIB
                </p>
                <p className="font-semibold text-foreground break-words">{s.title}</p>
                {s.speaker && <p className="text-sm text-muted-foreground">Pemateri: {s.speaker}</p>}
              </div>
              {s.is_cancelled ? (
                <span className="rounded-full bg-red-100 text-red-800 px-2 py-0.5 text-xs font-medium">Dibatalkan</span>
              ) : live ? (
                <span className="rounded-full bg-green-100 text-green-800 px-2 py-0.5 text-xs font-medium">Sedang berlangsung</span>
              ) : s.is_rsvp && !isPast ? (
                <span className="rounded-full bg-blue-100 text-blue-800 px-2 py-0.5 text-xs font-medium">Kamu ikut</span>
              ) : null}
            </div>
            {s.description && <p className="text-sm text-foreground/80 whitespace-pre-line">{s.description}</p>}
            {!s.is_cancelled && (
              <div className="flex flex-wrap gap-2">
                {isPast ? (
                  s.recording_url ? (
                    <Button asChild size="sm" className="gap-2">
                      <a href={s.recording_url} target="_blank" rel="noopener noreferrer">
                        <Video className="w-4 h-4" /> Tonton rekaman
                      </a>
                    </Button>
                  ) : (
                    <p className="text-xs text-muted-foreground">Rekaman belum tersedia.</p>
                  )
                ) : (
                  <>
                    {s.meeting_url && live && (
                      <Button asChild size="sm" className="gap-2">
                        <a href={s.meeting_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4" /> Gabung sekarang
                        </a>
                      </Button>
                    )}
                    <Button size="sm" variant={s.is_rsvp ? "outline" : "default"} disabled={busyId === s.id} onClick={() => toggleRsvp(s)}>
                      {s.is_rsvp ? "Batal ikut" : "Saya ikut"}
                    </Button>
                    <Button asChild size="sm" variant="outline" className="gap-2">
                      <a href={googleCalendarUrl(s)} target="_blank" rel="noopener noreferrer">
                        <CalendarPlus className="w-4 h-4" /> Tambah ke Google Calendar
                      </a>
                    </Button>
                    {s.meeting_url && !live && (
                      <Button asChild size="sm" variant="ghost" className="gap-2">
                        <a href={s.meeting_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4" /> Link meeting
                        </a>
                      </Button>
                    )}
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </li>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-foreground">Live Session</h2>
        <p className="text-sm text-muted-foreground">Kelas live gratis untuk alumni Job Ready. Semua waktu dalam WIB.</p>
      </div>

      {error ? (
        <Card>
          <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="text-sm">Gagal memuat jadwal. Periksa koneksi, lalu coba lagi.</p>
            <Button variant="outline" size="sm" onClick={load} className="w-fit">
              Coba lagi
            </Button>
          </CardContent>
        </Card>
      ) : sessions === null ? (
        <Skeleton className="h-72 w-full" />
      ) : (
        <div className="grid lg:grid-cols-[320px_1fr] gap-6 items-start">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <Button variant="ghost" size="icon" onClick={() => shiftMonth(-1)} aria-label="Bulan sebelumnya">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <p className="font-semibold capitalize" aria-live="polite">
                  {monthLabel}
                </p>
                <Button variant="ghost" size="icon" onClick={() => shiftMonth(1)} aria-label="Bulan berikutnya">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground mb-1">
                {WEEKDAYS.map((d) => (
                  <span key={d}>{d}</span>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: offset }).map((_, i) => (
                  <span key={`e${i}`} />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = `${month}-${String(i + 1).padStart(2, "0")}`;
                  const has = byDay[day]?.some((s) => !s.is_cancelled);
                  const selected = selectedDay === day;
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => setSelectedDay(selected ? null : day)}
                      aria-pressed={selected}
                      aria-label={`${i + 1} ${monthLabel}${has ? ", ada sesi" : ""}`}
                      className={cn(
                        "relative aspect-square rounded-md text-sm tabular-nums transition-colors",
                        selected ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                        day === today && !selected && "ring-1 ring-primary"
                      )}
                    >
                      {i + 1}
                      {has && <span className={cn("absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full", selected ? "bg-primary-foreground" : "bg-accent")} />}
                    </button>
                  );
                })}
              </div>
              {selectedDay && (
                <Button variant="link" size="sm" className="px-0 mt-2" onClick={() => setSelectedDay(null)}>
                  Tampilkan semua sesi mendatang
                </Button>
              )}
            </CardContent>
          </Card>

          <div className="space-y-6 min-w-0">
            <section className="space-y-3">
              <h3 className="text-base font-semibold">
                {selectedDay ? `Sesi ${fmtDate(new Date(`${selectedDay}T12:00:00+07:00`))}` : "Sesi mendatang"}
              </h3>
              {listed.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {selectedDay ? "Tidak ada sesi di tanggal ini." : "Belum ada sesi terjadwal. Jadwal baru akan diumumkan di sini."}
                </p>
              ) : (
                <ul className="space-y-3">{listed.map((s) => renderSession(s, new Date(s.start_at).getTime() + s.duration_minutes * 60_000 < now))}</ul>
              )}
            </section>
            {!selectedDay && past.length > 0 && (
              <section className="space-y-3">
                <h3 className="text-base font-semibold">Sesi sebelumnya</h3>
                <ul className="space-y-3">{past.slice(0, 10).map((s) => renderSession(s, true))}</ul>
              </section>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
