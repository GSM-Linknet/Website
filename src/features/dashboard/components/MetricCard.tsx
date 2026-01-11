import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: string;
    trendUp?: boolean;
    variant?: "default" | "success" | "warning" | "danger" | "info";
    className?: string;
}

export function MetricCard({
    title,
    value,
    icon: Icon,
    trend,
    trendUp,
    variant = "default",
    className
}: MetricCardProps) {
    const variantClasses = {
        default: "border-slate-100 bg-white",
        success: "border-emerald-100 bg-emerald-50/30",
        warning: "border-amber-100 bg-amber-50/30",
        danger: "border-red-100 bg-red-50/30",
        info: "border-blue-100 bg-blue-50/30",
    };

    const iconBgClasses = {
        default: "bg-blue-500",
        success: "bg-emerald-500",
        warning: "bg-amber-500",
        danger: "bg-red-500",
        info: "bg-sky-500",
    };

    return (
        <div
            className={cn(
                "relative overflow-hidden rounded-2xl border p-5 shadow-lg shadow-slate-200/40 transition-all hover:scale-[1.02]",
                variantClasses[variant],
                className
            )}
        >
            <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        {title}
                    </p>
                    <p className="text-3xl font-extrabold text-[#101D42] tracking-tight">
                        {value}
                    </p>
                    {trend && (
                        <p
                            className={cn(
                                "text-xs font-bold",
                                trendUp ? "text-emerald-600" : "text-red-600"
                            )}
                        >
                            {trend}
                        </p>
                    )}
                </div>
                <div
                    className={cn(
                        "p-3 rounded-xl shadow-lg text-white",
                        iconBgClasses[variant]
                    )}
                >
                    <Icon size={20} />
                </div>
            </div>
        </div>
    );
}
