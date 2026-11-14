import AICVAnalyzer from "@/pages/AICVAnalyzer";

/**
 * Thin re-export so the CV Analyzer is reachable at /cv-analyzer.
 * Rendered in "embedded" mode (no own Navbar/Footer/hero) so it stays inside
 * the Job Ready Hub's persistent nav (Dashboard/Job Board/CV Analyzer/Profil),
 * instead of navigating away to a full standalone page. AICVAnalyzer reads
 * AlumniAuthContext itself to bypass the Mayar license gate for logged-in alumni.
 */
export default function JobReadyHubCvAnalyzer() {
  return <AICVAnalyzer embedded />;
}
