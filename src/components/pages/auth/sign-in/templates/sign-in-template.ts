import { z } from "zod"
import { APP_CONFIG } from "@/constants/config"
import { LoginFormValues, AdminLoginFormValues } from "@/types/auth"

// Schema for Certificate ID login (current)
const createSignInSchema = (t: (key: string) => string) => z.object({
  email: z.string().optional(),
  password: z.string().optional(),
  certificateId: z.string().min(1, { message: t("message.certificateIdRequired") }).optional(),
});

// Schema for Email & Password login
const createEmailPasswordSchema = (t: (key: string) => string) => z.object({
  email: z.string().email({ message: t("message.invalidEmail") || "Invalid email" }).min(1, { message: t("message.emailRequired") || "Email is required" }),
  password: z.string().min(6, { message: t("message.passwordRequired") || "Password must be at least 6 characters" }),
  certificateId: z.string().optional(),
});

const signInFormData = {
    form: {
        certificateId: {
            type: "text",
            name: "certificateId",
            label: "labels.certificateId",
            placeholder: "signIn.certificateIdPlaceholder",
        }
    },
    defaultValue: {
        email: "",
        password: "",
        certificateId: "",
    } as const satisfies LoginFormValues
}

const emailPasswordFormData = {
    form: {
        email: {
            type: "email",
            name: "email",
            label: "labels.emailAddress",
            placeholder: "signIn.emailPlaceholder",
        },
        password: {
            type: "password",
            name: "password",
            label: "labels.password",
            placeholder: "signIn.passwordPlaceholder",
        }
    },
    defaultValue: {
        email: "",
        password: "",
        certificateId: "",
    } as const satisfies AdminLoginFormValues
}

const createSignInBodyParam = (data: Record<string, any>) => {
    return({certificateId: data?.certificateId})
}

const createEmailPasswordBodyParam = (data: Record<string, any>) => {
    return({
        email: data?.email,
        password: data?.password
    })
}

export { signInFormData, createSignInBodyParam, createSignInSchema, emailPasswordFormData, createEmailPasswordBodyParam, createEmailPasswordSchema }