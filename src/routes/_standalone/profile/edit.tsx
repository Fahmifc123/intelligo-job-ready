import { createFileRoute } from '@tanstack/react-router'
import { EditAlumniProfilePage } from '@/components/pages/user/alumni-profile/EditAlumniProfilePage'

export const Route = createFileRoute('/_standalone/profile/edit')({
  component: RouteComponent,
})

function RouteComponent() {
  return <EditAlumniProfilePage />
}
