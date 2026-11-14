import { Job } from "@/components/jobboard/types";
import jobsData from "@/data/jobs.json";
import { useEffect, useState } from "react";

interface ApiJob {
  id: number;
  title: string;
  company: string;
  location: string;
  job_type: string;
  salary: string | null;
  experience: string | null;
  tags: string[];
  description: string;
  requirements: string[];
  apply_url: string | null;
  deadline: string | null;
  created_at: string;
}

const STATIC_JOBS = jobsData as Job[];

function postedLabel(createdAt: string): string {
  const created = new Date(createdAt.replace(" ", "T") + (createdAt.endsWith("Z") ? "" : "Z"));
  const days = Math.floor((Date.now() - created.getTime()) / 86_400_000);
  if (Number.isNaN(days) || days <= 0) return "Hari ini";
  if (days === 1) return "Kemarin";
  if (days < 30) return `${days} hari lalu`;
  return created.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

function toJob(job: ApiJob): Job {
  return {
    id: `manual_${job.id}`,
    title: job.title,
    company: job.company,
    location: job.location,
    type: job.job_type,
    salary: job.salary || "Gaji tidak ditampilkan",
    experience: job.experience || "Semua level",
    posted: postedLabel(job.created_at),
    tags: job.tags,
    description: job.description,
    requirements: job.requirements,
    applyUrl: job.apply_url,
    deadline: job.deadline,
  };
}

// Satu request per kunjungan, dipakai bersama oleh daftar lowongan dan statistik halaman.
let cache: Promise<Job[]> | null = null;

function loadManualJobs(): Promise<Job[]> {
  cache ??= fetch("/api/public/jobs")
    .then((res) => (res.ok ? res.json() : { jobs: [] }))
    .then((data: { jobs?: ApiJob[] }) => (Array.isArray(data.jobs) ? data.jobs.map(toJob) : []))
    .catch(() => {
      cache = null; // coba lagi di kunjungan berikutnya
      return [];
    });
  return cache;
}

/** Lowongan dari admin (terbaru di atas) lalu data lowongan statis. */
export function useJobListings(): Job[] {
  const [manualJobs, setManualJobs] = useState<Job[]>([]);

  useEffect(() => {
    let active = true;
    loadManualJobs().then((jobs) => active && setManualJobs(jobs));
    return () => {
      active = false;
    };
  }, []);

  return manualJobs.length ? [...manualJobs, ...STATIC_JOBS] : STATIC_JOBS;
}
