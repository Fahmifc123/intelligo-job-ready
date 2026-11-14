import { CvData } from "./types";

interface CvPreviewTemplateProps {
  cv: CvData;
}

function formatDateRange(start: string, end: string, current?: boolean): string {
  const endLabel = current ? "Sekarang" : end;
  if (!start && !endLabel) return "";
  if (!start) return endLabel;
  if (!endLabel) return start;
  return `${start} — ${endLabel}`;
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[11px] font-bold uppercase tracking-wide text-neutral-800 border-b border-neutral-300 pb-1 mb-2 mt-4">
      {children}
    </h2>
  );
}

/**
 * Preview visual saja — tampilan sebenarnya dari file PDF dihasilkan
 * terpisah lewat generateCvPdf.ts (native jsPDF text layout, bukan
 * screenshot dari komponen ini), supaya PDF-nya berisi teks asli yang bisa
 * di-copy dan di-parse ATS. Layout di sini dibuat semirip mungkin sebagai
 * referensi visual untuk alumni saat mengisi form.
 */
export default function CvPreviewTemplate({ cv }: CvPreviewTemplateProps) {
  const contactParts = [
    cv.personal.email,
    cv.personal.phone,
    cv.personal.location,
    cv.personal.linkedinUrl,
    cv.personal.portfolioUrl,
  ].filter(Boolean);

  return (
    <div className="bg-white text-neutral-900 shadow-sm border border-border/50 rounded-md w-full max-w-[210mm] mx-auto p-8 text-sm aspect-[210/297] overflow-y-auto">
      <h1 className="text-2xl font-bold text-neutral-900">
        {cv.personal.fullName || "Nama Lengkap"}
      </h1>
      {cv.personal.headline && (
        <p className="text-neutral-600 text-base mt-1">{cv.personal.headline}</p>
      )}
      {contactParts.length > 0 && (
        <p className="text-neutral-500 text-xs mt-2">{contactParts.join("   |   ")}</p>
      )}

      {cv.personal.summary && (
        <div>
          <SectionHeading>Ringkasan</SectionHeading>
          <p className="text-neutral-800 text-[13px] leading-relaxed whitespace-pre-line">
            {cv.personal.summary}
          </p>
        </div>
      )}

      {cv.experiences.length > 0 && (
        <div>
          <SectionHeading>Pengalaman Kerja</SectionHeading>
          <div className="space-y-3">
            {cv.experiences.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline gap-2">
                  <p className="font-semibold text-neutral-900">{exp.title || "Posisi"}</p>
                  <p className="text-xs text-neutral-500 whitespace-nowrap">
                    {formatDateRange(exp.startDate, exp.endDate, exp.current)}
                  </p>
                </div>
                {(exp.company || exp.location) && (
                  <p className="text-neutral-600 italic text-[13px]">
                    {[exp.company, exp.location].filter(Boolean).join(" — ")}
                  </p>
                )}
                {exp.bullets.filter((b) => b.trim()).length > 0 && (
                  <ul className="list-disc list-outside ml-4 mt-1 space-y-0.5 text-[13px] text-neutral-800">
                    {exp.bullets.filter((b) => b.trim()).map((bullet, idx) => (
                      <li key={idx}>{bullet}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {cv.education.length > 0 && (
        <div>
          <SectionHeading>Pendidikan</SectionHeading>
          <div className="space-y-2">
            {cv.education.map((edu) => (
              <div key={edu.id}>
                <div className="flex justify-between items-baseline gap-2">
                  <p className="font-semibold text-neutral-900">
                    {[edu.degree, edu.field].filter(Boolean).join(" — ") || "Program Studi"}
                  </p>
                  <p className="text-xs text-neutral-500 whitespace-nowrap">
                    {formatDateRange(edu.startDate, edu.endDate)}
                  </p>
                </div>
                {edu.school && <p className="text-neutral-600 italic text-[13px]">{edu.school}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {cv.skills.length > 0 && (
        <div>
          <SectionHeading>Skill</SectionHeading>
          <p className="text-neutral-800 text-[13px]">{cv.skills.join(", ")}</p>
        </div>
      )}

      {cv.certifications.length > 0 && (
        <div>
          <SectionHeading>Sertifikat</SectionHeading>
          <div className="space-y-1">
            {cv.certifications.map((cert) => (
              <p key={cert.id} className="text-neutral-800 text-[13px]">
                {cert.name}
                {cert.issuer && ` — ${cert.issuer}`}
                {cert.date && ` (${cert.date})`}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
