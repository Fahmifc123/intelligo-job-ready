import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useAlumniAuth } from "@/contexts/AlumniAuthContext";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface CourseSummary {
  id: number;
  title: string;
  description: string;
  level: string;
  video_count: number;
  completed_count: number;
  total_minutes: number;
}

export default function JobReadyHubCourses() {
  const { fetchAsAlumni } = useAlumniAuth();
  const [courses, setCourses] = useState<CourseSummary[] | null>(null);
  const [error, setError] = useState(false);

  const load = useCallback(() => {
    setError(false);
    setCourses(null);
    fetchAsAlumni("/alumni/courses")
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((d) => setCourses(d.courses ?? []))
      .catch(() => setError(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-foreground">Video Course</h2>
        <p className="text-sm text-muted-foreground">Materi video persiapan kerja khusus alumni Job Ready. Tonton sesuai urutan dan tandai yang sudah selesai.</p>
      </div>

      {error ? (
        <Card>
          <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="text-sm">Gagal memuat daftar course. Periksa koneksi, lalu coba lagi.</p>
            <Button variant="outline" size="sm" onClick={load} className="w-fit">
              Coba lagi
            </Button>
          </CardContent>
        </Card>
      ) : courses === null ? (
        <div className="grid md:grid-cols-2 gap-4">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      ) : courses.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center space-y-2">
            <p className="font-semibold">Belum ada course</p>
            <p className="text-sm text-muted-foreground">Materi video sedang disiapkan tim Intelligo. Cek lagi nanti, ya.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {courses.map((c) => {
            const pct = c.video_count ? Math.round((c.completed_count / c.video_count) * 100) : 0;
            return (
              <Card key={c.id} className="flex flex-col">
                <CardHeader className="pb-2">
                  {c.level && <p className="text-xs font-medium text-accent">{c.level}</p>}
                  <CardTitle className="text-lg">{c.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col flex-1 gap-3">
                  {c.description && <p className="text-sm text-muted-foreground line-clamp-3">{c.description}</p>}
                  <p className="text-xs text-muted-foreground">
                    {c.video_count} video{c.total_minutes ? ` · sekitar ${c.total_minutes} menit` : ""}
                  </p>
                  <div className="space-y-1 mt-auto">
                    <Progress value={pct} aria-label={`Progres ${c.title}`} />
                    <p className="text-xs text-muted-foreground">
                      {c.completed_count} dari {c.video_count} selesai
                    </p>
                  </div>
                  <Button asChild size="sm" className="w-fit">
                    <Link to={`/courses/${c.id}`}>{c.completed_count === 0 ? "Mulai" : pct === 100 ? "Tonton lagi" : "Lanjutkan"}</Link>
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
