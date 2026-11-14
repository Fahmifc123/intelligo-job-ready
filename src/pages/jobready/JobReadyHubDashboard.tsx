import Announcements from "@/components/jobready/Announcements";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useAlumniAuth } from "@/contexts/AlumniAuthContext";
import { useJobReadyHubFeatures } from "@/hooks/use-job-ready-hub-features";
import { cn } from "@/lib/utils";
import { Briefcase, CalendarDays, Database, MessagesSquare, UserRoundCheck, Check, ClipboardList, PlayCircle, Code2, FileEdit, FileText, Mail, Mic, Radio, UserCircle } from "lucide-react";
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

const filled = (v: unknown) => (typeof v === "string" ? v.trim().length > 0 : v !== null && v !== undefined);

async function getJson(res: Response) {
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export default function JobReadyHubDashboard() {
  const { fetchAsAlumni } = useAlumniAuth();
  const { isEnabled, loading: featuresLoading } = useJobReadyHubFeatures();
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState(false);

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

  const missingFields = data ? PROFILE_FIELDS.filter((f) => !filled(data.profile[f.key])) : [];
  const profilePercent = data ? Math.round(((PROFILE_FIELDS.length - missingFields.length) / PROFILE_FIELDS.length) * 100) : 0;

  const steps = [
    {
      title: "Lengkapi profil karier",
      description: "Tentukan posisi yang dituju dan skill utama kamu.",
      done: Boolean(data) && missingFields.length === 0,
      to: "/profile",
      cta: "Lengkapi Profil",
      featureKey: "profile",
    },
    {
      title: "Siapkan CV",
      description: "Buat CV dengan CV Builder, lalu cek dengan CV Analyzer.",
      done: Boolean(data?.hasCv),
      to: "/cv-builder",
      cta: "Buat CV",
      featureKey: "cv-builder",
    },
    {
      title: "Latihan interview",
      description: "Jawab pertanyaan interview dan dapatkan feedback dari AI.",
      done: Boolean(data?.hasInterview),
      to: "/interview-prep",
      cta: "Mulai Latihan",
      featureKey: "interview-prep",
    },
  ].filter((s) => featuresLoading || isEnabled(s.featureKey));

  const groups = [
    {
      title: "Siapkan Dokumen",
      items: [
        { title: "CV Analyzer", description: "Cek kecocokan CV kamu dengan posisi yang dituju.", icon: FileText, to: "/cv-analyzer", cta: "Analisis CV", featureKey: "cv-analyzer" },
        { title: "CV Builder", description: "Buat CV yang rapi dan mudah dibaca sistem ATS.", icon: FileEdit, to: "/cv-builder", cta: "Buat CV", featureKey: "cv-builder" },
        { title: "Cover Letter", description: "Susun surat lamaran dari form yang terarah.", icon: Mail, to: "/cover-letter", cta: "Buat Cover Letter", featureKey: "cover-letter" },
      ],
    },
    {
      title: "Belajar",
      items: [
        { title: "Video Course", description: "Materi video persiapan kerja, tonton sesuai urutan.", icon: PlayCircle, to: "/courses", cta: "Tonton", featureKey: "video-course" },
        { title: "Live Session", description: "Jadwal kelas live gratis untuk alumni Job Ready.", icon: CalendarDays, to: "/live-sessions", cta: "Lihat Jadwal", featureKey: "live-session" },
        { title: "Sesi Mentor", description: "Pesan sesi 1-on-1 untuk review CV, mock interview, atau konsultasi karier.", icon: UserRoundCheck, to: "/mentor", cta: "Pesan Sesi", featureKey: "mentor-session" },
      ],
    },
    {
      title: "Latihan",
      items: [
        { title: "Latihan Interview", description: "Latihan menjawab pertanyaan interview dengan suara, lalu dapat feedback.", icon: Mic, to: "/interview-prep", cta: "Mulai Latihan", featureKey: "interview-prep" },
        { title: "Bank Pertanyaan Interview", description: "Pertanyaan yang sering muncul per posisi, dengan tips dan metode STAR.", icon: MessagesSquare, to: "/interview-bank", cta: "Latihan", featureKey: "interview-bank" },
        { title: "Interview Realtime", description: "Simulasi interview percakapan dua arah dengan AI. Jumlah sesi dibatasi.", icon: Radio, to: "/interview-realtime", cta: "Buka", featureKey: "interview-realtime" },
        { title: "Coding Test SQL", description: "Latihan query SQL dengan data toko, dinilai otomatis.", icon: Database, to: "/sql-test", cta: "Mulai", featureKey: "sql-test" },
        { title: "Coding Test", description: "Latihan manipulasi data dengan pandas, dinilai otomatis.", icon: Code2, to: "/coding-test", cta: "Buka", featureKey: "coding-test" },
      ],
    },
    {
      title: "Cari Kerja",
      items: [
        { title: "Lowongan", description: "Lihat lowongan yang cocok dengan profil kamu.", icon: Briefcase, to: "/jobs", cta: "Lihat Lowongan", featureKey: "job-board" },
        { title: "Lamaran Saya", description: "Catat lowongan yang kamu lamar dan pantau statusnya.", icon: ClipboardList, to: "/applications", cta: "Buka Lamaran", featureKey: "application-tracker" },
        { title: "Profil & Checklist", description: "Kelola profil karier, checklist kesiapan, dan profil publik.", icon: UserCircle, to: "/profile", cta: "Kelola Profil", featureKey: "profile" },
      ],
    },
  ]
    .map((g) => ({ ...g, items: g.items.filter((i) => !featuresLoading && isEnabled(i.featureKey)) }))
    .filter((g) => g.items.length > 0);

  const doneCount = steps.filter((s) => s.done).length;

  const statSkeleton = (
    <>
      <Skeleton className="h-9 w-20" />
      <Skeleton className="h-2 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </>
  );

  return (
    <div className="space-y-8">
      <Announcements />
      {error ? (
        <Card>
          <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="text-sm text-foreground">Gagal memuat status kesiapan kamu. Periksa koneksi, lalu coba lagi.</p>
            <Button variant="outline" size="sm" onClick={load} className="w-fit">
              Coba lagi
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Mulai dari sini</CardTitle>
              <p className="text-sm text-muted-foreground">
                {data ? `${doneCount} dari ${steps.length} langkah selesai.` : "Memuat progres kamu..."}
              </p>
            </CardHeader>
            <CardContent>
              <ol className="grid md:grid-cols-3 gap-3">
                {steps.map((step, i) => (
                  <li
                    key={step.to}
                    className={cn("rounded-lg border p-4 flex flex-col gap-3", step.done ? "border-green-600/30 bg-green-50/60" : "border-border")}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          "w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-sm font-semibold",
                          step.done ? "bg-green-600 text-white" : "bg-primary text-primary-foreground"
                        )}
                        aria-hidden
                      >
                        {step.done ? <Check className="w-4 h-4" /> : i + 1}
                      </span>
                      <p className="font-semibold text-foreground">
                        {step.title}
                        {step.done && <span className="sr-only"> (selesai)</span>}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground flex-1">{step.description}</p>
                    {data ? (
                      <Button asChild size="sm" variant={step.done ? "outline" : "default"} className="w-fit">
                        <Link to={step.to}>{step.done ? "Lihat lagi" : step.cta}</Link>
                      </Button>
                    ) : (
                      <Skeleton className="h-9 w-28" />
                    )}
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          <div className="grid sm:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground font-medium">Kelengkapan Profil</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {data ? (
                  <>
                    <p className="text-3xl font-bold text-foreground">{profilePercent}%</p>
                    <Progress value={profilePercent} aria-label="Kelengkapan profil" />
                    <p className="text-sm text-muted-foreground">
                      {missingFields.length === 0
                        ? "Profil karier kamu sudah lengkap."
                        : `Belum diisi: ${missingFields.map((f) => f.label).join(", ")}.`}
                    </p>
                    {missingFields.length > 0 && (
                      <Button asChild size="sm" variant="outline" className="w-fit">
                        <Link to="/profile">Lengkapi sekarang</Link>
                      </Button>
                    )}
                  </>
                ) : (
                  statSkeleton
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground font-medium">Checklist Kesiapan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {data ? (
                  <>
                    <p className="text-3xl font-bold text-foreground">{data.readinessPercent}%</p>
                    <Progress value={data.readinessPercent} aria-label="Checklist kesiapan" />
                    <p className="text-sm text-muted-foreground">
                      {data.readinessPercent === 100
                        ? "Semua checklist sudah selesai."
                        : "Centang setiap persiapan yang sudah kamu selesaikan."}
                    </p>
                    {data.readinessPercent < 100 && (
                      <Button asChild size="sm" variant="outline" className="w-fit">
                        <Link to="/profile?tab=checklist">Buka checklist</Link>
                      </Button>
                    )}
                  </>
                ) : (
                  statSkeleton
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {groups.map((group) => (
        <section key={group.title} className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">{group.title}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {group.items.map((card) => {
              const Icon = card.icon;
              return (
                <Card key={card.to} className="flex flex-col">
                  <CardHeader className="pb-2">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-2">
                      <Icon className="w-5 h-5 text-accent" />
                    </div>
                    <CardTitle className="text-lg">{card.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col flex-1 justify-between gap-4">
                    <p className="text-sm text-muted-foreground">{card.description}</p>
                    <Button asChild size="sm" className="w-fit">
                      <Link to={card.to}>{card.cta}</Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
