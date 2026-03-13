import { NotFoundError } from '@/components/custom/errors';
import { useAuth } from '@/hooks/use-auth';
import { isAdminOrUser } from '@/types/auth';
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_private/dashboard')({
  component: RouteComponent,
})

function RouteComponent() {
  const auth = useAuth();
  const userRole = auth?.user;

  if (!isAdminOrUser(userRole)) {
    return <NotFoundError />
  }

  return (<Outlet />)
}
