import HubShell from "@/components/HubShell";
import CvPreviewTemplate from "@/components/cvbuilder/CvPreviewTemplate";
import { emptyCvData, CvData } from "@/components/cvbuilder/types";
import { Button } from "@/components/ui/button";
import { UserX } from "lucide-react";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useParams } from "react-router-dom";

interface PublicProfileResponse {
  name: string;
  cv_data: Partial<CvData>;
}

export default function PublicAlumniProfile() {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<PublicProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!username) return;
    setLoading(true);
    setNotFound(false);
    fetch(`/api/public/alumni/${encodeURIComponent(username)}`)
      .then((r) => {
        if (!r.ok) throw new Error("not found");
        return r.json();
      })
      .then((data: PublicProfileResponse) => setProfile(data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [username]);

  const cv: CvData = {
    ...emptyCvData,
    ...profile?.cv_data,
    personal: { ...emptyCvData.personal, ...(profile?.cv_data?.personal || {}) },
  };

  return (
    <HubShell>
      <Helmet>
        <title>{profile ? `${profile.name} - Profil Alumni Intelligo ID` : "Profil Alumni - Intelligo ID"}</title>
        <meta name="robots" content={profile ? "index, follow" : "noindex, nofollow"} />
      </Helmet>

      <div className="bg-background">
        <div>
          <section className="py-10 md:py-16">
            <div className="section-container">
              {loading ? (
                <p className="text-center text-muted-foreground py-20">Memuat...</p>
              ) : notFound ? (
                <div className="text-center py-20 max-w-md mx-auto">
                  <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                    <UserX className="w-10 h-10 text-accent/50" />
                  </div>
                  <h1 className="text-xl font-semibold text-foreground mb-2">Profil Tidak Ditemukan</h1>
                  <p className="text-foreground/60 mb-6">
                    Profil ini belum dipublikasikan, atau link-nya salah.
                  </p>
                  <Button variant="outline" asChild>
                    <a href="https://intelligo.id">Kembali ke intelligo.id</a>
                  </Button>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <CvPreviewTemplate cv={cv} />
                  </div>
                  <div className="max-w-[210mm] mx-auto mt-8 text-center">
                    <p className="text-sm text-foreground/60 mb-3">
                      Profil ini dibuat lewat CV Builder Job Ready Hub Intelligo ID.
                    </p>
                    <Button variant="accent" asChild>
                      <a href="https://intelligo.id/wa-mintell" target="_blank" rel="noopener noreferrer">
                        Tanya-Tanya Program Intelligo ID
                      </a>
                    </Button>
                  </div>
                </>
              )}
            </div>
          </section>
        </div>
      </div>
    </HubShell>
  );
}
