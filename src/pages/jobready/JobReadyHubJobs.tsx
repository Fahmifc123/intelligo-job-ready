import JobBoardContent from "@/components/jobboard/JobBoardContent";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAlumniAuth } from "@/contexts/AlumniAuthContext";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function JobReadyHubJobs() {
  const { fetchAsAlumni } = useAlumniAuth();
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);
  const [view, setView] = useState<"all" | "saved">("all");
  const [matchSkills, setMatchSkills] = useState<string[]>([]);

  const loadSavedJobs = () => {
    fetchAsAlumni("/alumni/saved-jobs")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setSavedJobIds(Array.isArray(data) ? data : []))
      .catch(() => {});
  };

  // Skor kecocokan lowongan dihitung dari skill di CV Builder (paling
  // update), dengan fallback ke key_skills di tab Profil kalau alumni
  // belum pernah isi CV Builder.
  const loadMatchSkills = () => {
    Promise.all([
      fetchAsAlumni("/alumni/cv").then((r) => (r.ok ? r.json() : { cv_data: {} })),
      fetchAsAlumni("/alumni/profile").then((r) => (r.ok ? r.json() : {})),
    ])
      .then(([cvJson, profile]: [{ cv_data?: { skills?: string[] } }, { key_skills?: string }]) => {
        const cvSkills: string[] = cvJson?.cv_data?.skills || [];
        if (cvSkills.length > 0) {
          setMatchSkills(cvSkills);
        } else if (profile?.key_skills) {
          setMatchSkills(
            String(profile.key_skills)
              .split(",")
              .map((s: string) => s.trim())
              .filter(Boolean)
          );
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadSavedJobs();
    loadMatchSkills();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleToggleSave = async (jobId: string) => {
    const isSaved = savedJobIds.includes(jobId);
    // Optimistic update
    setSavedJobIds((prev) => (isSaved ? prev.filter((id) => id !== jobId) : [...prev, jobId]));

    try {
      const response = isSaved
        ? await fetchAsAlumni(`/alumni/saved-jobs/${encodeURIComponent(jobId)}`, { method: "DELETE" })
        : await fetchAsAlumni("/alumni/saved-jobs", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ job_id: jobId }),
          });

      if (!response.ok) throw new Error("Failed");
    } catch {
      // Roll back on failure
      setSavedJobIds((prev) => (isSaved ? [...prev, jobId] : prev.filter((id) => id !== jobId)));
      toast.error("Gagal menyimpan lowongan. Coba lagi.");
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={view} onValueChange={(v) => setView(v as "all" | "saved")}>
        <TabsList>
          <TabsTrigger value="all">Semua Lowongan</TabsTrigger>
          <TabsTrigger value="saved">Tersimpan ({savedJobIds.length})</TabsTrigger>
        </TabsList>
      </Tabs>

      <JobBoardContent
        showBookmarks
        savedJobIds={savedJobIds}
        onToggleSave={handleToggleSave}
        onlySavedJobs={view === "saved"}
        matchSkills={matchSkills}
      />
    </div>
  );
}
