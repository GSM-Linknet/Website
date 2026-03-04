import React from "react";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { SidebarProvider, useSidebar } from "@/providers/sidebar-provider";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import { AuthService } from "@/services/auth.service";
import { ImpersonateBanner } from "./ImpersonateBanner";
import { MaintenanceService } from "@/services/maintenance.service";
import { useLocation, useNavigate } from "react-router-dom";
import { WhatsAppDisconnectionAlert } from "./WhatsAppDisconnectionAlert";

/**
 * LayoutContent manages the dynamic arrangement of Sidebar, Navbar, and Page Content.
 */
const LayoutContent = ({ children }: { children: React.ReactNode }) => {
    const { isCollapsed, isMobileOpen, closeMobile } = useSidebar();
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const checkMaintenance = async () => {
            // Don't check if already on maintenance page
            if (location.pathname === "/maintenance") return;

            const isMaintenanceActive = await MaintenanceService.getStatus();
            if (MaintenanceService.isRedirectRequired(isMaintenanceActive)) {
                navigate("/maintenance");
            }
        };

        const checkPermissions = async () => {
            const hasPermissions = localStorage.getItem("app_permissions");
            if (!hasPermissions && AuthService.getUser()) {
                await AuthService.initPermissions();
            }
        };

        checkMaintenance();
        checkPermissions();
    }, [location.pathname, navigate]);

    return (
        <div className="flex h-screen bg-[#F8F9FD] overflow-hidden">
            {/* Desktop Sidebar */}
            <aside className={cn(
                "hidden lg:block h-full transition-all duration-300 ease-in-out border-r border-slate-200/50 shadow-sm z-20",
                isCollapsed ? "w-20" : "w-64"
            )}>
                <Sidebar />
            </aside>

            {/* Mobile Sidebar (Sheet) */}
            <Sheet open={isMobileOpen} onOpenChange={closeMobile}>
                <SheetContent side="left" className="p-0 border-none w-72 bg-brand-blue">
                    <SheetHeader className="sr-only">
                        <SheetTitle>Navigation Menu</SheetTitle>
                    </SheetHeader>
                    <Sidebar />
                </SheetContent>
            </Sheet>

            {/* Main Application Area */}
            <div className="flex-1 flex flex-col min-w-0 h-full relative overflow-hidden transition-all duration-300">
                <ImpersonateBanner />
                <Navbar />

                <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 custom-scrollbar scroll-smooth">
                    <div className="max-w-none mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500">
                        {children}
                    </div>
                </main>

                {/* Optional: Subtle background decoration */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl -z-10" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -z-10" />
            </div>

            {/* WhatsApp Disconnection Alert */}
            <WhatsAppDisconnectionAlert />
        </div>
    );
};

export const Layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <SidebarProvider>
            <LayoutContent>{children}</LayoutContent>
        </SidebarProvider>
    );
};
