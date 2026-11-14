import { Job } from "@/components/jobboard/types";
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

/** Lowongan Job Ready, khusus alumni yang login (endpoint /api/alumni/jobs).
 * Tanpa token alumni, hasilnya kosong: data lowongan tidak dibuka untuk publik. */
export function useJobListings(): Job[] {
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("alumni_token");
    if (!token) return;
    let active = true;
    fetch("/api/alumni/jobs", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => (res.ok ? res.json() : { jobs: [] }))
      .then((data: { jobs?: ApiJob[] }) => active && setJobs(Array.isArray(data.jobs) ? data.jobs.map(toJob) : []))
      .catch(() => active && setJobs([]));
    return () => {
      active = false;
    };
  }, []);

  return jobs;
}
