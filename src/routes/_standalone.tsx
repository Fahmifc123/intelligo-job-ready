import { createFileRoute, Outlet, redirect, Link } from '@tanstack/react-router'
import { APP_CONFIG } from "@/constants/config";
import { useAuth } from "@/hooks/use-auth";
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { AppRoute } from '@/constants/app-route';
import { Trophy, FileText, User as UserIcon, Menu } from 'lucide-react';
import { useState } from 'react';
import { ThemeToggle } from '@/components/custom/components/ThemeToggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MdLogout } from "react-icons/md";
import { FaRegUser } from "react-icons/fa";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore } from "@/stores/useAuthStore";
import { DialogModal } from "@/components/custom/components/DialogModal";
import { useLogoutMutation } from "@/service/auth-api";
import { useTranslation } from "react-i18next";
import AppLogoSimple from "@/components/app/AppLogoSimple";

export const Route = createFileRoute('/_standalone')({
  loader: ({ context }) => {
    if (!context?.auth?.isAuthenticated) {
      throw redirect({ to: APP_CONFIG.path.defaultPublic })
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { t } = useTranslation();
  const auth = useAuth();
  const appStore = useAuthStore();
  const user = appStore?.user ?? null;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [confirmationModal, setConfirmationModal] = useState<any>(null);

  const logOffMutation = useLogoutMutation();

  const onLogoutClick = () => {
    setConfirmationModal({
      title: t("dialog.logOutTitle"),
      desc: t("dialog.logOutDesc"),
      textConfirm: t("shared.logout"),
      textCancel: t("shared.cancel"),
      onConfirmClick: () => {
        logOffMutation.mutate(undefined, {
          onSuccess: () => setConfirmationModal(null),
          onError: () => setConfirmationModal(null),
        });
      },
      onCancelClick: () => setConfirmationModal(null),
    });
  };

  const bg: string = "bg-background-light dark:bg-background-dark";

  return (
    <div className={cn("min-h-screen flex flex-col gap-6", bg, "p-4 sm:p-6 md:p-8 lg:p-10")}>
      {/* Container for aligned topbar and content */}
      <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full">
        {/* Top Navigation Bar */}
        <header className="w-full">
          <div className="flex items-center justify-between h-14 px-6 py-4 rounded-xl bg-white dark:bg-card-dark shadow-sm border border-border-light dark:border-border-dark">
            {/* Logo */}
            <Link to={AppRoute.user.cvAnalysis.url}>
              <AppLogoSimple />
            </Link>


            {/* Desktop Navigation */}
            <nav className="hidden md:flex flex-1 justify-center items-center gap-9">
              <Link
                to={AppRoute.user.leaderboard.url}
                className="relative text-sm font-normal text-text-secondary-light dark:text-text-secondary-dark"
                activeProps={{
                  className: "relative text-sm !font-bold text-text-light dark:text-white underline-orange"
                }}
              >
                Leaderboard
              </Link>
              <Link
                to={AppRoute.user.cvAnalysis.url}
                className="relative text-sm font-normal text-text-secondary-light dark:text-text-secondary-dark"
                activeProps={{
                  className: "relative text-sm !font-bold text-text-light dark:text-white underline-orange"
                }}
              >
                CV Analyzer
              </Link>
            </nav>

            {/* User Actions */}
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="hidden md:flex h-10 w-10 items-center justify-center rounded-full bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark cursor-pointer hover:opacity-80 transition-opacity">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                    </svg>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-row gap-3 items-center">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user?.user?.image || ''} alt={user?.user?.name || ''} />
                        <AvatarFallback className="bg-accent text-white font-bold">
                          {user ? user?.user?.name?.substring(0, 2)?.toUpperCase() : "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <div className="truncate font-semibold text-sm">{user?.user?.name ?? ""}</div>
                        <div className="text-xs text-text-secondary-light dark:text-text-secondary-dark">{user?.user?.email ?? ""}</div>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to={AppRoute.user.alumniProfile.url} className="flex items-center cursor-pointer gap-2">
                      <UserIcon className="w-4 h-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onLogoutClick} className="text-red-600 dark:text-red-400">
                    <MdLogout className="w-4 h-4 mr-2" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-3 pt-4 px-6 py-4 rounded-xl bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark shadow-sm space-y-2">
              <Link
                to={AppRoute.user.cvAnalysis.url}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-text-light dark:text-text-dark hover:bg-background-light dark:hover:bg-background-dark rounded-lg transition-colors"
                activeProps={{
                  className: "flex items-center gap-2 px-3 py-2 text-sm font-semibold text-accent bg-background-light dark:bg-background-dark rounded-lg"
                }}
                onClick={() => setMobileMenuOpen(false)}
              >
                <FileText className="h-4 w-4" />
                CV Analyzer
              </Link>
              <Link
                to={AppRoute.user.leaderboard.url}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-text-light dark:text-text-dark hover:bg-background-light dark:hover:bg-background-dark rounded-lg transition-colors"
                activeProps={{
                  className: "flex items-center gap-2 px-3 py-2 text-sm font-semibold text-accent bg-background-light dark:bg-background-dark rounded-lg"
                }}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Trophy className="h-4 w-4" />
                Leaderboard
              </Link>
              <Link
                to={AppRoute.user.alumniProfile.url}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-text-light dark:text-text-dark hover:bg-background-light dark:hover:bg-background-dark rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <UserIcon className="h-4 w-4" />
                <span>Profile</span>
              </Link>
              <div className="pt-2 border-t border-border-light dark:border-border-dark">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-2 text-red-600 dark:text-red-400 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLogoutClick();
                  }}
                >
                  <MdLogout className="h-4 w-4" />
                  <span>Logout</span>
                </Button>
              </div>
            </div>
          )}
        </header>

        {/* Main Content */}
        <main className="flex-1 w-full">
          <Outlet />
        </main>
      </div>
      {confirmationModal && <DialogModal modal={confirmationModal} />}
    </div>
  )
}
