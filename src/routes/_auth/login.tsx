import * as React from 'react'
import {
  createFileRoute,
  redirect,
} from '@tanstack/react-router'
import { z } from 'zod'

import { LayoutLogin } from "@/components/pages/auth/sign-in/LayoutLogin";
import { SubmitHandler } from 'react-hook-form'
import { LoginFormValues } from "@/types/auth";
import { useLoginMutation } from "@/service/auth-api";

const fallback = '/' as const
export const Route = createFileRoute('/_auth/login')({
  validateSearch: z.object({
    redirect: z.string().optional().catch(''),
  }),
  beforeLoad: ({ context, search }) => {
    // Safely check if auth context exists and user is authenticated
    if (context.auth && context.auth.isAuthenticated) {
      throw redirect({ to: search.redirect || fallback })
    }
  },
  component: LoginComponent,
})

function LoginComponent() {
  const navigate = Route.useNavigate()
  const search = Route.useSearch()

  const loginMutation = useLoginMutation();
  const [errorMessage, setErrorMessage] = React.useState<string | undefined>(undefined);

  const onFormSubmit: SubmitHandler<LoginFormValues> = (data) => {
    setErrorMessage(undefined);
    loginMutation.mutate(
      { body: { certificateId: data.certificateId } },
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
    <LayoutLogin 
      onFormSubmit={onFormSubmit} 
      loading={loginMutation.isPending} 
      errorMessage={errorMessage} 
    />
  )
}

export default LoginComponent