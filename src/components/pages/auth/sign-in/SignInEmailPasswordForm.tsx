import { SubmitHandler, useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod"
import { AdminLoginFormValues } from "@/types/auth";
import { FormInput, FormPassword } from "@/components/custom/forms";
import { Loader2, LogIn, AlertCircle } from "lucide-react";
import { emailPasswordFormData, createEmailPasswordSchema } from "./templates/sign-in-template";
import { useTranslation } from 'react-i18next';

type Props = {
  onFormSubmit: SubmitHandler<AdminLoginFormValues>
  loading?: boolean,
  errorMessage?: string,
}

export const SignInEmailPasswordForm = ({ onFormSubmit, loading, errorMessage }: Props) => {
  const { t } = useTranslation();
  
  // Create schema with translated error messages
  const schema = createEmailPasswordSchema(t);
  
  const form = useForm<AdminLoginFormValues>({
    resolver: zodResolver(schema),
    defaultValues: emailPasswordFormData.defaultValue,
  });

  // Create a copy of the form data with translated labels and placeholders
  const translatedFormData = {
    ...emailPasswordFormData,
    form: {
      email: {
        ...emailPasswordFormData.form.email,
        label: t(emailPasswordFormData.form.email.label),
        placeholder: t(emailPasswordFormData.form.email.placeholder),
      },
      password: {
        ...emailPasswordFormData.form.password,
        label: t(emailPasswordFormData.form.password.label),
        placeholder: t(emailPasswordFormData.form.password.placeholder),
      }
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-4">
        {errorMessage && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <div className="text-sm text-destructive font-medium">{errorMessage}</div>
          </div>
        )}
        <div className="space-y-4">
          {/* Email Field */}
          <FormInput
            form={form}
            item={translatedFormData.form.email}
            className="h-11 bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 focus-visible:ring-blue-500/50"
          />

          {/* Password Field */}
          <FormPassword
            form={form}
            item={translatedFormData.form.password}
            className="h-11 bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 focus-visible:ring-blue-500/50"
          />
        </div>

        <Button
          type="submit"
          className="w-full h-12 mt-3"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("labels.signIn")}...
            </>
          ) : (
            <>
              <LogIn className="mr-2 h-4 w-4" />
              {t("labels.signIn")}
            </>
          )}
        </Button>

        <div className="text-center mt-4">
          <p className="text-sm text-muted-foreground">
            Butuh bantuan?{" "}
            <a href="https://mintell.taplink.id/" target="_blank" className="text-primary hover:text-primary/80 font-medium transition-colors">
              Hubungi Kami
            </a>
          </p>
        </div>
      </form>
    </Form>
  )
}
