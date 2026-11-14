import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useAlumniAuth } from "@/contexts/AlumniAuthContext";
import { Copy, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface ReviewResult {
  summary: string;
  strengths: string[];
  improvements: string[];
  headline_options: string[];
  about_rewrite: string;
  keywords: string[];
}

const copy = (text: string) => {
  navigator.clipboard.writeText(text).then(
    () => toast.success("Disalin"),
    () => toast.error("Gagal menyalin")
  );
};

export default function JobReadyHubLinkedin() {
  const { fetchAsAlumni } = useAlumniAuth();
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState("");
  const [headline, setHeadline] = useState("");
  const [about, setAbout] = useState("");
  const [result, setResult] = useState<ReviewResult | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [limit, setLimit] = useState(5);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      fetchAsAlumni("/alumni/linkedin-review").then((r) => (r.ok ? r.json() : null)),
      fetchAsAlumni("/alumni/profile").then((r) => (r.ok ? r.json() : {})) as Promise<{ target_role?: string }>,
    ])
      .then(([status, profile]) => {
        if (status) {
          setRemaining(status.remaining_today);
          setLimit(status.limit_per_day);
          if (status.last) {
            setRole(status.last.target_role || profile?.target_role || "");
            setHeadline(status.last.headline);
            setAbout(status.last.about);
            setResult(status.last.result);
            return;
          }
        }
        setRole(profile?.target_role || "");
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetchAsAlumni("/alumni/linkedin-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target_role: role, headline, about }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(typeof d.detail === "string" ? d.detail : "Review gagal dibuat");
      setResult(d.result);
      setRemaining(d.remaining_today);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Review gagal dibuat");
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Skeleton className="h-64 w-full" />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-foreground">Optimasi LinkedIn</h2>
        <p className="text-sm text-muted-foreground">
          Tempel headline dan bagian About dari profil LinkedIn kamu. AI memberi masukan dan contoh penulisan ulang. Bagian dalam kurung siku, misalnya
          [nama proyek], diisi sesuai pengalamanmu sendiri.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 items-start">
        <Card>
          <CardContent className="p-4">
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="li-role" className="text-sm font-medium">
                  Posisi yang dituju
                </label>
                <Input id="li-role" value={role} onChange={(e) => setRole(e.target.value)} maxLength={120} placeholder="mis. Data Analyst" />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="li-headline" className="text-sm font-medium">
                  Headline saat ini
                </label>
                <Input id="li-headline" value={headline} onChange={(e) => setHeadline(e.target.value)} maxLength={220} />
                <p className="text-xs text-muted-foreground tabular-nums">{headline.length}/220</p>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="li-about" className="text-sm font-medium">
                  Bagian About saat ini
                </label>
                <Textarea id="li-about" rows={8} value={about} onChange={(e) => setAbout(e.target.value)} maxLength={2600} />
                <p className="text-xs text-muted-foreground tabular-nums">{about.length}/2600</p>
              </div>
              {error && (
                <p role="alert" className="text-sm text-destructive">
                  {error}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-3">
                <Button type="submit" disabled={busy || (!headline.trim() && !about.trim()) || remaining === 0} className="gap-2">
                  {busy && <Loader2 className="w-4 h-4 animate-spin" />}
                  {busy ? "Menganalisis..." : "Review profil"}
                </Button>
                {remaining !== null && (
                  <span className="text-xs text-muted-foreground">
                    Sisa {remaining} dari {limit} review per 24 jam
                  </span>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {result ? (
          <div className="space-y-4">
            {result.summary && (
              <Card>
                <CardContent className="p-4 text-sm">{result.summary}</CardContent>
              </Card>
            )}
            {result.headline_options.length > 0 && (
              <Card>
                <CardContent className="p-4 space-y-2">
                  <p className="font-semibold text-sm">Contoh headline</p>
                  <ul className="space-y-2">
                    {result.headline_options.map((h, i) => (
                      <li key={i} className="flex items-start gap-2 rounded-md border p-2 text-sm">
                        <span className="flex-1 break-words">{h}</span>
                        <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={() => copy(h)} aria-label="Salin headline">
                          <Copy className="w-3.5 h-3.5" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
            {(result.strengths.length > 0 || result.improvements.length > 0) && (
              <Card>
                <CardContent className="p-4 space-y-3 text-sm">
                  {result.strengths.length > 0 && (
                    <div>
                      <p className="font-semibold">Sudah baik</p>
                      <ul className="list-disc ml-5 space-y-0.5">
                        {result.strengths.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {result.improvements.length > 0 && (
                    <div>
                      <p className="font-semibold">Perlu diperbaiki</p>
                      <ul className="list-disc ml-5 space-y-0.5">
                        {result.improvements.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
            {result.about_rewrite && (
              <Card>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-sm">Contoh About</p>
                    <Button size="sm" variant="outline" className="gap-1" onClick={() => copy(result.about_rewrite)}>
                      <Copy className="w-3.5 h-3.5" /> Salin
                    </Button>
                  </div>
                  <p className="text-sm whitespace-pre-line">{result.about_rewrite}</p>
                </CardContent>
              </Card>
            )}
            {result.keywords.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {result.keywords.map((k) => (
                  <span key={k} className="rounded-full bg-secondary px-2.5 py-1 text-xs">
                    {k}
                  </span>
                ))}
              </div>
            )}
          </div>
        ) : (
          <Card>
            <CardContent className="p-6 text-sm text-muted-foreground">Hasil review akan muncul di sini.</CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
