/**
 * API Configuration and Route Management
 *
 * This file contains:
 * 1. API endpoints (AppApi)
 * 2. Route definitions with breadcrumbs (AppRoute)
 * 3. Helper functions for breadcrumb generation
 *
 * Usage examples:
 * - Get route URL: getRouteUrl('employee.list') // returns '/employee/list'
 * - Get breadcrumbs: useBreadcrumbs() hook automatically uses the centralized config
 * - Access route: AppRoute.employee.list.url
 * - Access breadcrumb: AppRoute.employee.list.breadcrumb
 */

export const APP_BASE_URL = import.meta.env.VITE_APP_BASE_URL
const APP_URL_V1 = APP_BASE_URL + "/v1"
const APP_URL_PUBLIC = APP_BASE_URL + "/public"

export const AppApi = {
  auth: {
    login: APP_BASE_URL + "/auth/sign-in-email",
    logout: APP_BASE_URL + "/auth/sign-out",
  },
  dashboard: {
    metrics: APP_URL_V1 + "/user/dashboard/metrics",
  },
  admin: {
    user: {
      list: APP_URL_V1 + "/admin/user/list",
      delete: APP_URL_V1 + "/admin/user/delete",
      create: APP_URL_V1 + "/admin/user/add",
      update: APP_URL_V1 + "/admin/user/update",
      changePassword: APP_URL_V1 + "/admin/user/change-password",
      crud: APP_URL_V1 + "/admin/user",
    }
  },
  notification: {
    list: APP_URL_V1 + "/user/notification",
    markAll: APP_URL_V1 + "/user/notification/mark-all",
    crud: APP_URL_V1 + "/user/notification",
  },
  cvAnalysis: {
    upload: APP_URL_V1 + "/user/cv-analysis/upload",
    results: APP_URL_V1 + "/user/cv-analysis/results",
    delete: APP_URL_V1 + "/user/cv-analysis/results",
  },
  leaderboard: {
    categories: APP_URL_V1 + "/user/leaderboard/categories",
    entries: APP_URL_V1 + "/user/leaderboard/entries",
    position: APP_URL_V1 + "/user/leaderboard/position",
  },
  alumniProfile: {
    profile: APP_URL_V1 + "/user/alumni/profile",
    skills: APP_URL_V1 + "/user/alumni/skills",
    workExperience: APP_URL_V1 + "/user/alumni/work-experience",
    education: APP_URL_V1 + "/user/alumni/education",
    certifications: APP_URL_V1 + "/user/alumni/certifications",
  }
}