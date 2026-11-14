import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useJobListings } from "@/hooks/use-job-listings";
import { calculateMatchScore } from "@/lib/jobMatch";
import {
    Bookmark,
    BookmarkCheck,
    Briefcase,
    Building2,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Clock,
    Filter,
    MapPin,
    Search,
    Target
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import JobDetailModal from "./JobDetailModal";
import { Job } from "./types";

interface JobBoardContentProps {
  showBookmarks?: boolean;
  savedJobIds?: string[];
  onToggleSave?: (jobId: string) => void;
  /** Restrict the board to only the saved jobs (used on the alumni "saved" view) */
  onlySavedJobs?: boolean;
  /** Skill alumni (dari CV Builder / profil) untuk menghitung skor kecocokan lowongan */
  matchSkills?: string[];
}

function matchBadgeClass(score: number): string {
  if (score >= 60) return "bg-green-600 hover:bg-green-600 text-white";
  if (score >= 30) return "bg-amber-500 hover:bg-amber-500 text-white";
  return "bg-neutral-400 hover:bg-neutral-400 text-white";
}

export default function JobBoardContent({
  showBookmarks = false,
  savedJobIds = [],
  onToggleSave,
  onlySavedJobs = false,
  matchSkills,
}: JobBoardContentProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [jobTypeFilter, setJobTypeFilter] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortByMatch, setSortByMatch] = useState(false);
  const jobsPerPage = 9;

  const hasMatchSkills = Boolean(matchSkills && matchSkills.length > 0);
  const getMatchScore = (job: Job): number | null =>
    matchSkills ? calculateMatchScore(matchSkills, job) : null;

  const jobsSectionRef = useRef<HTMLDivElement>(null);

  const allJobs = useJobListings();
  const baseJobs = useMemo(
    () => (onlySavedJobs ? allJobs.filter((job) => savedJobIds.includes(job.id)) : allJobs),
    [allJobs, onlySavedJobs, savedJobIds]
  );

  const filteredJobs = useMemo(() => {
    return baseJobs.filter((job) => {
      const matchesSearch =
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesLocation = locationFilter
        ? job.location.toLowerCase().includes(locationFilter.toLowerCase())
        : true;
      const matchesType = jobTypeFilter ? job.type === jobTypeFilter : true;
      const matchesTags = selectedTags.length > 0 ? selectedTags.every((tag) => job.tags.includes(tag)) : true;

      return matchesSearch && matchesLocation && matchesType && matchesTags;
    });
  }, [baseJobs, searchTerm, locationFilter, jobTypeFilter, selectedTags]);

  const sortedJobs = useMemo(() => {
    if (!sortByMatch || !matchSkills) return filteredJobs;
    return [...filteredJobs].sort(
      (a, b) => (calculateMatchScore(matchSkills, b) ?? -1) - (calculateMatchScore(matchSkills, a) ?? -1)
    );
  }, [filteredJobs, sortByMatch, matchSkills]);

  const totalPages = Math.ceil(sortedJobs.length / jobsPerPage);
  const startIndex = (currentPage - 1) * jobsPerPage;
  const currentJobs = sortedJobs.slice(startIndex, startIndex + jobsPerPage);

  const allTags = useMemo(() => Array.from(new Set(baseJobs.flatMap((job) => job.tags))), [baseJobs]);

  const toggleTag = (tag: string) => {
    setCurrentPage(1);
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    setTimeout(() => {
      jobsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const openDetail = (job: Job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  return (
    <div>
      {/* Search Bar */}
      <div className="bg-card rounded-2xl p-6 shadow-lg border border-border/50 mb-8">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Posisi, perusahaan, atau skill..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => {
                setCurrentPage(1);
                setSearchTerm(e.target.value);
              }}
            />
          </div>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Lokasi"
              className="pl-10"
              value={locationFilter}
              onChange={(e) => {
                setCurrentPage(1);
                setLocationFilter(e.target.value);
              }}
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <select
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 pl-10"
              value={jobTypeFilter}
              onChange={(e) => {
                setCurrentPage(1);
                setJobTypeFilter(e.target.value);
              }}
            >
              <option value="">Tipe Pekerjaan</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Internship">Internship</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tags Filter */}
      {allTags.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-bold text-foreground mb-4">Filter by Skills</h3>
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <Badge
                key={tag}
                variant={selectedTags.includes(tag) ? "default" : "outline"}
                className="cursor-pointer px-3 py-2 text-sm"
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Jobs Grid */}
      <div ref={jobsSectionRef}>
        <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
          <h2 className="text-2xl font-bold text-foreground">Lowongan Kerja ({filteredJobs.length})</h2>
          <div className="flex items-center gap-3">
            {hasMatchSkills && (
              <Button
                variant={sortByMatch ? "default" : "outline"}
                size="sm"
                className="gap-1.5 text-xs"
                onClick={() => setSortByMatch((prev) => !prev)}
              >
                <Target className="w-3.5 h-3.5" />
                Urutkan: Kecocokan Tertinggi
              </Button>
            )}
            <div className="text-muted-foreground text-sm">{filteredJobs.length} posisi tersedia</div>
          </div>
        </div>

        {filteredJobs.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {onlySavedJobs ? "Belum ada lowongan tersimpan" : "Tidak ada lowongan ditemukan"}
            </h3>
            <p className="text-muted-foreground text-sm">
              {onlySavedJobs ? "Simpan lowongan yang menarik untuk dilihat di sini." : "Coba ubah filter pencarian Anda"}
            </p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentJobs.map((job) => {
                const isSaved = savedJobIds.includes(job.id);
                const matchScore = getMatchScore(job);
                return (
                  <Card key={job.id} className="hover:shadow-md transition-all border-border/50 h-full">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                            <Building2 className="w-5 h-5 text-accent" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-base font-bold text-foreground line-clamp-1">{job.title}</h3>
                            <p className="text-muted-foreground text-sm flex items-center gap-1 truncate">
                              <Building2 className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{job.company}</span>
                            </p>
                          </div>
                        </div>
                        {showBookmarks && onToggleSave && (
                          <button
                            onClick={() => onToggleSave(job.id)}
                            aria-label={isSaved ? "Hapus dari tersimpan" : "Simpan lowongan"}
                            className="flex-shrink-0 text-muted-foreground hover:text-accent transition-colors"
                          >
                            {isSaved ? <BookmarkCheck className="w-5 h-5 text-accent" /> : <Bookmark className="w-5 h-5" />}
                          </button>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="pb-2">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <div className="flex items-center gap-1 text-muted-foreground text-xs">
                          <MapPin className="w-3 h-3" />
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground text-xs">
                          <Clock className="w-3 h-3" />
                          <span>{job.experience}</span>
                        </div>
                        {matchScore !== null && (
                          <Badge className={`text-xs gap-1 ${matchBadgeClass(matchScore)}`}>
                            <Target className="w-3 h-3" />
                            {matchScore}% Match
                          </Badge>
                        )}
                      </div>

                      <p className="text-muted-foreground text-xs mb-3 line-clamp-2">{job.description}</p>

                      <div className="flex flex-wrap gap-1">
                        {job.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs px-2 py-0.5">
                            {tag}
                          </Badge>
                        ))}
                        {job.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs px-2 py-0.5">
                            +{job.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    </CardContent>

                    <CardFooter className="flex justify-between items-center pt-2 border-t border-border/30">
                      <div className="text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3 inline mr-1" />
                        {job.posted}
                      </div>
                      <Button size="sm" className="bg-accent hover:bg-accent/90 text-xs h-7" onClick={() => openDetail(job)}>
                        Detail
                        <ChevronRight className="w-3 h-3 ml-1" />
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="flex flex-wrap justify-center items-center gap-1.5 sm:gap-2 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  aria-label="Halaman sebelumnya"
                  className="px-2 sm:px-3"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Sebelumnya</span>
                </Button>

                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        className="h-9 w-9 p-0 sm:h-10 sm:w-10"
                        onClick={() => handlePageChange(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  aria-label="Halaman berikutnya"
                  className="px-2 sm:px-3"
                >
                  <span className="hidden sm:inline">Berikutnya</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <JobDetailModal
        job={selectedJob}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        showBookmark={showBookmarks}
        isSaved={selectedJob ? savedJobIds.includes(selectedJob.id) : false}
        matchScore={selectedJob ? getMatchScore(selectedJob) : null}
        onToggleSave={onToggleSave}
      />
    </div>
  );
}
