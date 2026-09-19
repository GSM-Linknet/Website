/**
 * Layout.tsx
 * Tujuan      : Komponen root layout untuk protected pages (Sidebar, Navbar, Alert, Socket, PermissionsProvider, Inactivity Idle Tracker).
 * Dipakai oleh: routes/config.tsx (sebagai element pembungkus route terlindungi)
 * Dependensi  : PermissionsProvider, SidebarProvider, Sidebar, Navbar, useGlobalSocket, useIdleTimeout
 * Fungsi utama: Layout (komponen utama), LayoutContent
 * Side effects: Inisialisasi WebSocket global, fetch dan sinkronisasi server permissions in-memory, auto-logout saat inaktivitas.
 */

import React, { useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { SidebarProvider, useSidebar } from "@/providers/sidebar-provider";
import { PermissionsProvider } from "@/providers/permissions-provider";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { AuthService } from "@/services/auth.service";
import { ImpersonateBanner } from "./ImpersonateBanner";
import { MaintenanceService } from "@/services/maintenance.service";
import { useLocation, useNavigate } from "react-router-dom";
import { WhatsAppDisconnectionAlert } from "./WhatsAppDisconnectionAlert";
import { SuspendQueueAlert } from "./SuspendQueueAlert";
import { AppSocketListener } from "./AppSocketListener";
import { useGlobalSocket } from "@/hooks/useGlobalSocket";
import { useIdleTimeout } from "@/hooks/useIdleTimeout";
import { isPermissionExpired } from "@/lib/permission-integrity";

/**
 * LayoutContent manages the dynamic arrangement of Sidebar, Navbar, and Page Content.
 * Juga bertugas mengawasi integritas permission cache dan melakukan re-fetch saat TTL expired.
 */
const LayoutContent = ({ children }: { children: React.ReactNode }) => {
    const { isCollapsed, isMobileOpen, closeMobile } = useSidebar();
    const location = useLocation();
    const navigate = useNavigate();

    // Pantau inaktivitas pengguna dan logout otomatis jika idle
    useIdleTimeout();

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
      const user = AuthService.getUser();
      if (!user) return;

      // Re-fetch jika: (1) belum ada permission, (2) TTL sudah expired (> 1 menit)
      const shouldRefresh = isPermissionExpired();
      if (shouldRefresh) {
        await AuthService.initPermissions();
      }
    };

    checkMaintenance();
    checkPermissions();

    // Deteksi manipulasi localStorage secara real-time dari tab yang sama
    // (storage event hanya trigger antar tab, tidak dalam tab yang sama)
    // Untuk mitigation dalam satu tab, TTL + signature di getVerifiedPermissions() sudah cukup
    const handleStorageTamper = (e: StorageEvent) => {
      if (
        (e.key === "app_permissions" || e.key === "app_permissions_signed") &&
        e.newValue !== null
      ) {
        // Ada perubahan dari tab lain → force re-fetch untuk sinkronisasi
        AuthService.initPermissions();
      }
    };
    window.addEventListener("storage", handleStorageTamper);
    return () => window.removeEventListener("storage", handleStorageTamper);
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

            {/* Global Alerts */}
            <WhatsAppDisconnectionAlert />
            <SuspendQueueAlert />
            <AppSocketListener />
        </div>
    );
};

export const Layout = ({ children }: { children: React.ReactNode }) => {
    // Call the global socket hook to maintain presence detection across the app
    useGlobalSocket();

    return (
        <PermissionsProvider>
            <SidebarProvider>
                <LayoutContent>{children}</LayoutContent>
            </SidebarProvider>
        </PermissionsProvider>
    );
};
