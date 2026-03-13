import { createFileRoute, redirect } from '@tanstack/react-router'
import { LeaderboardPage } from '@/components/pages/user/leaderboard/LeaderboardPage'

// Redirect this route to the standalone leaderboard
export const Route = createFileRoute('/_private/dashboard/leaderboard')({
  loader: () => {
    throw redirect({ to: '/leaderboard' })
  },
})
