import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        success: "border-transparent bg-green-500 text-white dark:bg-green-600 hover:bg-green-500/90 dark:hover:bg-green-600/90",
        warning: "border-transparent bg-amber-500 text-amber-900 dark:bg-amber-400 hover:bg-amber-500/90 dark:hover:bg-amber-400/90",
        info: "border-transparent bg-blue-500 text-white dark:bg-blue-600 hover:bg-blue-500/90 dark:hover:bg-blue-600/90",
        purple: "border-transparent bg-purple-500 text-white dark:bg-purple-600 hover:bg-purple-500/90 dark:hover:bg-purple-600/90",
        pink: "border-transparent bg-pink-500 text-white dark:bg-pink-600 hover:bg-pink-500/90 dark:hover:bg-pink-600/90",  
        
        // Subtle variants
        subtle: "bg-accent text-accent-foreground border-transparent",
        "subtle-destructive": "bg-destructive/10 text-destructive dark:bg-destructive/20 border-transparent hover:bg-destructive/20 dark:hover:bg-destructive/30",
        "subtle-success": "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-transparent hover:bg-green-100 dark:hover:bg-green-900/40",
        "subtle-warning": "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-transparent hover:bg-amber-100 dark:hover:bg-amber-900/40",
        "subtle-info": "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-transparent hover:bg-blue-100 dark:hover:bg-blue-900/40",
        "subtle-primary": "bg-primary/10 text-primary dark:bg-primary/20 border-transparent hover:bg-primary/20 dark:hover:bg-primary/30",
        "subtle-secondary": "bg-secondary/10 text-secondary-foreground dark:bg-secondary/20 border-transparent hover:bg-secondary/20 dark:hover:bg-secondary/30",
        "subtle-purple": "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-transparent hover:bg-purple-100 dark:hover:bg-purple-900/40",
        "subtle-pink": "bg-pink-50 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400 border-transparent hover:bg-pink-100 dark:hover:bg-pink-900/40",
        "subtle-indigo": "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border-transparent hover:bg-indigo-100 dark:hover:bg-indigo-900/40",
        "subtle-cyan": "bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400 border-transparent hover:bg-cyan-100 dark:hover:bg-cyan-900/40",
        "subtle-teal": "bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 border-transparent hover:bg-teal-100 dark:hover:bg-teal-900/40",
        "subtle-rose": "bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-transparent hover:bg-rose-100 dark:hover:bg-rose-900/40",
        "subtle-orange": "bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-transparent hover:bg-orange-100 dark:hover:bg-orange-900/40",
        "subtle-emerald": "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-transparent hover:bg-emerald-100 dark:hover:bg-emerald-900/40",
        "subtle-sky": "bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400 border-transparent hover:bg-sky-100 dark:hover:bg-sky-900/40",
        "subtle-violet": "bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400 border-transparent hover:bg-violet-100 dark:hover:bg-violet-900/40",  
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
