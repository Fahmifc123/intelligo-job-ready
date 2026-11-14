import logoIntelligo from "@/assets/logo-intelligo.png";
import { ReactNode } from "react";
import { Link } from "react-router-dom";

/** Kerangka halaman Job Ready Hub: header ringkas + footer, tanpa navbar landing page. */
export default function HubShell({ children, headerRight }: { children: ReactNode; headerRight?: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-secondary/10">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="section-container h-16 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3 min-w-0">
            <img src={logoIntelligo} alt="Intelligo ID" className="h-7 w-auto shrink-0" />
            <span className="hidden sm:inline text-sm font-semibold text-primary border-l border-border pl-3">Job Ready Hub</span>
          </Link>
          {headerRight}
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border bg-background">
        <div className="section-container py-6 flex flex-col sm:flex-row gap-3 justify-between text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Intelligo ID</p>
          <div className="flex gap-4">
            <a href="https://intelligo.id" className="hover:text-foreground">intelligo.id</a>
            <a href="https://intelligo.id/wa-mintell" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
              Bantuan via WhatsApp
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
