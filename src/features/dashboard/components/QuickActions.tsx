import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickAction {
    label: string;
    icon: LucideIcon;
    onClick: () => void;
    variant?: "default" | "primary" | "success" | "danger";
}

interface QuickActionsProps {
    actions: QuickAction[];
    className?: string;
}

export function QuickActions({ actions, className }: QuickActionsProps) {
    const variantClasses = {
        default: "bg-slate-100 hover:bg-slate-200 text-slate-700",
        primary: "bg-[#101D42] hover:bg-[#1a2b5e] text-white",
        success: "bg-emerald-500 hover:bg-emerald-600 text-white",
        danger: "bg-red-500 hover:bg-red-600 text-white",
    };

    return (
        <div className={cn("flex flex-wrap gap-3", className)}>
            {actions.map((action, index) => {
                const Icon = action.icon;
                return (
                    <Button
                        key={index}
                        onClick={action.onClick}
                        className={cn(
                            "rounded-xl font-bold transition-all hover:scale-[1.02] shadow-lg",
                            variantClasses[action.variant || "default"]
                        )}
                    >
                        <Icon size={16} className="mr-2" />
                        {action.label}
                    </Button>
                );
            })}
        </div>
    );
}
