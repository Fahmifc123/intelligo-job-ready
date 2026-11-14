import { Briefcase, CalendarDays, Database, FolderKanban, Linkedin, MessagesSquare, UserRoundCheck, ClipboardList, PlayCircle, Code2, FileEdit, FileText, LucideIcon, Mail, Mic, Radio, UserCircle } from "lucide-react";

export interface JobReadyHubFeatureDef {
  key: string;
  label: string;
  icon: LucideIcon;
  comingSoonDescription: string;
}

// Satu sumber kebenaran untuk daftar fitur Job Ready Hub yang bisa
// diaktif/nonaktifkan admin -- dipakai di FeatureGate (routing), nav &
// dashboard card (badge "Segera Hadir"), dan panel admin (daftar toggle).
export const JOB_READY_HUB_FEATURES: JobReadyHubFeatureDef[] = [
  {
    key: "cv-analyzer",
    label: "CV Analyzer",
    icon: FileText,
    comingSoonDescription: "Analisis CV berbasis AI segera hadir untuk kamu.",
  },
  {
    key: "cv-builder",
    label: "CV Builder",
    icon: FileEdit,
    comingSoonDescription: "Builder CV dari form, hasil ATS-friendly, segera hadir untuk kamu.",
  },
  {
    key: "cover-letter",
    label: "Cover Letter",
    icon: Mail,
    comingSoonDescription: "Builder surat lamaran dari form segera hadir untuk kamu.",
  },
  {
    key: "interview-prep",
    label: "Interview Teks",
    icon: Mic,
    comingSoonDescription: "Latihan mock interview suara dengan AI segera hadir untuk kamu.",
  },
  {
    key: "interview-realtime",
    label: "Interview Suara",
    icon: Radio,
    comingSoonDescription: "Latihan interview suara dua arah langsung dengan AI segera hadir untuk kamu.",
  },
  {
    key: "job-board",
    label: "Job Board",
    icon: Briefcase,
    comingSoonDescription: "Fitur pencarian & rekomendasi lowongan kerja segera hadir untuk kamu.",
  },
  {
    key: "application-tracker",
    label: "Lamaran Saya",
    icon: ClipboardList,
    comingSoonDescription: "Pencatat lamaran kerja segera hadir untuk kamu.",
  },
  {
    key: "video-course",
    label: "Video Course",
    icon: PlayCircle,
    comingSoonDescription: "Video course persiapan kerja segera hadir untuk kamu.",
  },
  {
    key: "live-session",
    label: "Live Session",
    icon: CalendarDays,
    comingSoonDescription: "Jadwal live session gratis untuk alumni Job Ready segera hadir.",
  },
  {
    key: "mentor-session",
    label: "Sesi Mentor",
    icon: UserRoundCheck,
    comingSoonDescription: "Jadwal sesi 1-on-1 dengan mentor segera hadir untuk kamu.",
  },
  {
    key: "interview-bank",
    label: "Bank Pertanyaan Interview",
    icon: MessagesSquare,
    comingSoonDescription: "Bank pertanyaan interview per posisi segera hadir untuk kamu.",
  },
  {
    key: "sql-test",
    label: "Coding Test SQL",
    icon: Database,
    comingSoonDescription: "Latihan SQL dengan penilaian otomatis segera hadir untuk kamu.",
  },
  {
    key: "case-study",
    label: "Studi Kasus",
    icon: FolderKanban,
    comingSoonDescription: "Studi kasus take-home dengan dataset dan rubrik segera hadir untuk kamu.",
  },
  {
    key: "linkedin-optimizer",
    label: "Optimasi LinkedIn",
    icon: Linkedin,
    comingSoonDescription: "Review profil LinkedIn dengan AI segera hadir untuk kamu.",
  },
  {
    key: "coding-test",
    label: "Coding Test",
    icon: Code2,
    comingSoonDescription: "Latihan coding pandas dengan penilaian otomatis segera hadir untuk kamu.",
  },
  {
    key: "profile",
    label: "Profil & Checklist",
    icon: UserCircle,
    comingSoonDescription: "Profil karier & readiness checklist segera hadir untuk kamu.",
  },
];
