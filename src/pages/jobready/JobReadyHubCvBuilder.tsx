import AiAssistButton from "@/components/cvbuilder/AiAssistButton";
import CvPreviewTemplate from "@/components/cvbuilder/CvPreviewTemplate";
import { downloadCvPdf } from "@/components/cvbuilder/generateCvPdf";
import {
    CvData,
    createEmptyCertification,
    createEmptyEducation,
    createEmptyExperience,
    emptyCvData,
} from "@/components/cvbuilder/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAlumniAuth } from "@/contexts/AlumniAuthContext";
import { Download, Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function JobReadyHubCvBuilder() {
  const { alumnus, fetchAsAlumni } = useAlumniAuth();
  const [cv, setCv] = useState<CvData>(emptyCvData);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [skillInput, setSkillInput] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const cvRes = await fetchAsAlumni("/alumni/cv");
        const cvJson = cvRes.ok ? await cvRes.json() : { cv_data: {} };
        const savedCv = cvJson.cv_data || {};

        if (Object.keys(savedCv).length > 0) {
          setCv({
            ...emptyCvData,
            ...savedCv,
            personal: { ...emptyCvData.personal, ...(savedCv.personal || {}) },
          });
        } else {
          // Belum pernah diisi -- prefill dari data yang sudah ada di tab Profil
          // supaya alumni tidak perlu ketik ulang dari nol.
          const profileRes = await fetchAsAlumni("/alumni/profile");
          const profile = profileRes.ok ? await profileRes.json() : {};
          setCv({
            ...emptyCvData,
            personal: {
              ...emptyCvData.personal,
              fullName: alumnus?.name || "",
              email: alumnus?.email || "",
              phone: alumnus?.phone || "",
              headline: profile.target_role || "",
              summary: profile.bio || "",
              linkedinUrl: profile.linkedin_url || "",
              portfolioUrl: profile.portfolio_url || "",
            },
            skills: profile.key_skills
              ? profile.key_skills.split(",").map((s: string) => s.trim()).filter(Boolean)
              : [],
          });
        }
      } catch {
        toast.error("Gagal memuat data CV");
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetchAsAlumni("/alumni/cv", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cv_data: cv }),
      });
      if (!response.ok) throw new Error("Failed");
      toast.success("CV berhasil disimpan");
    } catch {
      toast.error("Gagal menyimpan CV");
    } finally {
      setIsSaving(false);
    }
  };

  const updatePersonal = (field: keyof CvData["personal"], value: string) => {
    setCv((prev) => ({ ...prev, personal: { ...prev.personal, [field]: value } }));
  };

  // --- Experience ---
  const addExperience = () => setCv((prev) => ({ ...prev, experiences: [...prev.experiences, createEmptyExperience()] }));
  const removeExperience = (id: string) => setCv((prev) => ({ ...prev, experiences: prev.experiences.filter((e) => e.id !== id) }));
  const updateExperience = (id: string, patch: Partial<CvData["experiences"][number]>) =>
    setCv((prev) => ({ ...prev, experiences: prev.experiences.map((e) => (e.id === id ? { ...e, ...patch } : e)) }));
  const addBullet = (expId: string) =>
    setCv((prev) => ({
      ...prev,
      experiences: prev.experiences.map((e) => (e.id === expId ? { ...e, bullets: [...e.bullets, ""] } : e)),
    }));
  const updateBullet = (expId: string, idx: number, value: string) =>
    setCv((prev) => ({
      ...prev,
      experiences: prev.experiences.map((e) =>
        e.id === expId ? { ...e, bullets: e.bullets.map((b, i) => (i === idx ? value : b)) } : e
      ),
    }));
  const removeBullet = (expId: string, idx: number) =>
    setCv((prev) => ({
      ...prev,
      experiences: prev.experiences.map((e) => (e.id === expId ? { ...e, bullets: e.bullets.filter((_, i) => i !== idx) } : e)),
    }));

  // --- Education ---
  const addEducation = () => setCv((prev) => ({ ...prev, education: [...prev.education, createEmptyEducation()] }));
  const removeEducation = (id: string) => setCv((prev) => ({ ...prev, education: prev.education.filter((e) => e.id !== id) }));
  const updateEducation = (id: string, patch: Partial<CvData["education"][number]>) =>
    setCv((prev) => ({ ...prev, education: prev.education.map((e) => (e.id === id ? { ...e, ...patch } : e)) }));

  // --- Certifications ---
  const addCertification = () => setCv((prev) => ({ ...prev, certifications: [...prev.certifications, createEmptyCertification()] }));
  const removeCertification = (id: string) =>
    setCv((prev) => ({ ...prev, certifications: prev.certifications.filter((c) => c.id !== id) }));
  const updateCertification = (id: string, patch: Partial<CvData["certifications"][number]>) =>
    setCv((prev) => ({ ...prev, certifications: prev.certifications.map((c) => (c.id === id ? { ...c, ...patch } : c)) }));

  // --- Skills ---
  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !cv.skills.includes(trimmed)) {
      setCv((prev) => ({ ...prev, skills: [...prev.skills, trimmed] }));
    }
    setSkillInput("");
  };
  const removeSkill = (skill: string) => setCv((prev) => ({ ...prev, skills: prev.skills.filter((s) => s !== skill) }));

  if (loading) {
    return <p className="text-muted-foreground">Memuat...</p>;
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Form */}
      <div className="space-y-4 min-w-0">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold">Isi Data CV</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2" onClick={() => downloadCvPdf(cv)}>
              <Download className="w-4 h-4" />
              Download PDF
            </Button>
            <Button size="sm" onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="personal">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="personal" className="shrink-0">Info Pribadi</TabsTrigger>
            <TabsTrigger value="experience" className="shrink-0">Pengalaman</TabsTrigger>
            <TabsTrigger value="education" className="shrink-0">Pendidikan</TabsTrigger>
            <TabsTrigger value="skills" className="shrink-0">Skill</TabsTrigger>
            <TabsTrigger value="certifications" className="shrink-0">Sertifikat</TabsTrigger>
          </TabsList>

          <TabsContent value="personal">
            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Nama Lengkap</Label>
                    <Input value={cv.personal.fullName} onChange={(e) => updatePersonal("fullName", e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Headline (mis. Data Analyst)</Label>
                    <Input value={cv.personal.headline} onChange={(e) => updatePersonal("headline", e.target.value)} />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Email</Label>
                    <Input value={cv.personal.email} onChange={(e) => updatePersonal("email", e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Telepon</Label>
                    <Input value={cv.personal.phone} onChange={(e) => updatePersonal("phone", e.target.value)} />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Lokasi</Label>
                    <Input value={cv.personal.location} onChange={(e) => updatePersonal("location", e.target.value)} placeholder="mis. Bandung" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>LinkedIn</Label>
                    <Input value={cv.personal.linkedinUrl} onChange={(e) => updatePersonal("linkedinUrl", e.target.value)} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Portfolio/Website</Label>
                  <Input value={cv.personal.portfolioUrl} onChange={(e) => updatePersonal("portfolioUrl", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Ringkasan Profil</Label>
                  <Textarea
                    value={cv.personal.summary}
                    onChange={(e) => updatePersonal("summary", e.target.value)}
                    rows={4}
                    placeholder="2-3 kalimat tentang siapa kamu dan keahlian utamamu..."
                  />
                  <AiAssistButton
                    fieldType="summary"
                    currentText={cv.personal.summary}
                    context={cv.personal.headline}
                    onApply={(text) => updatePersonal("summary", text)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="experience" className="space-y-3">
            {cv.experiences.map((exp) => (
              <Card key={exp.id}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-end">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeExperience(exp.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>Posisi</Label>
                      <Input value={exp.title} onChange={(e) => updateExperience(exp.id, { title: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Perusahaan</Label>
                      <Input value={exp.company} onChange={(e) => updateExperience(exp.id, { company: e.target.value })} />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <Label>Lokasi</Label>
                      <Input value={exp.location} onChange={(e) => updateExperience(exp.id, { location: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Mulai</Label>
                      <Input value={exp.startDate} onChange={(e) => updateExperience(exp.id, { startDate: e.target.value })} placeholder="Jan 2023" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Selesai</Label>
                      <Input
                        value={exp.endDate}
                        onChange={(e) => updateExperience(exp.id, { endDate: e.target.value })}
                        placeholder="Des 2023"
                        disabled={exp.current}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`current-${exp.id}`}
                      checked={exp.current}
                      onCheckedChange={(checked) => updateExperience(exp.id, { current: Boolean(checked) })}
                    />
                    <label htmlFor={`current-${exp.id}`} className="text-sm cursor-pointer">
                      Masih bekerja di sini
                    </label>
                  </div>

                  <div className="space-y-2">
                    <Label>Poin Pencapaian / Tanggung Jawab</Label>
                    {exp.bullets.map((bullet, idx) => (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex gap-2">
                          <Textarea
                            value={bullet}
                            onChange={(e) => updateBullet(exp.id, idx, e.target.value)}
                            rows={2}
                            placeholder="mis. Menganalisis data penjualan bulanan untuk tim marketing"
                          />
                          <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" onClick={() => removeBullet(exp.id, idx)}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                        <AiAssistButton
                          fieldType="bullet"
                          currentText={bullet}
                          context={[exp.title, exp.company].filter(Boolean).join(" di ")}
                          onApply={(text) => updateBullet(exp.id, idx, text)}
                        />
                      </div>
                    ))}
                    <Button variant="outline" size="sm" className="gap-1" onClick={() => addBullet(exp.id)}>
                      <Plus className="w-3.5 h-3.5" />
                      Tambah Poin
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            <Button variant="outline" className="w-full gap-2" onClick={addExperience}>
              <Plus className="w-4 h-4" />
              Tambah Pengalaman Kerja
            </Button>
          </TabsContent>

          <TabsContent value="education" className="space-y-3">
            {cv.education.map((edu) => (
              <Card key={edu.id}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-end">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeEducation(edu.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Sekolah/Universitas</Label>
                    <Input value={edu.school} onChange={(e) => updateEducation(edu.id, { school: e.target.value })} />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>Gelar</Label>
                      <Input value={edu.degree} onChange={(e) => updateEducation(edu.id, { degree: e.target.value })} placeholder="mis. S1" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Jurusan</Label>
                      <Input value={edu.field} onChange={(e) => updateEducation(edu.id, { field: e.target.value })} />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>Mulai</Label>
                      <Input value={edu.startDate} onChange={(e) => updateEducation(edu.id, { startDate: e.target.value })} placeholder="2019" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Selesai</Label>
                      <Input value={edu.endDate} onChange={(e) => updateEducation(edu.id, { endDate: e.target.value })} placeholder="2023" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            <Button variant="outline" className="w-full gap-2" onClick={addEducation}>
              <Plus className="w-4 h-4" />
              Tambah Pendidikan
            </Button>
          </TabsContent>

          <TabsContent value="skills">
            <Card>
              <CardContent className="p-4 space-y-3">
                <Label>Skill</Label>
                <div className="flex gap-2">
                  <Input
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addSkill();
                      }
                    }}
                    placeholder="mis. Python, ketik lalu Enter"
                  />
                  <Button type="button" variant="outline" onClick={addSkill}>
                    Tambah
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {cv.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="gap-1 pr-1">
                      {skill}
                      <button onClick={() => removeSkill(skill)} className="hover:text-destructive">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="certifications" className="space-y-3">
            {cv.certifications.map((cert) => (
              <Card key={cert.id}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-end">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeCertification(cert.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Nama Sertifikat</Label>
                    <Input
                      value={cert.name}
                      onChange={(e) => updateCertification(cert.id, { name: e.target.value })}
                      placeholder="mis. Data Science Bootcamp"
                    />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label>Penerbit</Label>
                      <Input value={cert.issuer} onChange={(e) => updateCertification(cert.id, { issuer: e.target.value })} placeholder="Intelligo ID" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Tanggal</Label>
                      <Input value={cert.date} onChange={(e) => updateCertification(cert.id, { date: e.target.value })} placeholder="2024" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            <Button variant="outline" className="w-full gap-2" onClick={addCertification}>
              <Plus className="w-4 h-4" />
              Tambah Sertifikat
            </Button>
          </TabsContent>
        </Tabs>
      </div>

      {/* Preview */}
      <div className="lg:sticky lg:top-24 self-start">
        <h2 className="text-lg font-bold mb-4">Preview</h2>
        <CvPreviewTemplate cv={cv} />
      </div>
    </div>
  );
}
