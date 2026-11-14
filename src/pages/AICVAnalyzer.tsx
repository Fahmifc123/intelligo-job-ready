import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAlumniAuth } from "@/contexts/AlumniAuthContext";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {
    AlertCircle,
    ArrowRight,
    Briefcase,
    CheckCircle2,
    ChevronLeft,
    Download,
    Key,
    Loader2,
    Sparkles,
    Upload
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { toast } from "sonner";

// --- Types ---
interface CvAnalysisResult {
  id: string;
  candidateName: string;
  role: string;
  overallScore: number;
  skorKecocokanRole: number;
  suggestions: string[];
  kekuatanUtama: string[];
  gaps: string[];
  prioritasPerbaikan: string[];
  createdAt: string;
}

interface AICVAnalyzerProps {
  /** Saat true, tidak render Navbar/Footer/hero sendiri — dipakai saat
   * komponen ini di-embed di dalam JobReadyHubLayout supaya nav tab hub
   * (Dashboard/Job Board/CV Analyzer/Profil) tetap konsisten terlihat. */
  embedded?: boolean;
}

const AICVAnalyzer = ({ embedded = false }: AICVAnalyzerProps = {}) => {
  const { alumnus } = useAlumniAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [jobRole, setJobRole] = useState<string>("Data Scientist");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<CvAnalysisResult | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [licenseCode, setLicenseCode] = useState("");
  const [isLicenseVerified, setIsLicenseVerified] = useState(false);
  const [isVerifyingLicense, setIsVerifyingLicense] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);
  // Alumni yang login via Job Ready Hub tidak perlu kode lisensi Mayar
  const hasAccess = isLicenseVerified || !!alumnus;

  // Check license on mount if exists in local storage
  useEffect(() => {
    const savedLicense = localStorage.getItem("cv_analyzer_license");
    if (savedLicense) {
      setLicenseCode(savedLicense);
      handleVerifyLicense(savedLicense);
    }
  }, []);

  const handleVerifyLicense = async (code?: string) => {
    const targetCode = code || licenseCode;
    if (!targetCode) {
      toast.error("Masukkan Kode Lisensi kamu");
      return;
    }

    setIsVerifyingLicense(true);
    try {
      const response = await fetch(`/api/mayar-license`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "verify",
          licenseCode: targetCode
        })
      });

      const data = await response.json();
      
      // Ambil if else nya adalah isLicenseActive sesuai response Mayar
      if (data.statusCode === 200 && data.isLicenseActive === true) {
        setIsLicenseVerified(true);
        localStorage.setItem("cv_analyzer_license", targetCode);
        toast.success("Lisensi Valid! Kamu bisa mulai analisis.");
      } else {
        const errorMsg = data.isLicenseActive === false 
          ? "Lisensi sudah tidak aktif atau sudah pernah digunakan." 
          : (data.message || "Kode Lisensi tidak valid.");
        toast.error(errorMsg);
        setIsLicenseVerified(false);
      }
    } catch (error) {
      console.error("Error verifying license:", error);
      toast.error("Gagal verifikasi lisensi. Coba lagi nanti.");
    } finally {
      setIsVerifyingLicense(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Ukuran file maksimal 5MB");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      toast.error("Pilih file CV terlebih dahulu");
      return;
    }

    if (!hasAccess) {
      toast.error("Verifikasi Kode Lisensi kamu terlebih dahulu.");
      return;
    }

    setIsAnalyzing(true);

    // Alumni yang login via Job Ready Hub melewati alur lisensi Mayar sepenuhnya
    if (!alumnus) {
      // Activate license if needed
      try {
        await fetch(`/api/mayar-license`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "activate",
            licenseCode: licenseCode
          })
        });
      } catch (e) {
        console.log("Activation handled or skipped");
      }
    }

    try {
      // Panggil Backend FastAPI yang asli
      const formData = new FormData();
      formData.append("role", jobRole);
      formData.append("file", selectedFile);

      const response = await fetch("/api/analyze-cv", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Gagal melakukan analisis AI");
      }

      const result = await response.json();

      // Deaktivasi Lisensi setelah digunakan (agar jadi satu kali pakai)
      if (!alumnus) {
        try {
          await fetch(`/api/mayar-license`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              action: "deactivate",
              licenseCode: licenseCode
            })
          });
        } catch (e) {
          console.error("Deactivation error:", e);
        }
      }

      setAnalysisResult({
        ...result,
        role: jobRole, // Simpan role ke hasil analisis
        id: Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString()
      });

      setIsAnalyzing(false);
      setIsLicenseVerified(false);
      localStorage.removeItem("cv_analyzer_license");
      setLicenseCode("");
      toast.success("Analisis CV selesai! Lisensi telah digunakan.");

    } catch (error) {
      console.error("Analysis error:", error);
      toast.error("Terjadi kesalahan saat menganalisis CV. Pastikan backend FastAPI sudah berjalan.");
      setIsAnalyzing(false);
    }
  };

  const handleBuyLicense = () => {
    window.open("https://intelligo.myr.id/pl/cv-analyzer-93359", "_blank"); 
    toast.info("Membuka halaman pembelian Lisensi...");
  };

  const handleDownloadPDF = async () => {
    if (!analysisResult || !pdfRef.current) {
      console.error("Download PDF failed: analysisResult or pdfRef is null");
      return;
    }
    
    setIsDownloading(true);
    toast.info("Sedang menyiapkan laporan PDF...");

    try {
      // Tunggu sebentar untuk memastikan DOM ter-render sempurna
      await new Promise(resolve => setTimeout(resolve, 1500));

      const element = pdfRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        windowWidth: 794,
        allowTaint: true,
        scrollY: -window.scrollY,
      });
      
      const imgData = canvas.toDataURL("image/png");
      
      // Create PDF instance first
      const pdf = new jsPDF("p", "mm", "a4");
      
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = 190;
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      // Auto-adjust PDF height based on content + padding (10mm top + 10mm bottom)
      pdf.internal.pageSize.height = pdfHeight + 20;
      
      pdf.addImage(imgData, "PNG", 10, 10, pdfWidth, pdfHeight);
      
      const namePart = analysisResult.candidateName 
        ? `${analysisResult.candidateName.replace(/\s+/g, "_")}_`
        : "";
      const rolePart = analysisResult.role 
        ? `${analysisResult.role.replace(/\s+/g, "_")}_`
        : "";
      const fileName = `Hasil_CV_Analyzer_${namePart}${rolePart}Intelligo_ID.pdf`;
        
      pdf.save(fileName);
      toast.success("Laporan PDF berhasil didownload!");
    } catch (error) {
      console.error("PDF Error Detail:", error);
      toast.error("Gagal mendownload PDF. Coba gunakan browser lain atau Chrome desktop.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className={embedded ? "" : "min-h-screen bg-background"}>
      {!embedded && (
        <Helmet>
          <title>AI CV Analyzer - Intelligo ID</title>
          <meta
            name="description"
            content="Upload CV kamu dan dapatkan analisis instan berbasis AI — skor ATS, gap skill, dan rekomendasi perbaikan sesuai posisi yang kamu tuju."
          />
          <link rel="canonical" href="https://intelligo.id/ai-cv-analyzer" />
          <meta property="og:title" content="AI CV Analyzer - Intelligo ID" />
          <meta
            property="og:description"
            content="Upload CV kamu dan dapatkan analisis instan berbasis AI — skor ATS, gap skill, dan rekomendasi perbaikan sesuai posisi yang kamu tuju."
          />
          <meta property="og:url" content="https://intelligo.id/ai-cv-analyzer" />
          <meta name="twitter:title" content="AI CV Analyzer - Intelligo ID" />
          <meta
            name="twitter:description"
            content="Upload CV kamu dan dapatkan analisis instan berbasis AI — skor ATS, gap skill, dan rekomendasi perbaikan sesuai posisi yang kamu tuju."
          />
        </Helmet>
      )}

      {!embedded && (
        <div className="no-print">
        </div>
      )}

      <main className={embedded ? "" : "pt-24 pb-20"}>
        <div className={embedded ? "" : "section-container max-w-5xl"}>
          {/* Header */}
          {!embedded && (
            <div className="text-center mb-10 no-print">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
                <Sparkles className="w-4 h-4" />
                AI Powered
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">CV Analyzer AI</h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Dapatkan feedback instan dan skor ATS untuk CV kamu berdasarkan posisi yang dituju.
              </p>
            </div>
          )}

          {!analysisResult ? (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left: Upload Form */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="border-border/50 shadow-sm">
                  <CardContent className="p-6">
                    {hasAccess ? (
                      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        {/* Status Akses */}
                        {isLicenseVerified ? (
                          <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 border border-emerald-100 mb-2">
                             <div className="flex items-center gap-2 text-emerald-700 font-medium text-sm">
                                <CheckCircle2 className="w-4 h-4" />
                                Lisensi Aktif
                             </div>
                             <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => {
                               setIsLicenseVerified(false);
                               localStorage.removeItem("cv_analyzer_license");
                               setLicenseCode("");
                             }}>Ganti Kode</Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 p-3 rounded-lg bg-accent/10 border border-accent/20 mb-2 text-accent font-medium text-sm">
                            <CheckCircle2 className="w-4 h-4" />
                            Akses Job Ready Hub Aktif — gratis untuk alumni
                          </div>
                        )}

                        {/* Upload Area */}
                        <div
                          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                          onDragLeave={() => setDragOver(false)}
                          onDrop={(e) => {
                            e.preventDefault();
                            setDragOver(false);
                            if (e.dataTransfer.files?.[0]) setSelectedFile(e.dataTransfer.files[0]);
                          }}
                          className={`relative rounded-xl border-2 border-dashed transition-all p-8 text-center ${
                            dragOver ? "border-accent bg-accent/5 scale-[1.01]" : 
                            selectedFile ? "border-emerald-500/50 bg-emerald-50/30" : "border-border hover:border-accent/50"
                          }`}
                        >
                          <input
                            type="file"
                            id="cv-upload"
                            className="hidden"
                            accept=".pdf,.docx"
                            onChange={handleFileChange}
                          />
                          
                          {selectedFile ? (
                            <div className="space-y-3">
                              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                                <CheckCircle2 className="w-6 h-6" />
                              </div>
                              <div>
                                <p className="font-semibold truncate max-w-xs mx-auto">{selectedFile.name}</p>
                                <p className="text-xs text-muted-foreground">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                              </div>
                              <Button variant="ghost" size="sm" onClick={() => setSelectedFile(null)}>Ganti File</Button>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <div className="w-12 h-12 rounded-full bg-accent/10 text-accent flex items-center justify-center mx-auto">
                                <Upload className="w-6 h-6" />
                              </div>
                              <div>
                                <p className="font-semibold">Klik atau seret file ke sini</p>
                                <p className="text-xs text-muted-foreground">PDF atau DOCX (Maks. 5MB)</p>
                              </div>
                              <Button variant="outline" onClick={() => document.getElementById('cv-upload')?.click()}>
                                Pilih File
                              </Button>
                            </div>
                          )}
                        </div>

                        {/* Job Role */}
                        <div className="space-y-2">
                          <Label htmlFor="role">Posisi yang Dituju</Label>
                          <div className="relative">
                            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input 
                              id="role"
                              value={jobRole}
                              onChange={(e) => setJobRole(e.target.value)}
                              placeholder="Contoh: Data Scientist, AI Engineer..."
                              className="pl-10"
                            />
                          </div>
                        </div>

                        {/* Submit */}
                        <Button 
                          className="w-full h-12 text-lg font-bold" 
                          onClick={handleAnalyze}
                          disabled={isAnalyzing || !selectedFile}
                        >
                          {isAnalyzing ? (
                            <>
                              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                              Menganalisis...
                            </>
                          ) : (
                            <>
                              Analisis Sekarang
                              <ArrowRight className="w-5 h-5 ml-2" />
                            </>
                          )}
                        </Button>
                      </div>
                    ) : (
                      <div className="py-8 text-center space-y-6 animate-in fade-in duration-500">
                        <div className="mx-auto max-w-md rounded-2xl border-2 border-accent bg-accent/5 p-5 text-left">
                          <p className="text-xs font-bold uppercase tracking-wider text-accent">Gratis, tanpa lisensi</p>
                          <p className="mt-1 text-lg font-bold text-foreground">Belum punya lisensi? Cek CV kamu gratis dulu</p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            Dapatkan skor kesiapan, 3 skill yang kurang, contoh perbaikan, dan cek format ATS untuk posisi Data &amp; AI dalam 1 menit.
                          </p>
                          <Button asChild className="mt-4 w-full h-11 font-bold bg-accent hover:bg-accent/90">
                            <a href="/cek-cv">Cek CV Gratis Sekarang</a>
                          </Button>
                        </div>
                        <div className="w-20 h-20 bg-accent/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-accent/10">
                          <Key className="w-10 h-10 text-accent" />
                        </div>
                        <div className="max-w-md mx-auto px-4 text-center">
                          <h3 className="text-xl font-bold mb-2 text-center">Sudah punya lisensi? Analisis lengkap</h3>
                          <p className="text-muted-foreground mb-6">
                            Masukkan Kode Lisensi yang kamu dapatkan setelah pembelian untuk mulai menggunakan AI CV Analyzer.
                          </p>
                          <div className="flex flex-col gap-4 max-w-sm mx-auto">
                            <div className="space-y-2 text-left">
                                <Label htmlFor="license-key">Kode Lisensi</Label>
                                <Input 
                                    id="license-key"
                                    placeholder="Masukkan kode lisensi (XXXXXX...)"
                                    value={licenseCode}
                                    onChange={(e) => setLicenseCode(e.target.value)}
                                    className="uppercase"
                                />
                            </div>
                            <Button 
                                onClick={() => handleVerifyLicense()}
                                className="w-full font-bold h-11"
                                disabled={isVerifyingLicense}
                            >
                                {isVerifyingLicense ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Verifikasi Lisensi"}
                            </Button>
                            <div className="relative py-2">
                                <div className="absolute inset-0 flex items-center"><span className="w-full border-t"></span></div>
                                <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">Atau</span></div>
                            </div>
                            <Button 
                                variant="outline"
                                onClick={handleBuyLicense}
                                className="w-full border-accent text-accent hover:bg-accent/5 font-bold h-11"
                            >
                                Beli Lisensi Sekarang
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right: Benefits */}
              <div className="space-y-6">
                <Card className="border-border/50 shadow-sm bg-accent/5 border-accent/20">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-accent" />
                      Kenapa CV Analyzer?
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                           <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-sm">ATS Optimized</p>
                          <p className="text-xs text-muted-foreground">Gunakan kriteria ATS (Applicant Tracking System) terbaru.</p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center flex-shrink-0">
                           <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-sm">Smart Role Matching</p>
                          <p className="text-xs text-muted-foreground">Mencocokkan CV kamu dengan posisi pekerjaan spesifik.</p>
                        </div>
                      </div>
                    </div>

                    {!embedded && (
                      <div className="mt-8 pt-6 border-t border-border/50">
                          <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                              Beli lisensi untuk mendapatkan review CV profesional.
                          </p>
                          <Button variant="outline" className="w-full h-10 text-xs" onClick={handleBuyLicense}>
                              Cara Mendapatkan Lisensi
                          </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-border/50 shadow-sm">
                  <CardContent className="p-6">
                    <h3 className="font-bold mb-3 text-sm">Keunggulan AI CV Analyzer</h3>
                    <ul className="space-y-3 text-sm text-muted-foreground">
                      <li className="flex gap-3">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <span>Scan keyword ATS secara otomatis sesuai posisi target</span>
                      </li>
                      <li className="flex gap-3">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <span>Identifikasi gap antara CV dan requirements job</span>
                      </li>
                      <li className="flex gap-3">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <span>Rekomendasi perbaikan instan dan terperinci</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            /* Analysis Result View */
            <div className="space-y-8 animate-fade-in">
              <div className="flex justify-between items-center no-print">
                <Button variant="ghost" onClick={() => setAnalysisResult(null)} className="hover:bg-accent/5">
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Kembali ke Upload
                </Button>
                <Button onClick={handleDownloadPDF} variant="outline" className="gap-2" disabled={isDownloading}>
                    {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    Simpan ke PDF
                </Button>
              </div>

              <div className="fixed left-[-9999px] top-0 no-print" aria-hidden="true">
                <div 
                  ref={pdfRef} 
                  style={{ 
                    width: "210mm",
                    height: "auto",
                    padding: "10mm", 
                    background: "white",
                    color: "#1e293b",
                    boxSizing: "border-box",
                    position: "relative",
                    margin: "0 auto"
                  }}
                  className="font-rubik"
                >
                  {/* PDF Header with Branding */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '3px solid #f97316', paddingBottom: '15px', marginBottom: '25px' }}>
                    <div>
                      <img 
                        src="/Intelligo.Id_Main Logo Hor (Transparant).png" 
                        alt="Intelligo ID Logo" 
                        style={{ height: '55px', width: 'auto', marginBottom: '5px' }}
                      />
                      <p style={{ fontSize: '14px', color: '#64748b', fontWeight: 600, margin: '2px 0 0 0', textTransform: 'uppercase', letterSpacing: '2px' }}>
                        Professional AI CV
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>OFFICIAL REPORT</p>
                      <p style={{ fontSize: '13px', color: '#94a3b8', margin: '2px 0 0 0' }}>
                        {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  {/* Top Summary Card */}
                  <div style={{ display: 'flex', gap: '20px', marginBottom: '25px' }}>
                    {/* Candidate Info Section */}
                    <div style={{ flex: '2.5', border: '1.5px solid #e2e8f0', borderRadius: '24px', padding: '25px', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <p style={{ fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>Name</p>
                      <h2 style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a', margin: '0 0 15px 0', lineHeight: '1.1' }}>{analysisResult?.candidateName}</h2>
                      
                      <p style={{ fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '4px', borderTop: '1px solid #e2e8f0', paddingTop: '15px' }}>Target Position Analysis</p>
                      <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#f97316', margin: 0, lineHeight: '1.2' }}>{analysisResult?.role}</h3>
                    </div>

                    {/* Score Section */}
                    <div style={{ flex: '1', border: '1.5px solid #e2e8f0', borderRadius: '24px', padding: '25px', textAlign: 'center', backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between' }}>
                      <p style={{ fontSize: '12px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '2px', margin: 0 }}>MATCH SCORE</p>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1px', marginTop: '-5px' }}>
                        <span style={{ fontSize: '72px', fontWeight: 900, color: '#0f172a', lineHeight: '1' }}>{analysisResult?.skorKecocokanRole}</span>
                        <span style={{ fontSize: '32px', fontWeight: 900, color: '#94a3b8', lineHeight: '1' }}>%</span>
                      </div>
                      <div style={{ height: '12px' }}></div>
                    </div>
                  </div>

                  {/* Detailed Analysis Section (Two Columns) */}
                  <div style={{ display: 'flex', gap: '20px', marginBottom: '25px' }}>
                    {/* Strengths */}
                    <div style={{ flex: 1, backgroundColor: '#f0fdf4', border: '1px solid #dcfce7', borderRadius: '20px', padding: '20px' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#166534', margin: '0 0 15px 0', borderBottom: '1.5px solid #bbf7d0', paddingBottom: '8px' }}>
                        ✓ KEKUATAN UTAMA (STRENGTHS)
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {analysisResult?.kekuatanUtama.map((item, i) => (
                          <div key={i} style={{ fontSize: '13px', color: '#14532d', display: 'flex', gap: '8px', lineHeight: '1.5' }}>
                            <span style={{ color: '#22c55e', fontWeight: 900 }}>•</span>
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Gaps */}
                    <div style={{ flex: 1, backgroundColor: '#fff7ed', border: '1px solid #ffedd5', borderRadius: '20px', padding: '20px' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#9a3412', margin: '0 0 15px 0', borderBottom: '1.5px solid #fed7aa', paddingBottom: '8px' }}>
                        ! AREA KELEMAHAN (GAPS)
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {analysisResult?.gaps.map((item, i) => (
                          <div key={i} style={{ fontSize: '13px', color: '#7c2d12', display: 'flex', gap: '8px', lineHeight: '1.5' }}>
                            <span style={{ color: '#f97316', fontWeight: 900 }}>•</span>
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Priority Action Plan (Numbered List) */}
                  <div style={{ border: '1.5px solid #f1f5f9', borderRadius: '24px', padding: '25px', backgroundColor: '#ffffff', marginBottom: '25px', marginTop: '25px' }}>
                    <h3 style={{ fontSize: '17px', fontWeight: 900, color: '#0f172a', margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '20px' }}>⚡</span> STRATEGI PERBAIKAN (ACTION PLAN)
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {analysisResult?.prioritasPerbaikan.map((item, i) => (
                        <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: '#374155', flexShrink: 0, lineHeight: '1.6' }}>{i + 1}.</span>
                          <p style={{ fontSize: '13px', lineHeight: '1.6', fontWeight: 500, color: '#374155', margin: 0, flex: 1 }}>
                            {item}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Expert Advice Section */}
                  <div style={{ backgroundColor: '#0f172a', borderRadius: '24px', padding: '25px', color: 'white' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#f97316', margin: '0 0 15px 0', display: 'flex', alignItems: 'center', gap: '10px', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                      <span style={{ fontSize: '18px' }}>💡</span> Expert Career Advice
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
                      {analysisResult?.suggestions.map((item, i) => (
                        <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                          <div style={{ width: '3px', height: '100%', backgroundColor: '#f97316', borderRadius: '2px', flexShrink: 0 }}></div>
                          <p style={{ fontSize: '13px', fontStyle: 'italic', color: '#cbd5e1', lineHeight: '1.6', margin: 0 }}>
                            "{item}"
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* PDF Footer */}
                  <div style={{ marginTop: '30px', paddingTop: '20px', paddingBottom: '20px', borderTop: '1px solid #e2e8f0', textAlign: 'center', backgroundColor: '#f9fafb' }}>
                    <p style={{ fontSize: '13px', color: '#1f2937', fontWeight: 700, margin: '0 0 3px 0', letterSpacing: '1px' }}>INTELLIGO ID • AI CV ANALYZER</p>
                    <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 5px 0' }}>www.intelligo.id</p>
                    <p style={{ fontSize: '11px', color: '#f97316', fontWeight: 600, margin: 0 }}>#JadikanCVKamuStandOut</p>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {/* Match Score Card */}
                <Card className="md:col-span-1 border-accent/20 bg-accent/5 overflow-hidden">
                  <CardContent className="p-8 text-center space-y-6">
                    <h3 className="font-bold text-muted-foreground uppercase tracking-wider text-xs">Match Score</h3>
                    <div className="relative inline-flex items-center justify-center w-40 h-40">
                      <svg className="w-40 h-40 transform -rotate-90">
                        <circle
                          cx="80"
                          cy="80"
                          r="72"
                          stroke="currentColor"
                          strokeWidth="12"
                          fill="transparent"
                          className="text-muted/20"
                        />
                        <circle
                          cx="80"
                          cy="80"
                          r="72"
                          stroke="currentColor"
                          strokeWidth="12"
                          fill="transparent"
                          strokeDasharray={452.4}
                          strokeDashoffset={452.4 - (452.4 * analysisResult.skorKecocokanRole) / 100}
                          className="text-accent transition-all duration-1000 ease-out"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-5xl font-black text-foreground leading-none transform -translate-y-1">{analysisResult.skorKecocokanRole}</span>
                      </div>
                    </div>
                    <div className="pt-6 border-t border-accent/10">
                      <p className="text-xs text-muted-foreground uppercase font-bold tracking-tighter mb-1">Nama</p>
                      <p className="text-lg font-black text-foreground leading-none mb-4">{analysisResult.candidateName}</p>
                      <p className="text-xs text-muted-foreground uppercase font-bold tracking-tighter mb-1">Posisi yang Dituju</p>
                      <p className="text-sm font-bold text-accent">{analysisResult.role}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Key Insights */}
                <div className="md:col-span-2 space-y-6">
                  <Card className="border-emerald-500/20 bg-emerald-50/30">
                    <CardContent className="p-6">
                      <h3 className="font-bold text-emerald-700 flex items-center gap-2 mb-4">
                        <CheckCircle2 className="w-5 h-5" />
                        Kekuatan Utama CV
                      </h3>
                      <ul className="space-y-3">
                        {analysisResult.kekuatanUtama.map((item, i) => (
                          <li key={i} className="flex gap-3 text-sm text-emerald-800">
                            <span className="font-bold text-emerald-500 flex-shrink-0">•</span> 
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border-orange-500/20 bg-orange-50/30">
                    <CardContent className="p-6">
                      <h3 className="font-bold text-orange-700 flex items-center gap-2 mb-4">
                        <AlertCircle className="w-5 h-5" />
                        Gaps & Area Perbaikan
                      </h3>
                      <ul className="space-y-3">
                        {analysisResult.gaps.map((item, i) => (
                          <li key={i} className="flex gap-3 text-sm text-orange-800">
                            <span className="font-bold text-orange-500 flex-shrink-0">•</span> 
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Action Plan */}
              <Card className="border-border/50">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
                    <Zap className="w-6 h-6 text-accent" />
                    Prioritas Perbaikan (Action Plan)
                  </h3>
                  <div className="grid md:grid-cols-2 gap-10">
                    <div className="space-y-6">
                      {analysisResult.prioritasPerbaikan.map((item, i) => (
                        <div key={i} className="flex gap-4 items-center group">
                          <div className="w-10 h-10 rounded-xl bg-accent text-white flex items-center justify-center font-bold flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                            <span className="leading-none transform -translate-y-[1px]">{i + 1}</span>
                          </div>
                          <p className="text-sm font-medium leading-relaxed">{item}</p>
                        </div>
                      ))}
                    </div>
                    <div className="bg-muted/30 rounded-2xl p-8 border border-border/50">
                      <h4 className="font-bold mb-4 text-sm flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-accent" />
                        💡 Tips Expert:
                      </h4>
                      <ul className="space-y-4">
                        {analysisResult.suggestions.map((item, i) => (
                          <li key={i} className="text-sm text-muted-foreground italic leading-relaxed">
                            "{item}"
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Final CTA */}
              <div className="bg-slate-900 rounded-3xl p-10 text-white text-center shadow-xl no-print">
                <h3 className="text-2xl font-bold mb-3">Butuh Bantuan Personal?</h3>
                <p className="text-slate-400 mb-8 max-w-xl mx-auto leading-relaxed">
                  Dapatkan review mendalam 1-on-1 dengan mentor kami untuk memastikan CV kamu benar-benar stand out di mata recruiter.
                </p>
                <Button className="bg-accent hover:bg-accent/90 text-white font-bold h-12 px-10 rounded-full text-lg shadow-lg shadow-accent/20 transition-all hover:scale-105" asChild>
                  <a href="https://intelligo.id/wa-mintell" target="_blank" rel="noopener noreferrer">
                    Hubungi Mentor via WhatsApp
                  </a>
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      {!embedded && (
        <div className="no-print">
        </div>
      )}
    </div>
  );
};

// Simple Zap icon since it's not imported from lucide
const Zap = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

export default AICVAnalyzer;
