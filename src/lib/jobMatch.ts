import { Job } from "@/components/jobboard/types";

function normalize(text: string): string {
  return text.trim().toLowerCase();
}

/**
 * Skor kecocokan lowongan berdasarkan overlap antara skill alumni (dari CV
 * Builder / profil karier) dan tags lowongan. Dihitung deterministik di
 * client -- bukan lewat panggilan AI -- supaya instan dan gratis untuk
 * setiap lowongan di Job Board, bukannya satu panggilan LLM per kartu.
 * Return null kalau tidak ada cukup data untuk menghitung skor yang berarti.
 */
export function calculateMatchScore(alumniSkills: string[], job: Job): number | null {
  if (!job.tags || job.tags.length === 0) return null;

  const normalizedAlumniSkills = alumniSkills.map(normalize).filter(Boolean);
  if (normalizedAlumniSkills.length === 0) return null;

  const matchedTags = job.tags.filter((tag) => {
    const normalizedTag = normalize(tag);
    return normalizedAlumniSkills.some(
      (skill) => normalizedTag.includes(skill) || skill.includes(normalizedTag)
    );
  });

  return Math.round((matchedTags.length / job.tags.length) * 100);
}
