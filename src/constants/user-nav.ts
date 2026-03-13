import {HiOutlineUsers} from "react-icons/hi2";
import {MdOutlineDashboard} from "react-icons/md";
import {LuFileText, LuTrophy, LuUser} from "react-icons/lu";
import {AppRoute} from "@/constants/app-route";

export const AdminNav = {
  user: {},
  teams: {},
  navGroups: [
    {
      title: "Dashboard",
      items: [
        {
          title: "Dashboard",
          url: AppRoute.dashboard.dashboard.url,
          icon: MdOutlineDashboard,
        },
      ],
    },
    {
      title: "ADMIN",
      items: [
        {
          title: "Users",
          url: AppRoute.admin.user.list.url,
          icon: HiOutlineUsers,
        },
      ],
    }
  ]
}

export const UserNav = {
  user: {},
  navGroups: [
  {
      title: "Features",
      items: [
        {
          title: "Review CV",
          url: AppRoute.user.cvAnalysis.url,
          icon: LuFileText,
        },
        {
          title: "Profil",
          url: AppRoute.user.alumniProfile.url,
          icon: LuUser,
        },
        {
          title: "Leaderboard",
          url: AppRoute.user.leaderboard.url,
          icon: LuTrophy,
        },
      ],
    },
  ]
}