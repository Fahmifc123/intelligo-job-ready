import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Bookmark, BookmarkCheck, Briefcase, Building2, Calendar, Clock, ExternalLink, MapPin, Target, Wallet } from "lucide-react";
import { Job, UNKNOWN_COMPANY_LABEL } from "./types";

interface JobDetailModalProps {
  job: Job | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  showBookmark?: boolean;
  isSaved?: boolean;
  onToggleSave?: (jobId: string) => void;
  matchScore?: number | null;
}

function matchBadgeClass(score: number): string {
  if (score >= 60) return "bg-green-600 hover:bg-green-600 text-white";
  if (score >= 30) return "bg-amber-500 hover:bg-amber-500 text-white";
  return "bg-neutral-400 hover:bg-neutral-400 text-white";
}

export default function JobDetailModal({
  job,
  open,
  onOpenChange,
  showBookmark = false,
  isSaved = false,
  onToggleSave,
  matchScore,
}: JobDetailModalProps) {
  if (!job) return null;

  const isUnknownCompany = job.company === UNKNOWN_COMPANY_LABEL;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogTitle className="text-xl">{job.title}</DialogTitle>
              <p className="text-muted-foreground text-sm flex items-center gap-1 mt-1">
                <Building2 className="w-3.5 h-3.5" />
                {job.company}
              </p>
              {isUnknownCompany && (
                <p className="text-xs text-muted-foreground/70 mt-1">
                  Nama perusahaan tidak tersedia dari sumber data.
                </p>
              )}
            </div>
            {showBookmark && onToggleSave && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => onToggleSave(job.id)}
                aria-label={isSaved ? "Hapus dari tersimpan" : "Simpan lowongan"}
                className="flex-shrink-0"
              >
                {isSaved ? <BookmarkCheck className="w-4 h-4 text-accent" /> : <Bookmark className="w-4 h-4" />}
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {matchScore !== null && matchScore !== undefined && (
            <Badge className={`text-sm gap-1.5 w-fit ${matchBadgeClass(matchScore)}`}>
              <Target className="w-3.5 h-3.5" />
              {matchScore}% Kecocokan dengan Skill Kamu
            </Badge>
          )}
          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> {job.location}
            </span>
            <span className="flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5" /> {job.type}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {job.experience}
            </span>
            <span className="flex items-center gap-1">
              <Wallet className="w-3.5 h-3.5" /> {job.salary}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> {job.posted}
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {job.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-1.5">Deskripsi</h4>
            <p className="whitespace-pre-line text-sm text-muted-foreground">{job.description}</p>
          </div>

          {job.requirements?.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm mb-1.5">Kualifikasi</h4>
              <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                {job.requirements.map((req, idx) => (
                  <li key={idx}>{req}</li>
                ))}
              </ul>
            </div>
          )}

          {job.deadline && (
            <p className="text-sm text-muted-foreground">
              Batas lamaran:{" "}
              <span className="font-medium text-foreground">
                {new Date(`${job.deadline}T00:00:00`).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
              </span>
            </p>
          )}

          {job.applyUrl && (
            <Button className="w-full bg-accent hover:bg-accent/90" asChild>
              <a href={job.applyUrl} target="_blank" rel="noopener noreferrer">
                Lamar Sekarang <ExternalLink className="ml-1.5 h-4 w-4" />
              </a>
            </Button>
          )}
          <Button className={job.applyUrl ? "w-full" : "w-full bg-accent hover:bg-accent/90"} variant={job.applyUrl ? "outline" : "default"} asChild>
            <a href="https://intelligo.id/wa-mintell" target="_blank" rel="noopener noreferrer">
              Konsultasi Lowongan Ini via WhatsApp
            </a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
