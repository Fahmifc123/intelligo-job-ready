import { createFileRoute } from '@tanstack/react-router'
import { AlumniProfilePage } from '@/components/pages/user/alumni-profile/AlumniProfilePage'

export const Route = createFileRoute('/_standalone/profile/alumni')({
  component: RouteComponent,
})

function RouteComponent() {
  return <AlumniProfilePage />
}
