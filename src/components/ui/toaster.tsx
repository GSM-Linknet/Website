"use client"

import {
    Toast,
    ToastClose,
    ToastDescription,
    ToastProvider,
    ToastTitle,
    ToastViewport,
} from "@/components/ui/toast"
import { useToast } from "@/hooks/useToast"
import { CheckCircle2, AlertCircle, Info } from "lucide-react"

export function Toaster() {
    const { toasts } = useToast()

    return (
        <ToastProvider>
            {toasts.map(function ({ id, title, description, action, variant, ...props }) {
                return (
                    <Toast key={id} variant={variant} {...props}>
                        <div className="flex gap-3 items-start">
                            <div className="mt-0.5">
                                {variant === 'destructive' && <AlertCircle className="h-5 w-5 text-red-500" />}
                                {variant === 'success' && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
                                {variant === 'default' && <Info className="h-5 w-5 text-blue-500" />}
                            </div>
                            <div className="grid gap-1">
                                {title && <ToastTitle className="text-sm font-bold tracking-tight">{title}</ToastTitle>}
                                {description && (
                                    <ToastDescription className="text-xs font-medium text-slate-500">{description}</ToastDescription>
                                )}
                            </div>
                        </div>
                        {action}
                        <ToastClose />
                    </Toast>
                )
            })}
            <ToastViewport />
        </ToastProvider>
    )
}
