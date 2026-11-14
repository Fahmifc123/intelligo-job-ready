export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  experience: string;
  posted: string;
  logo?: string;
  tags: string[];
  description: string;
  requirements: string[];
  source?: string;
  scraped_at?: string;
  /** Lowongan dari admin: link lamaran di situs aslinya & batas lamaran (YYYY-MM-DD). */
  applyUrl?: string | null;
  deadline?: string | null;
}

export const UNKNOWN_COMPANY_LABEL = "Perusahaan tidak disebutkan";
