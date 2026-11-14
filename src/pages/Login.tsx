import HubShell from "@/components/HubShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAlumniAuth } from "@/contexts/AlumniAuthContext";
import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";

/** Hanya izinkan path internal sebagai tujuan setelah login (hindari open redirect). */
function safeNext(next: string | null): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/login")) return "/";
  return next;
}

export default function Login() {
  const { alumnus, isLoading, login } = useAlumniAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const next = safeNext(searchParams.get("next"));
  const [accessCode, setAccessCode] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isLoading && alumnus) return <Navigate to={next} replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    const result = await login(accessCode.trim());
    setIsSubmitting(false);
    if (result.success) {
      navigate(next, { replace: true });
    } else {
      setError(result.error || "Kode akses tidak valid");
    }
  };

  return (
    <HubShell>
      <Helmet>
        <title>Masuk - Job Ready Hub Intelligo ID</title>
      </Helmet>
      <div className="flex items-center justify-center px-4 py-16">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-2">
            <h1 className="text-2xl font-bold leading-none tracking-tight text-center">Masuk ke Job Ready Hub</h1>
            <p className="text-sm text-muted-foreground text-center">
              Masuk dengan kode akses alumni yang diberikan oleh tim Intelligo.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="access-code">Kode Akses</Label>
                <Input
                  id="access-code"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  placeholder="IGO-XXXX-XXXX"
                  autoComplete="off"
                  required
                  autoFocus
                />
              </div>
              {error && (
                <p role="alert" className="text-sm text-destructive">
                  {error}
                </p>
              )}
              <Button type="submit" className="w-full" disabled={isSubmitting || isLoading}>
                {isSubmitting ? "Memverifikasi..." : "Masuk"}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Belum punya kode akses? Hubungi tim Intelligo melalui{" "}
                <a href="https://intelligo.id/wa-mintell" target="_blank" rel="noopener noreferrer" className="text-accent underline">
                  WhatsApp
                </a>
                .
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </HubShell>
  );
}
