import { CoverLetterData } from "./types";

interface CoverLetterPreviewTemplateProps {
  letter: CoverLetterData;
}

/**
 * Preview visual saja — hasil PDF sebenarnya dihasilkan terpisah lewat
 * generateCoverLetterPdf.ts (native jsPDF text layout, bukan screenshot dari
 * komponen ini), supaya PDF-nya berisi teks asli yang bisa di-copy dan
 * di-parse ATS.
 */
export default function CoverLetterPreviewTemplate({ letter }: CoverLetterPreviewTemplateProps) {
  const senderContactParts = [letter.senderEmail, letter.senderPhone, letter.senderLocation].filter(Boolean);
  const recipientLines = [letter.recipientName, letter.recipientTitle, letter.companyName, letter.companyAddress].filter(Boolean);

  return (
    <div className="bg-white text-neutral-900 shadow-sm border border-border/50 rounded-md w-full max-w-[210mm] mx-auto p-8 text-sm aspect-[210/297] overflow-y-auto">
      <p className="font-bold text-neutral-900">{letter.senderName || "Nama Lengkap"}</p>
      {senderContactParts.length > 0 && (
        <p className="text-neutral-500 text-xs mt-1">{senderContactParts.join("   |   ")}</p>
      )}

      {letter.date && <p className="text-neutral-800 text-[13px] mt-4">{letter.date}</p>}

      {recipientLines.length > 0 && (
        <div className="mt-4 text-[13px] text-neutral-800 space-y-0.5">
          {recipientLines.map((line, idx) => (
            <p key={idx}>{line}</p>
          ))}
        </div>
      )}

      {letter.jobTitle && (
        <p className="font-bold text-neutral-900 text-[13px] mt-4">
          Perihal: Lamaran untuk Posisi {letter.jobTitle}
        </p>
      )}

      {letter.salutation && <p className="text-neutral-800 text-[13px] mt-4">{letter.salutation}</p>}

      <div className="mt-3 space-y-3 text-[13px] text-neutral-800 leading-relaxed">
        {letter.openingParagraph && <p className="whitespace-pre-line">{letter.openingParagraph}</p>}
        {letter.bodyParagraph && <p className="whitespace-pre-line">{letter.bodyParagraph}</p>}
        {letter.closingParagraph && <p className="whitespace-pre-line">{letter.closingParagraph}</p>}
      </div>

      {letter.signOff && <p className="text-neutral-800 text-[13px] mt-6">{letter.signOff}</p>}
      {letter.senderName && <p className="font-bold text-neutral-900 text-[13px] mt-8">{letter.senderName}</p>}
    </div>
  );
}
