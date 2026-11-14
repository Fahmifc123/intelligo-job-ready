import logoIntelligo from "@/assets/logo-intelligo.png";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAlumniAuth } from "@/contexts/AlumniAuthContext";
import { useJobReadyHubFeatures } from "@/hooks/use-job-ready-hub-features";
import { cn } from "@/lib/utils";
import {
  Briefcase,
  CalendarDays,
  ClipboardList,
  Code2,
  Database,
  FileEdit,
  FileText,
  FolderKanban,
  LayoutDashboard,
  Linkedin,
  LogOut,
  LucideIcon,
  Mail,
  Menu,
  MessageSquareText,
  MessagesSquare,
  Mic,
  PlayCircle,
  ShieldCheck,
  UserCircle,
  UserRoundCheck,
} from "lucide-react";
import { ReactNode, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, Navigate, useLocation } from "react-router-dom";

interface NavItem {
  path: string;
  label: string;
  icon: LucideIcon;
  featureKey: string | null;
}

export const hubNavGroups: { title: string; items: NavItem[] }[] = [
  {
    title: "Persiapan",
    items: [
      { path: "/", label: "Dashboard", icon: LayoutDashboard, featureKey: null },
      { path: "/profile", label: "Profil & Checklist", icon: UserCircle, featureKey: "profile" },
      { path: "/applications", label: "Lamaran Saya", icon: ClipboardList, featureKey: "application-tracker" },
    ],
  },
  {
    title: "Dokumen",
    items: [
      { path: "/cv-analyzer", label: "CV Analyzer", icon: FileText, featureKey: "cv-analyzer" },
      { path: "/cv-builder", label: "CV Builder", icon: FileEdit, featureKey: "cv-builder" },
      { path: "/cover-letter", label: "Cover Letter", icon: Mail, featureKey: "cover-letter" },
      { path: "/linkedin", label: "Optimasi LinkedIn", icon: Linkedin, featureKey: "linkedin-optimizer" },
    ],
  },
  {
    title: "Belajar",
    items: [
      { path: "/courses", label: "Video Course", icon: PlayCircle, featureKey: "video-course" },
      { path: "/live-sessions", label: "Live Session", icon: CalendarDays, featureKey: "live-session" },
      { path: "/mentor", label: "Sesi Mentor", icon: UserRoundCheck, featureKey: "mentor-session" },
    ],
  },
  {
    title: "Latihan",
    items: [
      { path: "/interview-prep", label: "Interview Teks", icon: MessageSquareText, featureKey: "interview-prep" },
      { path: "/interview-realtime", label: "Interview Suara", icon: Mic, featureKey: "interview-realtime" },
      { path: "/interview-bank", label: "Bank Interview", icon: MessagesSquare, featureKey: "interview-bank" },
      { path: "/case-studies", label: "Studi Kasus", icon: FolderKanban, featureKey: "case-study" },
      { path: "/sql-test", label: "Coding Test SQL", icon: Database, featureKey: "sql-test" },
      { path: "/coding-test", label: "Coding Test Python", icon: Code2, featureKey: "coding-test" },
    ],
  },
  {
    title: "Karier",
    items: [{ path: "/jobs", label: "Lowongan", icon: Briefcase, featureKey: "job-board" }],
  },
];

/** Semua item menu dalam satu daftar (dipakai halaman lain, mis. pencarian judul). */
export const hubNavItems = hubNavGroups.flatMap((g) => g.items);

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation();
  const { isEnabled, loading } = useJobReadyHubFeatures();
  return (
    <nav aria-label="Menu Job Ready Hub" className="space-y-5">
      {hubNavGroups.map((group) => {
        const items = group.items.filter((i) => !i.featureKey || (!loading && isEnabled(i.featureKey)));
        if (items.length === 0) return null;
        return (
          <div key={group.title}>
            <p className="px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{group.title}</p>
            <ul className="space-y-0.5">
              {items.map((item) => {
                const Icon = item.icon;
                const active = item.path === "/" ? location.pathname === "/" : location.pathname.startsWith(item.path);
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        active ? "bg-primary text-primary-foreground shadow-sm" : "text-foreground/80 hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <Icon className={cn("w-4 h-4 shrink-0", active ? "text-primary-foreground" : "text-muted-foreground")} aria-hidden />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}

function SidebarFooter({ name, onLogout }: { name: string; onLogout: () => void }) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground flex gap-2">
        <ShieldCheck className="w-4 h-4 shrink-0 text-primary" aria-hidden />
        <p>Data kamu hanya terlihat oleh kamu dan tim Intelligo.</p>
      </div>
      <div className="flex items-center gap-3">
        <span className="w-9 h-9 shrink-0 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold" aria-hidden>
          {initials || "A"}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground truncate">{name}</p>
          <p className="text-xs text-muted-foreground">Alumni Intelligo</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onLogout} aria-label="Keluar" title="Keluar">
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

function Brand() {
  return (
    <Link to="/" className="flex items-center gap-2.5 min-w-0" aria-label="Job Ready Hub, ke dashboard">
      <img src={logoIntelligo} alt="Intelligo ID" className="h-6 w-auto shrink-0" />
      <span className="text-xs font-semibold text-accent border-l border-border pl-2.5 whitespace-nowrap">Job Ready Hub</span>
    </Link>
  );
}

interface JobReadyHubLayoutProps {
  children: ReactNode;
}

export default function JobReadyHubLayout({ children }: JobReadyHubLayoutProps) {
  const { alumnus, isLoading, logout } = useAlumniAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const meta = (
    <Helmet>
      <title>Job Ready Hub - Intelligo ID</title>
      <meta name="robots" content="noindex" />
    </Helmet>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary/30">
        {meta}
        <p className="text-muted-foreground">Memuat...</p>
      </div>
    );
  }

  if (!alumnus) {
    const next = location.pathname + location.search;
    return <Navigate to={next === "/" ? "/login" : `/login?next=${encodeURIComponent(next)}`} replace />;
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      {meta}
      <a href="#konten" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-background focus:px-3 focus:py-2">
        Lewati ke konten
      </a>

      {/* Sidebar desktop */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 z-30 w-64 flex-col border-r border-border bg-background">
        <div className="h-16 flex items-center px-5 border-b border-border">
          <Brand />
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-5">
          <NavList />
        </div>
        <div className="border-t border-border p-4">
          <SidebarFooter name={alumnus.name} onLogout={logout} />
        </div>
      </aside>

      {/* Header mobile */}
      <header className="lg:hidden sticky top-0 z-30 h-14 flex items-center justify-between gap-3 border-b border-border bg-background/95 backdrop-blur px-4">
        <Brand />
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" aria-label="Buka menu">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0 flex flex-col">
            <SheetTitle className="sr-only">Menu Job Ready Hub</SheetTitle>
            <div className="h-14 flex items-center pl-5 pr-12 border-b border-border">
              <Brand />
            </div>
            <div className="flex-1 overflow-y-auto px-3 py-4">
              <NavList onNavigate={() => setMobileOpen(false)} />
            </div>
            <div className="border-t border-border p-4">
              <SidebarFooter name={alumnus.name} onLogout={logout} />
            </div>
          </SheetContent>
        </Sheet>
      </header>

      <div className="lg:pl-64 flex flex-col min-h-screen">
        <main id="konten" className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 min-w-0">
          {children}
        </main>
        <footer className="border-t border-border bg-background">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row gap-2 justify-between text-xs text-muted-foreground">
            <p>© {new Date().getFullYear()} Intelligo ID · Program Job Ready untuk alumni Intelligo</p>
            <div className="flex gap-4">
              <a href="https://intelligo.id" className="hover:text-foreground">
                intelligo.id
              </a>
              <a href="https://intelligo.id/wa-mintell" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
                Bantuan via WhatsApp
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
