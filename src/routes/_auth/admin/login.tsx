import * as React from 'react'
import {
  createFileRoute,
  redirect,
} from '@tanstack/react-router'
import { z } from 'zod'

import { LayoutAdminLogin } from "@/components/pages/auth/sign-in/LayoutAdminLogin";
import { SubmitHandler } from 'react-hook-form'
import { AdminLoginFormValues } from "@/types/auth";
import { useLoginMutationEmail } from "@/service/auth-api";

const fallback = '/admin' as const
export const Route = createFileRoute('/_auth/admin/login')({
  validateSearch: z.object({
    redirect: z.string().optional().catch(''),
  }),
  beforeLoad: ({ context, search }) => {
    // Safely check if auth context exists and user is authenticated
    if (context.auth && context.auth.isAuthenticated) {
      throw redirect({ to: search.redirect || fallback })
    }
  },
  component: AdminLoginComponent,
})

function AdminLoginComponent() {
  const navigate = Route.useNavigate()
  const search = Route.useSearch()

  const adminLoginMutation = useLoginMutationEmail();
  const [errorMessage, setErrorMessage] = React.useState<string | undefined>(undefined);

  const onFormSubmit: SubmitHandler<AdminLoginFormValues> = (data) => {
    setErrorMessage(undefined);
    adminLoginMutation.mutate(
      { body: { email: data.email, password: data.password } },
      {
        onSuccess: (_data: any) => {
          navigate({ to: search.redirect || fallback })
        },
        onError: (error: Record<string, any>) => {
          setErrorMessage(error?.response?.data?.message || error?.response?.data?.error || error?.message)
        },
      }
    );
  }

  return (
    <LayoutAdminLogin 
      onFormSubmit={onFormSubmit} 
      loading={adminLoginMutation.isPending} 
      errorMessage={errorMessage} 
    />
  )
}

export default AdminLoginComponent
