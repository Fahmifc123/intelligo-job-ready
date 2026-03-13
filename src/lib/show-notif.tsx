import {toast} from "sonner";
import * as React from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

export const showNotifSuccess = ({message}: {message: React.ReactNode}) => {
  return(
    toast.custom((t) => (
      <div
        className="flex items-center gap-3 rounded-lg bg-green-50 dark:bg-green-950/30 px-4 py-3 shadow-md border border-green-200 dark:border-green-800 cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => toast.dismiss(t)}>
        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
        <span className="text-sm font-medium text-green-800 dark:text-green-200 flex-1">
          {message}
        </span>
        <X className="h-4 w-4 text-green-500 dark:text-green-400 opacity-50 hover:opacity-100 flex-shrink-0" />
      </div>
    ))
  )
}

export const showNotifError = ({message}: { message: React.ReactNode }) => {
  return(
    toast.custom((t) => (
      <div
        className="flex items-center gap-3 rounded-lg bg-red-50 dark:bg-red-950/30 px-4 py-3 shadow-md border border-red-200 dark:border-red-800 cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => toast.dismiss(t)}>
        <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
        <span className="text-sm font-medium text-red-800 dark:text-red-200 flex-1">
          {message}
        </span>
        <X className="h-4 w-4 text-red-500 dark:text-red-400 opacity-50 hover:opacity-100 flex-shrink-0" />
      </div>
    ))
  )
}
