/**
 * Certificate ID Input Field Variants
 * 
 * This file contains reusable component variants for the Certificate ID input field.
 * Each variant maintains the same form functionality while offering different visual styles.
 * Use these as templates to quickly switch between design approaches.
 */

import { Shield, Lock, CheckCircle } from "lucide-react";
import { FormInput } from "@/components/custom/forms";
import { UseFormReturn } from "react-hook-form";
import { LoginFormValues } from "@/types/auth";

interface CertificateIdFieldProps {
  form: UseFormReturn<LoginFormValues>;
  item: {
    name: string;
    label: string;
    placeholder?: string;
  };
  t: (key: string) => string;
}

/**
 * VARIANT 1: Security-Focused Card Design (CURRENT - SignInForm.tsx)
 * Best for: Emphasizing security importance
 * Visual Weight: Medium
 * Use Case: Multi-factor authentication emphasis
 */
export const CertificateIdSecurityCard = ({ form, item, t }: CertificateIdFieldProps) => {
  return (
    <div className="pt-2">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800/50 dark:to-slate-800/30 rounded-lg border border-blue-100/50 dark:border-slate-700/50 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span className="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wide">
            Security Verification
          </span>
        </div>
        <div className="relative">
          <FormInput
            form={form}
            item={item}
            className="h-11 bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 focus-visible:ring-blue-500/50"
          />
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          {t("signIn.certificateIdHint") || "Enter your certificate ID for verification"}
        </p>
      </div>
    </div>
  );
};

/**
 * VARIANT 2: Minimalist Line-Based Design
 * Best for: Subtle, clean aesthetic
 * Visual Weight: Light
 * Use Case: Minimal visual distraction
 */
export const CertificateIdMinimalLine = ({ form, item, t }: CertificateIdFieldProps) => {
  return (
    <div className="border-t-2 border-blue-500/30 dark:border-blue-400/30 pt-4 mt-2">
      <label className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-3 inline-block">
        Security Step
      </label>
      <FormInput
        form={form}
        item={item}
        className="h-11 bg-transparent border-slate-200 dark:border-slate-700"
      />
    </div>
  );
};

/**
 * VARIANT 3: Tab/Chip-Based Design
 * Best for: Multi-step process indication
 * Visual Weight: Medium-High
 * Use Case: Step-by-step authentication flows
 */
export const CertificateIdChipDesign = ({ form, item, t }: CertificateIdFieldProps) => {
  return (
    <div className="space-y-3 pt-2">
      <div className="flex items-center gap-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-full">
          <Shield className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
          <span className="text-xs font-semibold text-blue-700 dark:text-blue-400">
            Verify Identity
          </span>
        </div>
      </div>
      <div className="bg-slate-50 dark:bg-slate-900/30 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
        <FormInput
          form={form}
          item={item}
          className="h-11 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
        />
      </div>
    </div>
  );
};

/**
 * VARIANT 4: Accent Border Design
 * Best for: Modern, contemporary look
 * Visual Weight: Light-Medium
 * Use Case: Premium, polished appearance
 */
export const CertificateIdAccentBorder = ({ form, item, t }: CertificateIdFieldProps) => {
  return (
    <div className="pt-2 relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg opacity-0 group-hover:opacity-10 blur transition duration-300" />
      <div className="relative bg-white dark:bg-slate-900 rounded-lg border-2 border-blue-500/20 dark:border-blue-400/20 group-hover:border-blue-500/40 dark:group-hover:border-blue-400/40 transition-colors p-4">
        <label className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2 block">
          Certificate ID
        </label>
        <FormInput
          form={form}
          item={item}
          className="h-11 bg-transparent border-0 focus-visible:ring-2 focus-visible:ring-blue-500/50"
        />
      </div>
    </div>
  );
};

/**
 * VARIANT 5: Icon-In-Input Design
 * Best for: Compact, space-efficient layouts
 * Visual Weight: Light
 * Use Case: Mobile-first designs
 */
export const CertificateIdIconInInput = ({ form, item, t }: CertificateIdFieldProps) => {
  return (
    <div className="pt-2">
      <div className="relative">
        <Shield className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500 dark:text-blue-400" />
        <FormInput
          form={form}
          item={item}
          className="h-11 pl-11 bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800/50 focus-visible:bg-white dark:focus-visible:bg-slate-900 focus-visible:border-blue-500"
        />
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
        Required for security verification
      </p>
    </div>
  );
};

/**
 * VARIANT 6: Succinct Badge Design
 * Best for: Information-dense interfaces
 * Visual Weight: Very Light
 * Use Case: Forms with multiple fields
 */
export const CertificateIdBadgeDesign = ({ form, item, t }: CertificateIdFieldProps) => {
  return (
    <div className="pt-1">
      <div className="inline-flex items-center gap-1.5 mb-2">
        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-xs font-bold">
          3
        </span>
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          {item.label}
        </label>
      </div>
      <FormInput
        form={form}
        item={item}
        className="h-11 text-sm"
      />
    </div>
  );
};

/**
 * VARIANT 7: Gradient Accent Design
 * Best for: High-impact, attention-grabbing
 * Visual Weight: High
 * Use Case: Premium authentication flows
 */
export const CertificateIdGradientAccent = ({ form, item, t }: CertificateIdFieldProps) => {
  return (
    <div className="pt-2">
      <div className="relative rounded-lg overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-100" />
        <div className="relative bg-white dark:bg-slate-950 m-[2px] rounded-md p-4 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500" />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {item.label}
            </span>
          </div>
          <FormInput
            form={form}
            item={item}
            className="h-11 bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700"
          />
        </div>
      </div>
    </div>
  );
};

/**
 * VARIANT 8: Floating Label Design
 * Best for: Material Design-inspired interfaces
 * Visual Weight: Medium
 * Use Case: Modern, animated forms
 */
export const CertificateIdFloatingLabel = ({ form, item, t }: CertificateIdFieldProps) => {
  return (
    <div className="pt-2 group">
      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-2 block group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
        {item.label}
      </label>
      <div className="relative">
        <FormInput
          form={form}
          item={item}
          className="h-11 peer bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-lg focus-visible:border-blue-500"
        />
        <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500 opacity-0 peer-focus:opacity-100 transition-opacity" />
      </div>
    </div>
  );
};

// Export all variants for easy access
export const CertificateIdVariants = {
  SecurityCard: CertificateIdSecurityCard,
  MinimalLine: CertificateIdMinimalLine,
  ChipDesign: CertificateIdChipDesign,
  AccentBorder: CertificateIdAccentBorder,
  IconInInput: CertificateIdIconInInput,
  BadgeDesign: CertificateIdBadgeDesign,
  GradientAccent: CertificateIdGradientAccent,
  FloatingLabel: CertificateIdFloatingLabel,
};

/**
 * Usage Example:
 * 
 * import { CertificateIdVariants } from '@/components/pages/auth/sign-in/CertificateIdVariants';
 * 
 * // In your SignInForm component:
 * const CertIdComponent = CertificateIdVariants.SecurityCard; // or any other variant
 * 
 * return (
 *   <CertIdComponent form={form} item={translatedFormData.form.certificateId} t={t} />
 * );
 */
