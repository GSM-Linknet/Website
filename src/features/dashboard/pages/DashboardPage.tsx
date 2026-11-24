/**
 * @file DashboardPage.tsx
 * @description Entry point untuk halaman Dashboard yang me-render komponen spesifik berdasarkan role user (SuperAdmin, AdminLinknet, Sales, Unit).
 * @caller routes/config.tsx (/dashboard)
 * @dependencies AuthService, SuperAdminDashboard, LinknetDashboard, SalesDashboard, UnitDashboard
 * @publicFunctions DashboardPage
 * @sideEffects Membaca sesi user dari AuthService
 */

import { AuthService } from "@/services/auth.service";
import UnitDashboard from "../components/UnitDashboard";
import { SuperAdminDashboard } from "../components/SuperAdminDashboard";
import { SalesDashboard } from "../components/SalesDashboard";
import { LinknetDashboard } from "../components/LinknetDashboard";

/**
 * DashboardPage is the entry point for the Dashboard feature.
 * Renders role-specific dashboards based on user role.
 */
export default function DashboardPage() {
    const user = AuthService.getUser();
    const userRole = user?.role || "USER";

    // Dedicated Linknet Provider Dashboard (Non-Children Billing & Finance only)
    if (userRole === "ADMIN_LINKNET") {
        return <LinknetDashboard />;
    }

    // Super Admin & Admin Pusat Dashboard
    if (userRole === "SUPER_ADMIN" || userRole === "ADMIN_PUSAT") {
        return <SuperAdminDashboard />;
    }

    // Sales Dashboard
    if (userRole === "SALES") {
        return <SalesDashboard />;
    }

    // Unit/SubUnit/Supervisor Dashboard
    const unitRoles = ["ADMIN_UNIT", "ADMIN_SUB_UNIT", "SUPERVISOR"];
    if (unitRoles.includes(userRole)) {
        return <UnitDashboard userName={user?.name} unitId={user?.unitId} subUnitId={user?.subUnitId} />;
    }

    // Default dashboard for other roles (will be enhanced in Phase 2)
    return <SuperAdminDashboard />;
}
