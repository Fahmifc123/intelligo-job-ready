import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useAlumniAuth } from "@/contexts/AlumniAuthContext";
import { toEmbedUrl } from "@/lib/videoEmbed";
import { cn } from "@/lib/utils";
import { ArrowLeft, Check, ExternalLink } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

interface Video {
  id: number;
  title: string;
  description: string;
  video_url: string;
  duration_minutes: number | null;
  completed: boolean;
}
interface CourseDetail {
  course: { id: number; title: string; description: string; level: string };
  videos: Video[];
}

export default function JobReadyHubCourseDetail() {
  const { id } = useParams<{ id: string }>();
  const { fetchAsAlumni } = useAlumniAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState<CourseDetail | null>(null);
  const [error, setError] = useState<"notfound" | "failed" | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setError(null);
    fetchAsAlumni(`/alumni/courses/${id}`)
      .then((r) => {
        if (r.status === 404) throw new Error("notfound");
        if (!r.ok) throw new Error("failed");
        return r.json();
      })
      .then(setData)
      .catch((e: Error) => setError(e.message === "notfound" ? "notfound" : "failed"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (error === "notfound") {
    return (
      <Card>
        <CardContent className="p-8 text-center space-y-3">
          <p className="font-semibold">Course tidak ditemukan</p>
          <Button asChild variant="outline" size="sm">
            <Link to="/courses">Kembali ke Video Course</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }
  if (error) {
    return (
      <Card>
        <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-sm">Gagal memuat course. Periksa koneksi, lalu coba lagi.</p>
          <Button variant="outline" size="sm" onClick={load} className="w-fit">
            Coba lagi
          </Button>
        </CardContent>
      </Card>
    );
  }
  if (!data) return <Skeleton className="w-full aspect-video" />;

  const { course, videos } = data;
  const firstUnfinished = videos.find((v) => !v.completed) ?? videos[0];
  const selectedId = Number(searchParams.get("video")) || firstUnfinished?.id;
  const current = videos.find((v) => v.id === selectedId) ?? firstUnfinished;
  const currentIndex = current ? videos.indexOf(current) : -1;
  const next = currentIndex >= 0 ? videos[currentIndex + 1] : undefined;
  const done = videos.filter((v) => v.completed).length;
  const embed = current ? toEmbedUrl(current.video_url) : null;

  const select = (videoId: number) => setSearchParams({ video: String(videoId) }, { replace: false });

  const toggleComplete = async () => {
    if (!current) return;
    setSaving(true);
    const completed = !current.completed;
    try {
      const res = await fetchAsAlumni(`/alumni/courses/videos/${current.id}/complete`, { method: completed ? "POST" : "DELETE" });
      if (!res.ok) throw new Error();
      setData({ ...data, videos: videos.map((v) => (v.id === current.id ? { ...v, completed } : v)) });
      if (completed && next) select(next.id);
    } catch {
      toast.error("Gagal menyimpan progres");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <Link to="/courses" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4" /> Semua course
      </Link>
      <div>
        <h2 className="text-lg font-bold text-foreground">{course.title}</h2>
        <div className="flex items-center gap-3 mt-2 max-w-sm">
          <Progress value={videos.length ? (done / videos.length) * 100 : 0} aria-label="Progres course" />
          <span className="text-xs text-muted-foreground whitespace-nowrap tabular-nums">
            {done}/{videos.length} selesai
          </span>
        </div>
      </div>

      {videos.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-sm text-muted-foreground">Video untuk course ini sedang disiapkan.</CardContent>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-[1fr_320px] gap-6">
          <div className="space-y-4 min-w-0">
            {current && (
              <>
                <div className="w-full aspect-video rounded-lg overflow-hidden bg-black">
                  {embed ? (
                    <iframe
                      key={current.id}
                      src={embed}
                      title={current.title}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                      allowFullScreen
                      referrerPolicy="strict-origin-when-cross-origin"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-white p-6 text-center">
                      <p className="text-sm">Video ini dibuka di halaman sumbernya.</p>
                      <Button asChild variant="secondary" size="sm" className="gap-2">
                        <a href={current.video_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4" /> Buka video
                        </a>
                      </Button>
                    </div>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">
                      Video {currentIndex + 1} dari {videos.length}
                      {current.duration_minutes ? ` · ${current.duration_minutes} menit` : ""}
                    </p>
                    <h3 className="font-semibold text-foreground">{current.title}</h3>
                  </div>
                  <Button onClick={toggleComplete} disabled={saving} variant={current.completed ? "outline" : "default"} size="sm" className="gap-2 shrink-0 w-fit">
                    <Check className="w-4 h-4" />
                    {current.completed ? "Sudah selesai" : next ? "Tandai selesai, lanjut" : "Tandai selesai"}
                  </Button>
                </div>
                {current.description && <p className="text-sm text-muted-foreground whitespace-pre-line">{current.description}</p>}
              </>
            )}
          </div>

          <nav aria-label="Daftar video">
            <ol className="rounded-lg border divide-y bg-background">
              {videos.map((v, i) => (
                <li key={v.id}>
                  <button
                    type="button"
                    onClick={() => select(v.id)}
                    aria-current={v.id === current?.id ? "true" : undefined}
                    className={cn("w-full flex items-start gap-3 p-3 text-left text-sm hover:bg-muted", v.id === current?.id && "bg-muted")}
                  >
                    <span
                      className={cn(
                        "mt-0.5 w-6 h-6 shrink-0 rounded-full flex items-center justify-center text-xs font-semibold",
                        v.completed ? "bg-green-600 text-white" : "bg-secondary text-foreground"
                      )}
                      aria-hidden
                    >
                      {v.completed ? <Check className="w-3.5 h-3.5" /> : i + 1}
                    </span>
                    <span className="min-w-0">
                      <span className="block font-medium text-foreground break-words">{v.title}</span>
                      {v.duration_minutes ? <span className="text-xs text-muted-foreground">{v.duration_minutes} menit</span> : null}
                      {v.completed && <span className="sr-only"> (selesai)</span>}
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          </nav>
        </div>
      )}
    </div>
  );
}
