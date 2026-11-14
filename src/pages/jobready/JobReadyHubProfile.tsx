import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAlumniAuth } from "@/contexts/AlumniAuthContext";
import { Copy } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";

// Keys must match READINESS_ITEM_KEYS in backend/main.py
const READINESS_ITEMS: { key: string; label: string }[] = [
  { key: "cv_finalized", label: "CV sudah difinalisasi" },
  { key: "linkedin_optimized", label: "Profil LinkedIn sudah dioptimalkan" },
  { key: "portfolio_ready", label: "Portofolio proyek sudah siap ditunjukkan" },
  { key: "mock_interview_done", label: "Sudah melakukan simulasi wawancara" },
  { key: "job_target_defined", label: "Target posisi/perusahaan sudah ditentukan" },
];

interface ProfileForm {
  target_role: string;
  target_industry: string;
  years_experience: string;
  key_skills: string;
  portfolio_url: string;
  linkedin_url: string;
  bio: string;
}

const emptyProfile: ProfileForm = {
  target_role: "",
  target_industry: "",
  years_experience: "",
  key_skills: "",
  portfolio_url: "",
  linkedin_url: "",
  bio: "",
};

export default function JobReadyHubProfile() {
  const { fetchAsAlumni } = useAlumniAuth();
  const [profile, setProfile] = useState<ProfileForm>(emptyProfile);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [readiness, setReadiness] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [isPublic, setIsPublic] = useState(false);
  const [publicUsername, setPublicUsername] = useState<string | null>(null);
  const [isTogglingPublic, setIsTogglingPublic] = useState(false);
  const [hasCv, setHasCv] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab") || "";
  const tab = ["profile", "checklist", "public"].includes(tabParam) ? tabParam : "profile";

  useEffect(() => {
    Promise.all([
      fetchAsAlumni("/alumni/profile").then((r) => (r.ok ? r.json() : {})),
      fetchAsAlumni("/alumni/readiness").then((r) => (r.ok ? r.json() : {})),
      fetchAsAlumni("/alumni/profile/public-settings").then((r) => (r.ok ? r.json() : { is_public: false, username: null })),
      fetchAsAlumni("/alumni/cv").then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([profileData, readinessData, publicSettings, cvData]) => {
        if (cvData) {
          const cv = (cvData.cv_data || {}) as Record<string, unknown>;
          setHasCv(Object.values(cv).some((v) => (Array.isArray(v) ? v.length > 0 : typeof v === "string" ? v.trim() !== "" : Boolean(v))));
        }
        setProfile({ ...emptyProfile, ...profileData });
        const checked: Record<string, boolean> = {};
        for (const [key, val] of Object.entries(readinessData || {})) {
          checked[key] = Boolean((val as { is_checked?: boolean })?.is_checked);
        }
        setReadiness(checked);
        setIsPublic(Boolean(publicSettings?.is_public));
        setPublicUsername(publicSettings?.username || null);
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTogglePublic = async (checked: boolean) => {
    setIsTogglingPublic(true);
    try {
      const response = await fetchAsAlumni("/alumni/profile/public-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_public: checked }),
      });
      if (!response.ok) throw new Error("Failed");
      const data = await response.json();
      setIsPublic(Boolean(data.is_public));
      setPublicUsername(data.username || null);
      toast.success(checked ? "Profil publik diaktifkan" : "Profil publik dinonaktifkan");
    } catch {
      toast.error("Gagal mengubah status profil publik");
    } finally {
      setIsTogglingPublic(false);
    }
  };

  const publicProfileUrl = publicUsername ? `https://jobready.intelligo.id/u/${publicUsername}` : "";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicProfileUrl);
    toast.success("Link disalin");
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const response = await fetchAsAlumni("/alumni/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (!response.ok) throw new Error("Failed");
      toast.success("Profil berhasil disimpan");
    } catch {
      toast.error("Gagal menyimpan profil");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleToggleReadiness = async (key: string, checked: boolean) => {
    setReadiness((prev) => ({ ...prev, [key]: checked }));
    try {
      const response = await fetchAsAlumni(`/alumni/readiness/${key}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_checked: checked }),
      });
      if (!response.ok) throw new Error("Failed");
    } catch {
      setReadiness((prev) => ({ ...prev, [key]: !checked }));
      toast.error("Gagal menyimpan checklist");
    }
  };

  if (loading) {
    return <p className="text-muted-foreground">Memuat...</p>;
  }

  return (
    <Tabs value={tab} onValueChange={(v) => setSearchParams({ tab: v }, { replace: true })} className="space-y-6 min-w-0">
      <TabsList className="w-full sm:w-auto justify-start overflow-x-auto">
        <TabsTrigger value="profile">Profil Karier</TabsTrigger>
        <TabsTrigger value="checklist">Checklist Kesiapan</TabsTrigger>
        <TabsTrigger value="public">Profil Publik</TabsTrigger>
      </TabsList>

      <TabsContent value="profile">
        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSaveProfile} className="space-y-4 max-w-2xl">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Posisi yang Dituju</Label>
                  <Input
                    value={profile.target_role}
                    onChange={(e) => setProfile({ ...profile, target_role: e.target.value })}
                    placeholder="mis. Data Analyst"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Industri Tujuan</Label>
                  <Input
                    value={profile.target_industry}
                    onChange={(e) => setProfile({ ...profile, target_industry: e.target.value })}
                    placeholder="mis. Fintech, E-commerce"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Pengalaman</Label>
                  <Input
                    value={profile.years_experience}
                    onChange={(e) => setProfile({ ...profile, years_experience: e.target.value })}
                    placeholder="mis. Fresh Graduate, 1 tahun"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Skill Utama</Label>
                  <Input
                    value={profile.key_skills}
                    onChange={(e) => setProfile({ ...profile, key_skills: e.target.value })}
                    placeholder="mis. Python, SQL, Tableau"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Link LinkedIn</Label>
                  <Input
                    value={profile.linkedin_url}
                    onChange={(e) => setProfile({ ...profile, linkedin_url: e.target.value })}
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Link Portofolio</Label>
                  <Input
                    value={profile.portfolio_url}
                    onChange={(e) => setProfile({ ...profile, portfolio_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Bio Singkat</Label>
                <Textarea
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  placeholder="Ceritakan singkat tentang dirimu..."
                  rows={4}
                />
              </div>

              <Button type="submit" disabled={isSavingProfile}>
                {isSavingProfile ? "Menyimpan..." : "Simpan Profil"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="checklist">
        <Card>
          <CardContent className="p-6 space-y-4">
            <p className="text-sm text-muted-foreground">
              Centang setiap persiapan yang sudah kamu selesaikan. Progresnya tampil di Dashboard.
            </p>
            {READINESS_ITEMS.map((item) => (
              <div key={item.key} className="flex items-center gap-3 p-3 rounded-lg border border-border/50">
                <Checkbox
                  id={item.key}
                  checked={Boolean(readiness[item.key])}
                  onCheckedChange={(checked) => handleToggleReadiness(item.key, Boolean(checked))}
                />
                <label htmlFor={item.key} className="text-sm font-medium cursor-pointer flex-1">
                  {item.label}
                </label>
              </div>
            ))}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="public">
        <Card>
          <CardContent className="p-6 space-y-4 max-w-2xl">
            <div className="flex items-start justify-between gap-4 p-4 rounded-lg border border-border/50">
              <div className="min-w-0">
                <Label className="text-base">Jadikan Profil Publik</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Kalau aktif, siapa saja bisa lihat CV kamu (dari CV Builder) lewat link publik tanpa perlu login.
                  Email dan nomor telepon tidak pernah ditampilkan di sana.
                </p>
              </div>
              <Switch className="shrink-0" checked={isPublic} disabled={isTogglingPublic} onCheckedChange={handleTogglePublic} />
            </div>

            {isPublic && publicProfileUrl && (
              <div className="space-y-2">
                <Label>Link Profil Kamu</Label>
                <div className="flex gap-2 min-w-0">
                  <Input value={publicProfileUrl} readOnly className="min-w-0" />
                  <Button type="button" variant="outline" size="icon" onClick={handleCopyLink} className="shrink-0" aria-label="Salin link">
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                {!hasCv && (
                  <p className="text-xs text-muted-foreground">
                    CV kamu masih kosong. Isi dulu di menu CV Builder supaya profil publik ini tidak kosong.
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
