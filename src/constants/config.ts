import AppLogo from "@/assets/app/logo.png";
import { AppRoute } from "./app-route";

export const APP_CONFIG = {
  prefixStore: "intelligo-id",
  isDev: false,
  dayFormat: "yyyy-MM-dd",
  app: {
    name: "INTELLIGO ID", 
    description: "Job Ready Platform",
    logo: AppLogo,
    version: "1.0.0",
  },
  demoUser: {
    email: "",
    password: "",
  },
  path: {
    defaultPublic:  AppRoute.auth.signIn.url,
    // defaultPrivate: AppRoute.dashboard.dashboard.url,
  }
}