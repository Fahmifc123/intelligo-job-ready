import jsPDF from "jspdf";
import { CvData } from "./types";

// Native jsPDF text layout — deliberately NOT html2canvas (the pattern used
// by AICVAnalyzer.tsx for its analysis report). A screenshot-to-PDF has no
// real text layer, so it can't be parsed by ATS software or copy-pasted —
// that would defeat the entire point of an "ATS-friendly" CV builder.

const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const MARGIN_X = 18;
const MARGIN_TOP = 18;
const MARGIN_BOTTOM = 18;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_X * 2;

function formatDateRange(start: string, end: string, current: boolean): string {
  const endLabel = current ? "Sekarang" : end;
  if (!start && !endLabel) return "";
  if (!start) return endLabel;
  if (!endLabel) return start;
  return `${start} — ${endLabel}`;
}

export function generateCvPdf(cv: CvData): jsPDF {
  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  let y = MARGIN_TOP;

  const ensureSpace = (needed: number) => {
    if (y + needed > PAGE_HEIGHT - MARGIN_BOTTOM) {
      pdf.addPage();
      y = MARGIN_TOP;
    }
  };

  const writeWrapped = (text: string, x: number, maxWidth: number, lineHeight = 5) => {
    if (!text) return;
    const lines = pdf.splitTextToSize(text, maxWidth) as string[];
    for (const line of lines) {
      ensureSpace(lineHeight);
      pdf.text(line, x, y);
      y += lineHeight;
    }
  };

  const sectionHeading = (label: string) => {
    ensureSpace(10);
    y += 3;
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.setTextColor(20, 20, 20);
    pdf.text(label.toUpperCase(), MARGIN_X, y);
    y += 1.5;
    pdf.setDrawColor(180, 180, 180);
    pdf.setLineWidth(0.3);
    pdf.line(MARGIN_X, y, PAGE_WIDTH - MARGIN_X, y);
    y += 5;
  };

  // --- Header: name, headline, contact line ---
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(20);
  pdf.setTextColor(10, 10, 10);
  pdf.text(cv.personal.fullName || "Nama Lengkap", MARGIN_X, y);
  y += 7;

  if (cv.personal.headline) {
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(12);
    pdf.setTextColor(80, 80, 80);
    pdf.text(cv.personal.headline, MARGIN_X, y);
    y += 6;
  }

  const contactParts = [
    cv.personal.email,
    cv.personal.phone,
    cv.personal.location,
    cv.personal.linkedinUrl,
    cv.personal.portfolioUrl,
  ].filter(Boolean);
  if (contactParts.length > 0) {
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.setTextColor(100, 100, 100);
    // Wrap ke beberapa baris kalau tidak muat dalam satu baris, alih-alih
    // membiarkan teksnya kepotong/melewati tepi kanan halaman.
    writeWrapped(contactParts.join("   |   "), MARGIN_X, CONTENT_WIDTH, 4.5);
    y += 1.5;
  }

  // --- Summary ---
  if (cv.personal.summary) {
    sectionHeading("Ringkasan");
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(30, 30, 30);
    writeWrapped(cv.personal.summary, MARGIN_X, CONTENT_WIDTH);
  }

  // --- Experience ---
  if (cv.experiences.length > 0) {
    sectionHeading("Pengalaman Kerja");
    cv.experiences.forEach((exp, idx) => {
      ensureSpace(12);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10.5);
      pdf.setTextColor(20, 20, 20);
      pdf.text(exp.title || "Posisi", MARGIN_X, y);

      const dateRange = formatDateRange(exp.startDate, exp.endDate, exp.current);
      if (dateRange) {
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
        pdf.setTextColor(110, 110, 110);
        const textWidth = pdf.getTextWidth(dateRange);
        pdf.text(dateRange, PAGE_WIDTH - MARGIN_X - textWidth, y);
      }
      y += 5;

      const companyLine = [exp.company, exp.location].filter(Boolean).join(" — ");
      if (companyLine) {
        pdf.setFont("helvetica", "italic");
        pdf.setFontSize(9.5);
        pdf.setTextColor(80, 80, 80);
        pdf.text(companyLine, MARGIN_X, y);
        y += 5;
      }

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9.5);
      pdf.setTextColor(30, 30, 30);
      exp.bullets.filter((b) => b.trim()).forEach((bullet) => {
        const lines = pdf.splitTextToSize(bullet, CONTENT_WIDTH - 5) as string[];
        lines.forEach((line, lineIdx) => {
          ensureSpace(5);
          pdf.text(lineIdx === 0 ? `•  ${line}` : `   ${line}`, MARGIN_X, y);
          y += 5;
        });
      });

      if (idx < cv.experiences.length - 1) y += 2;
    });
  }

  // --- Education ---
  if (cv.education.length > 0) {
    sectionHeading("Pendidikan");
    cv.education.forEach((edu) => {
      ensureSpace(10);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10.5);
      pdf.setTextColor(20, 20, 20);
      const degreeLine = [edu.degree, edu.field].filter(Boolean).join(" — ");
      pdf.text(degreeLine || "Program Studi", MARGIN_X, y);

      const dateRange = formatDateRange(edu.startDate, edu.endDate, false);
      if (dateRange) {
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
        pdf.setTextColor(110, 110, 110);
        const textWidth = pdf.getTextWidth(dateRange);
        pdf.text(dateRange, PAGE_WIDTH - MARGIN_X - textWidth, y);
      }
      y += 5;

      if (edu.school) {
        pdf.setFont("helvetica", "italic");
        pdf.setFontSize(9.5);
        pdf.setTextColor(80, 80, 80);
        pdf.text(edu.school, MARGIN_X, y);
        y += 5;
      }
      y += 2;
    });
  }

  // --- Skills ---
  if (cv.skills.length > 0) {
    sectionHeading("Skill");
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(30, 30, 30);
    writeWrapped(cv.skills.join(", "), MARGIN_X, CONTENT_WIDTH);
  }

  // --- Certifications ---
  if (cv.certifications.length > 0) {
    sectionHeading("Sertifikat");
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9.5);
    pdf.setTextColor(30, 30, 30);
    cv.certifications.forEach((cert) => {
      ensureSpace(5);
      const line = [cert.name, cert.issuer && `— ${cert.issuer}`, cert.date && `(${cert.date})`]
        .filter(Boolean)
        .join(" ");
      writeWrapped(line, MARGIN_X, CONTENT_WIDTH);
    });
  }

  return pdf;
}

export function downloadCvPdf(cv: CvData) {
  const pdf = generateCvPdf(cv);
  const safeName = (cv.personal.fullName || "CV").replace(/\s+/g, "_");
  pdf.save(`${safeName}_Intelligo_ID.pdf`);
}
