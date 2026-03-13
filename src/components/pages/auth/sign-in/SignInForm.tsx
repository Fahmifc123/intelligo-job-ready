import { SubmitHandler, useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod"
import { LoginFormValues } from "@/types/auth";
import { FormInput } from "@/components/custom/forms";
import { Loader2, LogIn, AlertCircle, Shield } from "lucide-react";
import { signInFormData, createSignInSchema } from "./templates/sign-in-template";
import { useTranslation } from 'react-i18next';

type Props = {
  onFormSubmit: SubmitHandler<LoginFormValues>
  loading?: boolean,
  errorMessage?: string,
}

export const SignInForm = ({ onFormSubmit, loading, errorMessage }: Props) => {
  const { t } = useTranslation();
  
  // Create schema with translated error messages
  const schema = createSignInSchema(t);
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(schema),
    defaultValues: signInFormData.defaultValue,
  });

  // Create a copy of the form data with translated labels and placeholders
  const translatedFormData = {
    ...signInFormData,
    form: {
      certificateId: {
        ...signInFormData.form.certificateId,
        label: t(signInFormData.form.certificateId.label),
        placeholder: t(signInFormData.form.certificateId.placeholder),
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
          {/* Certificate ID Field with Modern Design */}
        <div className="rounded-lg border border-blue-100/50 dark:border-slate-700/50 p-4 space-y-3" style={{ backgroundColor: '#f4f7fe' }}>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" style={{ color: '#ff5722' }} />
              <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#ff5722' }}>{t('signIn.loginWithCertificateId')}</span>
            </div>
            <div className="relative">
              <FormInput
                form={form}
                item={translatedFormData.form.certificateId}
                className="h-11 bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 focus-visible:ring-blue-500/50"
              />
            </div>
          </div>
        </div>

        {/* <div className="flex items-center justify-between text-sm">
          <label className="flex items-center space-x-2 text-muted-foreground cursor-pointer">
            <input type="checkbox" className="rounded border-border" />
            <span>{t("labels.rememberMe")}</span>
          </label>
          <a href={AppRoute.auth.forgotPassword.url} className="text-primary hover:text-primary/80 font-medium transition-colors">
            {t("labels.forgotPassword")}
          </a>
        </div> */}

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

        {/* <div className="text-center">
          <p className="text-sm text-muted-foreground">
            {t("signIn.newUser")}{" "}
            <a href={AppRoute.auth.signUp.url} className="text-primary hover:text-primary/80 font-medium transition-colors">
              {t("labels.signUp")}
            </a>
          </p>
        </div> */}
      </form>
    </Form>
  )
}