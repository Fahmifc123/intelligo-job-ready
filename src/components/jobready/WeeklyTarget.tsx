import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useAlumniAuth } from "@/contexts/AlumniAuthContext";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

type Key = "applications" | "practices" | "videos";
interface Weekly {
  week_start: string;
  targets: Record<Key, number>;
  progress: Record<Key, number>;
}

const ITEMS: { key: Key; label: string; to: string }[] = [
  { key: "applications", label: "Lamaran dicatat", to: "/applications" },
  { key: "practices", label: "Latihan interview", to: "/interview-prep" },
  { key: "videos", label: "Video selesai", to: "/courses" },
];

/** Target mingguan: progres dihitung otomatis dari aktivitas sejak Senin (WIB). */
export default function WeeklyTarget() {
  const { fetchAsAlumni } = useAlumniAuth();
  const [data, setData] = useState<Weekly | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Record<Key, string>>({ applications: "", practices: "", videos: "" });

  useEffect(() => {
    fetchAsAlumni("/alumni/weekly-progress")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setData(d))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!data) return null;

  const startEdit = () => {
    setDraft({ applications: String(data.targets.applications), practices: String(data.targets.practices), videos: String(data.targets.videos) });
    setEditing(true);
  };

  const save = async () => {
    const body = Object.fromEntries(ITEMS.map((i) => [i.key, Math.max(0, Math.min(50, Number(draft[i.key]) || 0))]));
    const res = await fetchAsAlumni("/alumni/weekly-targets", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (!res.ok) return toast.error("Gagal menyimpan target");
    const d = await res.json();
    setData({ ...data, targets: d.targets });
    setEditing(false);
    toast.success("Target mingguan disimpan");
  };

  const active = ITEMS.filter((i) => data.targets[i.key] > 0);

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">Target minggu ini</p>
          {!editing && (
            <button type="button" onClick={startEdit} className="text-sm font-medium text-primary hover:underline">
              Ubah
            </button>
          )}
        </div>
        {editing ? (
          <div className="space-y-2">
            {ITEMS.map((i) => (
              <label key={i.key} className="flex items-center justify-between gap-3 text-sm">
                {i.label}
                <Input
                  type="number"
                  min={0}
                  max={50}
                  value={draft[i.key]}
                  onChange={(e) => setDraft({ ...draft, [i.key]: e.target.value })}
                  className="w-20 h-8"
                />
              </label>
            ))}
            <div className="flex gap-2 pt-1">
              <Button size="sm" onClick={save}>
                Simpan
              </Button>
              <Button size="sm" variant="outline" onClick={() => setEditing(false)}>
                Batal
              </Button>
            </div>
          </div>
        ) : active.length === 0 ? (
          <p className="text-xs text-muted-foreground">Belum ada target. Klik Ubah untuk mengaturnya.</p>
        ) : (
          <ul className="space-y-3">
            {active.map((i) => {
              const done = data.progress[i.key];
              const target = data.targets[i.key];
              return (
                <li key={i.key} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <Link to={i.to} className="hover:underline">
                      {i.label}
                    </Link>
                    <span className="tabular-nums text-muted-foreground">
                      {Math.min(done, target)}/{target}
                    </span>
                  </div>
                  <Progress value={Math.min(100, (done / target) * 100)} aria-label={`${i.label} ${done} dari ${target}`} />
                </li>
              );
            })}
          </ul>
        )}
        <p className="text-xs text-muted-foreground">Dihitung otomatis dari aktivitasmu sejak Senin.</p>
      </CardContent>
    </Card>
  );
}
