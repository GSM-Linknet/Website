import { AuthService } from "@/services/auth.service";
import UnitDashboard from "../components/UnitDashboard";
import { SuperAdminDashboard } from "../components/SuperAdminDashboard";
import { SalesDashboard } from "../components/SalesDashboard";

/**
 * DashboardPage is the entry point for the Dashboard feature.
 * Renders role-specific dashboards based on user role.
 */
export default function DashboardPage() {
    const user = AuthService.getUser();
    const userRole = user?.role || "USER";

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
