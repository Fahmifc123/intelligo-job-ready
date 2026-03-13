import { USER_ROLE } from "@/constants/app-enum";
import {SubmitHandler} from "react-hook-form";

export type LoginFormValues = {
  email?: string,
  password?: string,
  certificateId?: string,
}

export type AdminLoginFormValues = {
  email: string,
  password: string,
  certificateId?: string,
}

export type LoginProps = {
  onFormSubmit: SubmitHandler<LoginFormValues>
}

export type AuthProps = {
  token?: string | null
  user: {
    id: string;
    name: string;
    emailVerified: boolean;
    email: string;
    certificateId?: string | null | undefined;
    createdAt: Date;
    updatedAt: Date;
    image?: string | null | undefined;
    role?: string
  } | null
}

export interface AuthContext {
  isAuthenticated: boolean
  login: (user: AuthProps) => Promise<void>
  logout: () => Promise<void>
  user: AuthProps | null
}

export const isAdmin = (user: AuthProps | null) => {
  return user?.user?.role === USER_ROLE.admin.value
}

export const isUser = (user: AuthProps | null) => {
  return user?.user?.role === USER_ROLE.user.value
}

export const isAdminOrUser = (user: AuthProps | null) => {
  return user?.user?.role === USER_ROLE.admin.value || user?.user?.role === USER_ROLE.user.value
}