import { Button } from "@/components/ui/button";
import { useAlumniAuth } from "@/contexts/AlumniAuthContext";
import { Loader2, Sparkles } from "lucide-react";
import { useState } from "react";

interface AiAssistButtonProps {
  fieldType: string;
  currentText: string;
  context?: string;
  onApply: (text: string) => void;
  endpoint?: string;
}

/**
 * Bantuan AI opsional untuk memperhalus teks yang SUDAH ditulis user (lihat
 * CV_AI_ASSIST_SYSTEM_PROMPT / COVER_LETTER_AI_ASSIST_SYSTEM_PROMPT di
 * api/main.py — AI dilarang mengarang fakta baru). Hasilnya ditampilkan
 * sebagai saran yang harus diklik "Gunakan" secara sadar oleh user, tidak
 * pernah menimpa field secara otomatis. `endpoint` dibuat bisa diganti supaya
 * komponen ini bisa dipakai ulang lintas fitur (CV Builder, Cover Letter).
 */
export default function AiAssistButton({ fieldType, currentText, context, onApply, endpoint = "/alumni/cv/ai-assist" }: AiAssistButtonProps) {
  const { fetchAsAlumni } = useAlumniAuth();
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [error, setError] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    setSuggestion(null);
    setError(false);
    try {
      const response = await fetchAsAlumni(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field_type: fieldType, current_text: currentText, context: context || "" }),
      });
      if (response.ok) {
        const data = await response.json();
        setSuggestion(data.suggestion);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-1.5">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-7 text-xs gap-1 text-accent hover:text-accent px-2"
        onClick={handleClick}
        disabled={loading}
      >
        {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
        Perbaiki dengan AI
      </Button>

      {error && <p className="text-xs text-destructive">Gagal memuat saran AI. Coba lagi.</p>}

      {suggestion && (
        <div className="rounded-md border border-accent/30 bg-accent/5 p-2.5 text-xs space-y-2">
          <p className="text-neutral-700 whitespace-pre-line">{suggestion}</p>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              className="h-6 text-xs px-2"
              onClick={() => {
                onApply(suggestion);
                setSuggestion(null);
              }}
            >
              Gunakan
            </Button>
            <Button type="button" variant="ghost" size="sm" className="h-6 text-xs px-2" onClick={() => setSuggestion(null)}>
              Tutup
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
