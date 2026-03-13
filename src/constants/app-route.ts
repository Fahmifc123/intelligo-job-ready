export const AppRoute = {
    auth: {
        signUp: {
            url: "/sign-up",
            breadcrumb: []
        },
        signIn: {
            url: "/login",
            breadcrumb: []
        },
        forgotPassword: {
            url: "/forgot-password",
            breadcrumb: []
        },
        resetPassword: {
            url: "/reset-password",
            breadcrumb: []
        },
    },
    dashboard: {
        dashboard: {
            url: "/dashboard",
            breadcrumb: [
                { title: "Dashboard", url: "/dashboard" }
            ]
        },
    },
    admin: {
        user: { 
            list: {
                url: "/admin/users",
                breadcrumb: [
                    { title: "Dashboard", url: "/dashboard" },
                    { title: "Users", url: "/admin/users" }
                ]
            }
        }
    },
    user: {
        cvAnalysis: {
            url: "/cv/analysis",
            breadcrumb: [
                { title: "CV Analysis", url: "/cv/analysis" }
            ]
        },
        alumniProfile: {
            url: "/profile/alumni",
            breadcrumb: [
                { title: "Alumni Profile", url: "/profile/alumni" }
            ]
        },
        editAlumniProfile: {
            url: "/profile/edit",
            breadcrumb: [
                { title: "Edit Profile", url: "/profile/edit" }
            ]
        },
        leaderboard: {
            url: "/leaderboard",
            breadcrumb: [
                { title: "Leaderboard", url: "/leaderboard" }
            ]
        }
    }
}