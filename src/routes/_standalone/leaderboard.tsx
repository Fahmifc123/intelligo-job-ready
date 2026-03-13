import { createFileRoute } from '@tanstack/react-router'
import { LeaderboardPage } from '@/components/pages/user/leaderboard/LeaderboardPage'

export const Route = createFileRoute('/_standalone/leaderboard')({
  component: RouteComponent,
})

function RouteComponent() {
  return <LeaderboardPage />
}
