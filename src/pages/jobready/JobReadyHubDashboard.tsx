import Announcements from "@/components/jobready/Announcements";
import WeeklyTarget from "@/components/jobready/WeeklyTarget";
import { hubNavGroups } from "@/components/JobReadyHubLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useAlumniAuth } from "@/contexts/AlumniAuthContext";
import { useJobReadyHubFeatures } from "@/hooks/use-job-ready-hub-features";
import { cn } from "@/lib/utils";
import { ArrowRight, CalendarDays, Check, UserRoundCheck } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

const PROFILE_FIELDS: { key: string; label: string }[] = [
  { key: "target_role", label: "posisi yang dituju" },
  { key: "target_industry", label: "industri" },
  { key: "key_skills", label: "skill utama" },
  { key: "linkedin_url", label: "link LinkedIn" },
  { key: "bio", label: "bio singkat" },
];

interface DashboardData {
  profile: Record<string, unknown>;
  readinessPercent: number;
  hasCv: boolean;
  hasInterview: boolean;
}
interface AgendaItem {
  kind: "live" | "mentor";
  title: string;
  start: Date;
  to: string;
}

const filled = (v: unknown) => (typeof v === "string" ? v.trim().length > 0 : v !== null && v !== undefined);
const fmtAgenda = (d: Date) =>
  d.toLocaleString("id-ID", { timeZone: "Asia/Jakarta", weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) + " WIB";

async function getJson(res: Response) {
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export default function JobReadyHubDashboard() {
  const { fetchAsAlumni, alumnus } = useAlumniAuth();
  const { isEnabled, loading: featuresLoading } = useJobReadyHubFeatures();
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState(false);
  const [agenda, setAgenda] = useState<AgendaItem[] | null>(null);

  const load = useCallback(() => {
    setError(false);
    setData(null);
    Promise.all([
      fetchAsAlumni("/alumni/profile").then(getJson),
      fetchAsAlumni("/alumni/readiness").then(getJson),
      fetchAsAlumni("/alumni/cv").then((r) => (r.ok ? r.json() : { cv_data: {} })),
      fetchAsAlumni("/alumni/interview/attempts").then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([profile, readiness, cv, attempts]) => {
        const items = Object.values(readiness || {}) as { is_checked: boolean }[];
        const checked = items.filter((i) => i.is_checked).length;
        const cvData = (cv?.cv_data || {}) as Record<string, unknown>;
        setData({
          profile: profile || {},
          readinessPercent: items.length ? Math.round((checked / items.length) * 100) : 0,
          hasCv: Object.values(cvData).some((v) => (Array.isArray(v) ? v.length > 0 : filled(v) && v !== "")),
          hasInterview: Array.isArray(attempts) && attempts.length > 0,
        });
      })
      .catch(() => setError(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Agenda terdekat: live session yang diikuti/terbuka dan sesi mentor yang dipesan.
  useEffect(() => {
    if (featuresLoading) return;
    const wantLive = isEnabled("live-session");
    const wantMentor = isEnabled("mentor-session");
    if (!wantLive && !wantMentor) {
      setAgenda([]);
      return;
    }
    const now = Date.now();
    Promise.all([
      wantLive ? fetchAsAlumni("/alumni/live-sessions").then((r) => (r.ok ? r.json() : { sessions: [] })) : { sessions: [] },
      wantMentor ? fetchAsAlumni("/alumni/mentor-bookings").then((r) => (r.ok ? r.json() : { bookings: [] })) : { bookings: [] },
    ])
      .then(([live, mentor]) => {
        const items: AgendaItem[] = [
          ...(live.sessions ?? [])
            .filter((s: { is_cancelled: boolean; start_at: string }) => !s.is_cancelled && new Date(s.start_at).getTime() > now)
            .map((s: { title: string; start_at: string }) => ({ kind: "live" as const, title: s.title, start: new Date(s.start_at), to: "/live-sessions" })),
          ...(mentor.bookings ?? [])
            .filter((b: { status: string; start_at: string }) => b.status === "booked" && new Date(b.start_at).getTime() > now)
            .map((b: { topic: string; mentor_name: string; start_at: string }) => ({
              kind: "mentor" as const,
              title: `${b.topic} bersama ${b.mentor_name}`,
              start: new Date(b.start_at),
              to: "/mentor",
            })),
        ];
        setAgenda(items.sort((a, b) => a.start.getTime() - b.start.getTime()).slice(0, 3));
      })
      .catch(() => setAgenda([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [featuresLoading]);

  const missingFields = data ? PROFILE_FIELDS.filter((f) => !filled(data.profile[f.key])) : [];
  const profilePercent = data ? Math.round(((PROFILE_FIELDS.length - missingFields.length) / PROFILE_FIELDS.length) * 100) : 0;

  const steps = [
    { title: "Lengkapi profil karier", description: "Tentukan posisi yang dituju dan skill utama kamu.", done: Boolean(data) && missingFields.length === 0, to: "/profile", cta: "Lengkapi Profil", featureKey: "profile" },
    { title: "Siapkan CV", description: "Buat CV dengan CV Builder, lalu cek dengan CV Analyzer.", done: Boolean(data?.hasCv), to: "/cv-builder", cta: "Buat CV", featureKey: "cv-builder" },
    { title: "Latihan interview", description: "Jawab pertanyaan interview dan dapatkan feedback dari AI.", done: Boolean(data?.hasInterview), to: "/interview-prep", cta: "Mulai Latihan", featureKey: "interview-prep" },
  ].filter((s) => featuresLoading || isEnabled(s.featureKey));
  const doneCount = steps.filter((s) => s.done).length;
  const nextStep = steps.find((s) => !s.done);
  const overall = steps.length ? Math.round((doneCount / steps.length) * 100) : 0;
  const firstName = alumnus?.name.split(" ")[0] ?? "";

  const shortcuts = hubNavGroups
    .filter((g) => g.title !== "Persiapan")
    .map((g) => ({ ...g, items: g.items.filter((i) => i.featureKey && !featuresLoading && isEnabled(i.featureKey)) }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="space-y-6">
      <Announcements />

      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl bg-primary text-primary-foreground p-6 sm:p-8">
        <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-accent/20 blur-2xl" aria-hidden />
        <div className="relative grid md:grid-cols-[1fr_auto] gap-6 items-center">
          <div className="space-y-3">
            <p className="text-sm text-primary-foreground/70">Program Job Ready Intelligo</p>
            <h1 className="text-2xl sm:text-3xl font-bold">Halo, {firstName}</h1>
            <p className="text-sm sm:text-base text-primary-foreground/80 max-w-xl">
              {error
                ? "Status kesiapanmu belum bisa dimuat."
                : !data
                  ? "Memuat progres kamu..."
                  : nextStep
                    ? `Langkah berikutnya: ${nextStep.title.toLowerCase()}.`
                    : "Semua langkah dasar sudah selesai. Lanjutkan latihan dan mulai melamar."}
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {error ? (
                <Button variant="secondary" size="sm" onClick={load}>
                  Coba lagi
                </Button>
              ) : nextStep ? (
                <Button asChild size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2">
                  <Link to={nextStep.to}>
                    {nextStep.cta} <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              ) : data ? (
                <Button asChild size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2">
                  <Link to="/applications">
                    Catat lamaran <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              ) : null}
            </div>
          </div>
          <div className="flex md:flex-col items-center gap-4 md:gap-2">
            <div
              className="relative w-24 h-24 rounded-full grid place-items-center"
              style={{ background: `conic-gradient(hsl(var(--accent)) ${overall * 3.6}deg, rgba(255,255,255,0.15) 0deg)` }}
              role="img"
              aria-label={`Progres ${overall} persen`}
            >
              <div className="w-[76px] h-[76px] rounded-full bg-primary grid place-items-center">
                <span className="text-xl font-bold tabular-nums">{data ? `${overall}%` : "..."}</span>
              </div>
            </div>
            <p className="text-xs text-primary-foreground/70 tabular-nums">
              {doneCount} dari {steps.length} langkah
            </p>
          </div>
        </div>
      </section>

      <div className="grid lg:grid-cols-[1fr_320px] gap-6 items-start">
        <div className="space-y-6 min-w-0">
          {/* Langkah */}
          <section aria-labelledby="langkah" className="space-y-3">
            <h2 id="langkah" className="text-base font-semibold text-foreground">
              Mulai dari sini
            </h2>
            <ol className="grid sm:grid-cols-3 gap-3">
              {steps.map((step, i) => (
                <li key={step.to}>
                  <Link
                    to={step.to}
                    className={cn(
                      "group h-full flex flex-col gap-2 rounded-xl border bg-background p-4 transition-colors duration-200 hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      step.done && "border-green-600/30 bg-green-50/50"
                    )}
                  >
                    <span
                      className={cn(
                        "w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold",
                        step.done ? "bg-green-600 text-white" : "bg-primary/10 text-primary"
                      )}
                      aria-hidden
                    >
                      {step.done ? <Check className="w-4 h-4" /> : i + 1}
                    </span>
                    <span className="font-semibold text-foreground">
                      {step.title}
                      {step.done && <span className="sr-only"> (selesai)</span>}
                    </span>
                    <span className="text-sm text-muted-foreground flex-1">{step.description}</span>
                    <span className="text-sm font-medium text-primary inline-flex items-center gap-1">
                      {step.done ? "Lihat lagi" : step.cta}
                      <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden />
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </section>

          {/* Akses cepat */}
          {shortcuts.map((group) => (
            <section key={group.title} className="space-y-3" aria-label={group.title}>
              <h2 className="text-base font-semibold text-foreground">{group.title}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className="flex items-center gap-3 rounded-xl border bg-background p-3 text-sm font-medium text-foreground transition-colors duration-200 hover:border-primary/40 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <span className="w-9 h-9 shrink-0 rounded-lg bg-accent/10 flex items-center justify-center">
                        <Icon className="w-4 h-4 text-accent" aria-hidden />
                      </span>
                      <span className="min-w-0">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        {/* Kolom kanan */}
        <aside className="space-y-4">
          {!featuresLoading && isEnabled("weekly-target") && <WeeklyTarget />}
          <Card>
            <CardContent className="p-4 space-y-3">
              <p className="text-sm font-semibold">Kelengkapan profil</p>
              {data ? (
                <>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-bold tabular-nums">{profilePercent}%</span>
                    {missingFields.length > 0 && (
                      <Link to="/profile" className="text-sm font-medium text-primary hover:underline">
                        Lengkapi
                      </Link>
                    )}
                  </div>
                  <Progress value={profilePercent} aria-label="Kelengkapan profil" />
                  <p className="text-xs text-muted-foreground">
                    {missingFields.length === 0 ? "Profil karier kamu sudah lengkap." : `Belum diisi: ${missingFields.map((f) => f.label).join(", ")}.`}
                  </p>
                </>
              ) : (
                <Skeleton className="h-16 w-full" />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-3">
              <p className="text-sm font-semibold">Checklist kesiapan</p>
              {data ? (
                <>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-bold tabular-nums">{data.readinessPercent}%</span>
                    {data.readinessPercent < 100 && (
                      <Link to="/profile?tab=checklist" className="text-sm font-medium text-primary hover:underline">
                        Buka
                      </Link>
                    )}
                  </div>
                  <Progress value={data.readinessPercent} aria-label="Checklist kesiapan" />
                </>
              ) : (
                <Skeleton className="h-12 w-full" />
              )}
            </CardContent>
          </Card>

          {agenda && agenda.length > 0 && (
            <Card>
              <CardContent className="p-4 space-y-3">
                <p className="text-sm font-semibold">Agenda terdekat</p>
                <ul className="space-y-2">
                  {agenda.map((a, i) => {
                    const Icon = a.kind === "live" ? CalendarDays : UserRoundCheck;
                    return (
                      <li key={i}>
                        <Link to={a.to} className="flex gap-3 rounded-lg p-2 -mx-2 hover:bg-muted">
                          <Icon className="w-4 h-4 mt-0.5 text-accent shrink-0" aria-hidden />
                          <span className="min-w-0">
                            <span className="block text-sm font-medium text-foreground truncate">{a.title}</span>
                            <span className="block text-xs text-muted-foreground">
                              {a.kind === "live" ? "Live session" : "Sesi mentor"} · {fmtAgenda(a.start)}
                            </span>
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </CardContent>
            </Card>
          )}

          <Card className="bg-secondary/60 border-dashed">
            <CardContent className="p-4 space-y-2 text-sm">
              <p className="font-semibold">Butuh bantuan?</p>
              <p className="text-muted-foreground">Tim Intelligo siap membantu soal akun, materi, dan sesi mentor.</p>
              <a href="https://intelligo.id/wa-mintell" target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">
                Hubungi via WhatsApp
              </a>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
