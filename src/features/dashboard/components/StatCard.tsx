import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
    title: string;
    value: string;
    icon: LucideIcon;
    trend?: {
        value: string;
        isPositive: boolean;
        label: string;
    };
    color?: "blue" | "green" | "purple" | "orange";
    className?: string;
}

const colorStyles = {
    blue: "bg-blue-50 text-blue-600 ring-blue-500/10",
    green: "bg-emerald-50 text-emerald-600 ring-emerald-500/10",
    purple: "bg-purple-50 text-purple-600 ring-purple-500/10",
    orange: "bg-orange-50 text-orange-600 ring-orange-500/10",
};

/**
 * Premium StatCard with refined responsive layout and border-less design.
 */
export const StatCard = ({ title, value, icon: Icon, trend, color = "blue", className }: StatCardProps) => {
    return (
        <div className={cn(
            "bg-white rounded-3xl p-5 md:p-6 transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 group border border-slate-100/50",
            className
        )}>
            <div className="flex justify-between items-start mb-4">
                <div className={cn(
                    "p-3 rounded-2xl ring-1 transition-transform group-hover:scale-110 duration-300",
                    colorStyles[color]
                )}>
                    <Icon size={24} />
                </div>
                {trend && (
                    <div className={cn(
                        "flex items-center space-x-1 px-2.5 py-1 rounded-full text-[12px] font-bold ring-1 ring-inset whitespace-nowrap",
                        trend.isPositive ? "bg-emerald-50 text-emerald-600 ring-emerald-600/10" : "bg-rose-50 text-rose-600 ring-rose-600/10"
                    )}>
                        {trend.isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        <span>{trend.value}</span>
                    </div>
                )}
            </div>

            <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest leading-none">{title}</h3>
                <p className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">{value}</p>
                {trend && (
                    <p className="text-[11px] font-medium text-slate-400 mt-2">
                        {trend.label}
                    </p>
                )}
            </div>
        </div>
    );
};
