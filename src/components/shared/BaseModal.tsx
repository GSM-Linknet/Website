import type { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  icon?: LucideIcon;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  showFooter?: boolean;
  primaryActionLabel?: string;
  primaryActionOnClick?: () => void;
  primaryActionLoading?: boolean;
  secondaryActionLabel?: string;
}

const sizeClasses = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-md",
  lg: "sm:max-w-lg",
  xl: "sm:max-w-xl",
  "2xl": "sm:max-w-2xl",
};

export function BaseModal({
  isOpen,
  onClose,
  title,
  description,
  icon: Icon,
  children,
  footer,
  className,
  size = "md",
  showFooter = true,
  primaryActionLabel = "Simpan",
  primaryActionOnClick,
  primaryActionLoading = false,
  secondaryActionLabel = "Batal",
}: BaseModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={cn(
          "rounded-[1.5rem] border-none shadow-2xl p-0 flex flex-col max-h-[90vh] w-[95vw]", // Responsive width and max-height
          sizeClasses[size],
          className,
        )}
      >
        {/* Header Section */}
        <DialogHeader className="p-6 pb-2 space-y-3 flex-shrink-0">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="p-2.5 bg-blue-50 text-[#101D42] rounded-xl ring-1 ring-blue-100/50">
                <Icon size={20} />
              </div>
            )}
            <div>
              <DialogTitle className="text-xl font-bold text-[#101D42] tracking-tight">
                {title}
              </DialogTitle>
              {description && (
                <p className="text-sm text-slate-500 font-medium mt-0.5">
                  {description}
                </p>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* Content Section - Scrollable */}
        <div className="p-6 py-2 overflow-y-auto flex-1 custom-scrollbar">
          {children}
        </div>

        {/* Footer Section */}
        {showFooter && (
          <DialogFooter className="p-6 pt-2 flex gap-2 flex-shrink-0 bg-white z-10">
            {footer || (
              <>
                <Button
                  variant="ghost"
                  onClick={onClose}
                  disabled={primaryActionLoading}
                  className="rounded-xl font-semibold text-slate-500 hover:bg-slate-50"
                >
                  {secondaryActionLabel}
                </Button>
                <Button
                  onClick={primaryActionOnClick}
                  disabled={primaryActionLoading}
                  className="bg-[#101D42] text-white rounded-xl font-bold px-6 shadow-lg shadow-blue-900/20 hover:bg-[#1a2b5a] transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  {primaryActionLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Memproses...</span>
                    </div>
                  ) : (
                    primaryActionLabel
                  )}
                </Button>
              </>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default BaseModal;
