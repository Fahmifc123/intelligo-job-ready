import jsPDF from "jspdf";
import { CoverLetterData } from "./types";

// Native jsPDF text layout -- sama seperti generateCvPdf.ts, sengaja TIDAK
// pakai html2canvas supaya hasilnya teks asli yang bisa di-copy/di-parse ATS,
// bukan gambar screenshot.

const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const MARGIN_X = 22;
const MARGIN_TOP = 22;
const MARGIN_BOTTOM = 22;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_X * 2;

export function generateCoverLetterPdf(letter: CoverLetterData): jsPDF {
  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  let y = MARGIN_TOP;

  const ensureSpace = (needed: number) => {
    if (y + needed > PAGE_HEIGHT - MARGIN_BOTTOM) {
      pdf.addPage();
      y = MARGIN_TOP;
    }
  };

  const writeWrapped = (text: string, x: number, maxWidth: number, lineHeight = 5.5) => {
    if (!text) return;
    const lines = pdf.splitTextToSize(text, maxWidth) as string[];
    for (const line of lines) {
      ensureSpace(lineHeight);
      pdf.text(line, x, y);
      y += lineHeight;
    }
  };

  // --- Sender header ---
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(14);
  pdf.setTextColor(10, 10, 10);
  pdf.text(letter.senderName || "Nama Lengkap", MARGIN_X, y);
  y += 6;

  const senderContactParts = [letter.senderEmail, letter.senderPhone, letter.senderLocation].filter(Boolean);
  if (senderContactParts.length > 0) {
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9.5);
    pdf.setTextColor(100, 100, 100);
    writeWrapped(senderContactParts.join("   |   "), MARGIN_X, CONTENT_WIDTH, 4.5);
  }
  y += 6;

  // --- Date ---
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.setTextColor(30, 30, 30);
  if (letter.date) {
    pdf.text(letter.date, MARGIN_X, y);
    y += 8;
  }

  // --- Recipient block ---
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10.5);
  pdf.setTextColor(30, 30, 30);
  const recipientLines = [
    letter.recipientName,
    letter.recipientTitle,
    letter.companyName,
    letter.companyAddress,
  ].filter(Boolean);
  recipientLines.forEach((line) => {
    writeWrapped(line, MARGIN_X, CONTENT_WIDTH, 5);
  });
  if (recipientLines.length > 0) y += 4;

  // --- Job title reference line ---
  if (letter.jobTitle) {
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10.5);
    pdf.setTextColor(20, 20, 20);
    writeWrapped(`Perihal: Lamaran untuk Posisi ${letter.jobTitle}`, MARGIN_X, CONTENT_WIDTH, 5.5);
    y += 4;
  }

  // --- Salutation ---
  if (letter.salutation) {
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10.5);
    pdf.setTextColor(30, 30, 30);
    writeWrapped(letter.salutation, MARGIN_X, CONTENT_WIDTH, 5.5);
    y += 3;
  }

  // --- Body paragraphs ---
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10.5);
  pdf.setTextColor(20, 20, 20);
  [letter.openingParagraph, letter.bodyParagraph, letter.closingParagraph]
    .filter((p) => p && p.trim())
    .forEach((paragraph) => {
      writeWrapped(paragraph.trim(), MARGIN_X, CONTENT_WIDTH, 5.5);
      y += 4;
    });

  // --- Sign-off ---
  y += 2;
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10.5);
  pdf.setTextColor(30, 30, 30);
  if (letter.signOff) {
    ensureSpace(6);
    pdf.text(letter.signOff, MARGIN_X, y);
    y += 14;
  }
  if (letter.senderName) {
    ensureSpace(6);
    pdf.setFont("helvetica", "bold");
    pdf.text(letter.senderName, MARGIN_X, y);
  }

  return pdf;
}

export function downloadCoverLetterPdf(letter: CoverLetterData) {
  const pdf = generateCoverLetterPdf(letter);
  const safeName = (letter.senderName || "Cover_Letter").replace(/\s+/g, "_");
  pdf.save(`${safeName}_Cover_Letter_Intelligo_ID.pdf`);
}
