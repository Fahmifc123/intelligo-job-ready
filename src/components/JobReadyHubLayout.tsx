import HubShell from "@/components/HubShell";
import { Button } from "@/components/ui/button";
import { useAlumniAuth } from "@/contexts/AlumniAuthContext";
import { useJobReadyHubFeatures } from "@/hooks/use-job-ready-hub-features";
import { cn } from "@/lib/utils";
import { Briefcase, CalendarDays, Database, MessagesSquare, UserRoundCheck, ClipboardList, PlayCircle, Code2, FileEdit, FileText, LayoutDashboard, LogOut, Mail, Mic, Radio, UserCircle } from "lucide-react";
import { ReactNode } from "react";
import { Helmet } from "react-helmet-async";
import { Link, Navigate, useLocation } from "react-router-dom";

export const hubNavItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard, featureKey: null },
  { path: "/profile", label: "Profil & Checklist", icon: UserCircle, featureKey: "profile" },
  { path: "/cv-analyzer", label: "CV Analyzer", icon: FileText, featureKey: "cv-analyzer" },
  { path: "/cv-builder", label: "CV Builder", icon: FileEdit, featureKey: "cv-builder" },
  { path: "/cover-letter", label: "Cover Letter", icon: Mail, featureKey: "cover-letter" },
  { path: "/courses", label: "Video Course", icon: PlayCircle, featureKey: "video-course" },
  { path: "/live-sessions", label: "Live Session", icon: CalendarDays, featureKey: "live-session" },
  { path: "/mentor", label: "Sesi Mentor", icon: UserRoundCheck, featureKey: "mentor-session" },
  { path: "/interview-prep", label: "Latihan Interview", icon: Mic, featureKey: "interview-prep" },
  { path: "/interview-bank", label: "Bank Interview", icon: MessagesSquare, featureKey: "interview-bank" },
  { path: "/interview-realtime", label: "Interview Realtime", icon: Radio, featureKey: "interview-realtime" },
  { path: "/jobs", label: "Lowongan", icon: Briefcase, featureKey: "job-board" },
  { path: "/applications", label: "Lamaran Saya", icon: ClipboardList, featureKey: "application-tracker" },
  { path: "/sql-test", label: "Coding Test SQL", icon: Database, featureKey: "sql-test" },
  { path: "/coding-test", label: "Coding Test", icon: Code2, featureKey: "coding-test" },
];

interface JobReadyHubLayoutProps {
  children: ReactNode;
}

export default function JobReadyHubLayout({ children }: JobReadyHubLayoutProps) {
  const { alumnus, isLoading, logout } = useAlumniAuth();
  const { isEnabled, loading: featuresLoading } = useJobReadyHubFeatures();
  const location = useLocation();

  const meta = (
    <Helmet>
      <title>Job Ready Hub - Intelligo ID</title>
      <meta name="robots" content="noindex" />
    </Helmet>
  );

  if (isLoading) {
    return (
      <HubShell>
        {meta}
        <div className="min-h-[60vh] flex items-center justify-center">
          <p className="text-muted-foreground">Memuat...</p>
        </div>
      </HubShell>
    );
  }

  if (!alumnus) {
    const next = location.pathname + location.search;
    return <Navigate to={next === "/" ? "/login" : `/login?next=${encodeURIComponent(next)}`} replace />;
  }

  // Fitur yang dimatikan admin disembunyikan dari menu (bukan ditampilkan sebagai "Segera Hadir").
  const navItems = hubNavItems.filter((item) => !item.featureKey || (!featuresLoading && isEnabled(item.featureKey)));

  return (
    <HubShell
      headerRight={
        <div className="flex items-center gap-3 min-w-0">
          <span className="hidden md:inline text-sm text-muted-foreground truncate max-w-[200px]">{alumnus.name}</span>
          <Button variant="outline" size="sm" onClick={logout} className="gap-2 shrink-0">
            <LogOut className="w-4 h-4" />
            Keluar
          </Button>
        </div>
      }
    >
      {meta}
      <div className="section-container py-6 md:py-8">
        <div className="mb-4">
          <h1 className="text-xl md:text-2xl font-bold text-foreground">Halo, {alumnus.name.split(" ")[0]}</h1>
          <p className="text-muted-foreground text-sm">Siapkan diri kamu untuk melamar kerja, langkah demi langkah.</p>
        </div>

        <nav
          aria-label="Menu Job Ready Hub"
          className="-mx-4 px-4 md:mx-0 md:px-0 mb-6 md:mb-8 border-b border-border overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <ul className="flex md:flex-wrap gap-1 pb-3 w-max md:w-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.path === "/" ? location.pathname === "/" : location.pathname.startsWith(item.path);
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "inline-flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      isActive ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="min-w-0">{children}</div>
      </div>
    </HubShell>
  );
}
