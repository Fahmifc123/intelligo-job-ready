import {createFileRoute, redirect} from '@tanstack/react-router'
import {APP_CONFIG} from "@/constants/config";
import { isAdmin, isUser } from '@/types/auth';
import { AppRoute } from '@/constants/app-route';

export const Route = createFileRoute('/')({
  loader: ({ context }) => {
    let path_ = '';

    // Safely check if auth context exists and user is authenticated
    if (context.auth && context.auth.isAuthenticated) {
      const user_ = context.auth.user;
      if (isAdmin(user_)) {
        path_ = AppRoute.dashboard.dashboard.url;
      } else if (isUser(user_)) {
        path_ = AppRoute.user.cvAnalysis.url;
      }
    } else {
      path_ = APP_CONFIG.path.defaultPublic;
    }
    return redirect({ to: path_ })
  },
  component: () => null,
})