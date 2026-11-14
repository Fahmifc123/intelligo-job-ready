import { Button } from "@/components/ui/button";
import { useAlumniAuth } from "@/contexts/AlumniAuthContext";
import { Megaphone } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface Announcement {
  id: number;
  title: string;
  body: string;
  link_url: string | null;
  link_label: string;
  is_pinned: boolean;
}

/** Pengumuman dari admin di atas dashboard. Tidak tampil apa pun bila kosong atau gagal dimuat. */
export default function Announcements() {
  const { fetchAsAlumni } = useAlumniAuth();
  const [items, setItems] = useState<Announcement[]>([]);

  useEffect(() => {
    let active = true;
    fetchAsAlumni("/alumni/announcements")
      .then((r) => (r.ok ? r.json() : { announcements: [] }))
      .then((d) => active && setItems(d.announcements ?? []))
      .catch(() => {});
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (items.length === 0) return null;

  return (
    <section aria-label="Pengumuman" className="space-y-2">
      {items.map((a) => {
        const label = a.link_label || "Selengkapnya";
        const internal = a.link_url?.startsWith("/");
        return (
          <div
            key={a.id}
            className={`rounded-lg border p-4 flex flex-col sm:flex-row sm:items-center gap-3 ${a.is_pinned ? "border-accent/40 bg-accent/5" : "border-border bg-background"}`}
          >
            <Megaphone className="w-5 h-5 text-accent shrink-0 hidden sm:block" aria-hidden />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground break-words">{a.title}</p>
              {a.body && <p className="text-sm text-muted-foreground whitespace-pre-line break-words">{a.body}</p>}
            </div>
            {a.link_url && (
              <Button asChild size="sm" variant="outline" className="w-fit shrink-0">
                {internal ? (
                  <Link to={a.link_url}>{label}</Link>
                ) : (
                  <a href={a.link_url} target="_blank" rel="noopener noreferrer">
                    {label}
                  </a>
                )}
              </Button>
            )}
          </div>
        );
      })}
    </section>
  );
}
