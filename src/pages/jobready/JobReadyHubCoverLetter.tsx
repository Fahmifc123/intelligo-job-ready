import AiAssistButton from "@/components/cvbuilder/AiAssistButton";
import CoverLetterPreviewTemplate from "@/components/coverletter/CoverLetterPreviewTemplate";
import { downloadCoverLetterPdf } from "@/components/coverletter/generateCoverLetterPdf";
import { CoverLetterData, emptyCoverLetterData } from "@/components/coverletter/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAlumniAuth } from "@/contexts/AlumniAuthContext";
import { Download } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function JobReadyHubCoverLetter() {
  const { alumnus, fetchAsAlumni } = useAlumniAuth();
  const [letter, setLetter] = useState<CoverLetterData>(emptyCoverLetterData);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const letterRes = await fetchAsAlumni("/alumni/cover-letter");
        const letterJson = letterRes.ok ? await letterRes.json() : { letter_data: {} };
        const savedLetter = letterJson.letter_data || {};

        if (Object.keys(savedLetter).length > 0) {
          setLetter({ ...emptyCoverLetterData, ...savedLetter });
        } else {
          // Belum pernah diisi -- prefill data pengirim dari akun alumni
          // supaya tidak perlu ketik ulang dari nol.
          setLetter({
            ...emptyCoverLetterData,
            senderName: alumnus?.name || "",
            senderEmail: alumnus?.email || "",
            senderPhone: alumnus?.phone || "",
          });
        }
      } catch {
        toast.error("Gagal memuat data cover letter");
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
      const response = await fetchAsAlumni("/alumni/cover-letter", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ letter_data: letter }),
      });
      if (!response.ok) throw new Error("Failed");
      toast.success("Cover letter berhasil disimpan");
    } catch {
      toast.error("Gagal menyimpan cover letter");
    } finally {
      setIsSaving(false);
    }
  };

  const update = (field: keyof CoverLetterData, value: string) => {
    setLetter((prev) => ({ ...prev, [field]: value }));
  };

  const applicationContext = [letter.jobTitle, letter.companyName].filter(Boolean).join(" di ");

  if (loading) {
    return <p className="text-muted-foreground">Memuat...</p>;
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Form */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold">Isi Data Cover Letter</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2" onClick={() => downloadCoverLetterPdf(letter)}>
              <Download className="w-4 h-4" />
              Download PDF
            </Button>
            <Button size="sm" onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-4 space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground">Data Diri</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Nama Lengkap</Label>
                <Input value={letter.senderName} onChange={(e) => update("senderName", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input value={letter.senderEmail} onChange={(e) => update("senderEmail", e.target.value)} />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Telepon</Label>
                <Input value={letter.senderPhone} onChange={(e) => update("senderPhone", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Lokasi</Label>
                <Input value={letter.senderLocation} onChange={(e) => update("senderLocation", e.target.value)} placeholder="mis. Bandung" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Tanggal</Label>
              <Input value={letter.date} onChange={(e) => update("date", e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground">Tujuan Lamaran</h3>
            <div className="space-y-1.5">
              <Label>Posisi yang Dilamar</Label>
              <Input value={letter.jobTitle} onChange={(e) => update("jobTitle", e.target.value)} placeholder="mis. Data Analyst" />
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Nama Perusahaan</Label>
                <Input value={letter.companyName} onChange={(e) => update("companyName", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Nama Penerima (jika tahu)</Label>
                <Input value={letter.recipientName} onChange={(e) => update("recipientName", e.target.value)} placeholder="mis. Ibu Ani" />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Jabatan Penerima</Label>
                <Input value={letter.recipientTitle} onChange={(e) => update("recipientTitle", e.target.value)} placeholder="mis. HR Manager" />
              </div>
              <div className="space-y-1.5">
                <Label>Alamat Perusahaan</Label>
                <Input value={letter.companyAddress} onChange={(e) => update("companyAddress", e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Salam Pembuka</Label>
              <Input value={letter.salutation} onChange={(e) => update("salutation", e.target.value)} placeholder="Yth. Bapak/Ibu Hiring Manager," />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground">Isi Surat</h3>
            <div className="space-y-1.5">
              <Label>Paragraf Pembuka</Label>
              <Textarea
                value={letter.openingParagraph}
                onChange={(e) => update("openingParagraph", e.target.value)}
                rows={3}
                placeholder="Perkenalkan diri kamu dan sebutkan posisi yang dilamar serta dari mana kamu tahu lowongan ini..."
              />
              <AiAssistButton
                endpoint="/alumni/cover-letter/ai-assist"
                fieldType="opening"
                currentText={letter.openingParagraph}
                context={applicationContext}
                onApply={(text) => update("openingParagraph", text)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Paragraf Isi</Label>
              <Textarea
                value={letter.bodyParagraph}
                onChange={(e) => update("bodyParagraph", e.target.value)}
                rows={5}
                placeholder="Ceritakan pengalaman/skill relevan dan kenapa kamu cocok untuk posisi ini..."
              />
              <AiAssistButton
                endpoint="/alumni/cover-letter/ai-assist"
                fieldType="body"
                currentText={letter.bodyParagraph}
                context={applicationContext}
                onApply={(text) => update("bodyParagraph", text)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Paragraf Penutup</Label>
              <Textarea
                value={letter.closingParagraph}
                onChange={(e) => update("closingParagraph", e.target.value)}
                rows={3}
                placeholder="Ajakan untuk lanjut ke tahap interview, ucapan terima kasih..."
              />
              <AiAssistButton
                endpoint="/alumni/cover-letter/ai-assist"
                fieldType="closing"
                currentText={letter.closingParagraph}
                context={applicationContext}
                onApply={(text) => update("closingParagraph", text)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Salam Penutup</Label>
              <Input value={letter.signOff} onChange={(e) => update("signOff", e.target.value)} placeholder="Hormat saya," />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview */}
      <div className="lg:sticky lg:top-24 self-start">
        <h2 className="text-lg font-bold mb-4">Preview</h2>
        <CoverLetterPreviewTemplate letter={letter} />
      </div>
    </div>
  );
}
