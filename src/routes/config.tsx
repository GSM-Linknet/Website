import { lazy, Suspense } from "react";
import type { RouteObject } from "react-router-dom";
import { Navigate, Outlet } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Layout } from "@/components/shared/Layout";

// Lazy load pages
const LoginPage = lazy(() => import("@/features/auth/pages/LoginPage"));
const DashboardPage = lazy(
  () => import("@/features/dashboard/pages/DashboardPage"),
);
const CustomerListPage = lazy(
  () => import("@/features/customers/pages/CustomerListPage"),
);
const CustomerRegistrationPage = lazy(
  () => import("@/features/customers/pages/CustomerRegistrationPage"),
);
const TechnicianPage = lazy(
  () => import("@/features/technicians/pages/TechnicianPage"),
);
const ServicePricingPage = lazy(
  () => import("@/features/technicians/pages/ServicePricingPage"),
);
const TechnicianToolsPage = lazy(
  () => import("@/features/technicians/pages/TechnicianToolsPage"),
);
const ProspectEntryPage = lazy(
  () => import("@/features/production/pages/ProspectEntryPage"),
);
const SupervisorReportPage = lazy(
  () => import("@/features/reporting/pages/SupervisorReportPage"),
);
const UnitActivityPage = lazy(
  () => import("@/features/reporting/pages/UnitActivityPage"),
);
const SaldoPage = lazy(() => import("@/features/finance/pages/SaldoPage"));
const InvoicePage = lazy(() => import("@/features/finance/pages/InvoicePage"));
const PaymentHistoryPage = lazy(
  () => import("@/features/finance/pages/PaymentHistoryPage"),
);
const AgingReportsPage = lazy(
  () => import("@/features/finance/pages/AgingReportsPage"),
);
const PayoutPage = lazy(() => import("@/features/finance/pages/PayoutPage"));
const CommissionPage = lazy(() => import("@/features/finance/pages/CommissionPage"));
const WilayahPage = lazy(() => import("@/features/master/pages/WilayahPage"));
const AreaPage = lazy(() => import("@/features/master/pages/AreaPage"));
const CabangPage = lazy(() => import("@/features/master/pages/CabangPage"));
const UnitPage = lazy(() => import("@/features/master/pages/UnitPage"));
const SubUnitPage = lazy(() => import("@/features/master/pages/SubUnitPage"));
const PackagePricingPage = lazy(
  () => import("@/features/master/pages/PackagePricingPage"),
);
const DiscountPage = lazy(() => import("@/features/master/pages/DiscountPage"));
const UserPage = lazy(() => import("@/features/master/pages/UserPage"));
const InstallSchedulePage = lazy(
  () => import("@/features/production/pages/InstallSchedulePage"),
);
const AdminVerificationPage = lazy(
  () => import("@/features/production/pages/AdminVerificationPage"),
);
const WorkOrderPage = lazy(
  () => import("@/features/production/pages/WorkOrderPage"),
);
const CoverageMapPage = lazy(
  () => import("@/features/production/pages/CoverageMapPage"),
);
const PermissionPage = lazy(
  () => import("@/features/settings/pages/PermissionPage"),
);
const WhatsAppSettingsPage = lazy(
  () => import("@/features/settings/pages/WhatsAppSettingsPage"),
);
const WhatsAppMonitorPage = lazy(
  () => import("@/features/settings/pages/WhatsAppMonitorPage"),
);
const CommissionSettingsPage = lazy(
  () => import("@/features/settings/pages/CommissionSettingsPage"),
);
const PeriodicReportPage = lazy(
  () => import("@/features/reporting/pages/PeriodicReportPage"),
);
const ComingSoonPage = lazy(() => import("@/pages/ComingSoonPage"));
const NotFoundPage = lazy(() => import("@/pages/NotFound"));
const LogPage = lazy(() => import("@/features/log/LogPage"));
const SalesTargetPage = lazy(() => import("@/features/reporting/pages/SalesTargetPage"));
const CustomerReportPage = lazy(() => import("@/features/reporting/pages/CustomerReportPage"));
const FinancialReportPage = lazy(() => import("@/features/reporting/pages/FinancialReportPage"));
const TechnicianReportPage = lazy(() => import("@/features/reporting/pages/TechnicianReportPage"));
const ProductionReportPage = lazy(() => import("@/features/reporting/pages/ProductionReportPage"));
const SalesReportPage = lazy(() => import("@/features/reporting/pages/SalesReportPage"));
const ActivityReportPage = lazy(() => import("@/features/reporting/pages/ActivityReportPage"));
const ProfilePage = lazy(() => import("@/features/profile/pages/ProfilePage"));
const MaintenancePage = lazy(() => import("@/pages/MaintenancePage"));
const PublicPaymentPage = lazy(() => import("@/features/finance/pages/PublicPaymentPage"));
const BatchPaymentPage = lazy(() => import("@/features/finance/pages/BatchPaymentPage"));
const ExpenseUsagePage = lazy(() => import("@/features/reporting/pages/ExpenseUsagePage"));
const UnitExpensePage = lazy(() => import("@/features/finance/pages/UnitExpensePage"));
const DailyJournalPage = lazy(() => import("@/features/finance/pages/DailyJournalPage"));
const UnitRevenuePage = lazy(() => import("@/features/finance/pages/UnitRevenuePage"));
const UnitBalancePage = lazy(() => import("@/features/finance/pages/UnitBalancePage"));

/**
 * Loading component for Suspense fallback.
 */
const PageLoader = () => (
  <div className="p-8 space-y-6 animate-pulse">
    <Skeleton className="h-10 w-1/3 bg-slate-100 rounded-xl" />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Skeleton className="h-32 bg-slate-50 rounded-2xl" />
      <Skeleton className="h-32 bg-slate-50 rounded-2xl" />
      <Skeleton className="h-32 bg-slate-50 rounded-2xl" />
    </div>
    <Skeleton className="h-64 w-full bg-slate-50 rounded-3xl" />
  </div>
);

/**
 * Centralized Route Configuration.
 */
export const routes: RouteObject[] = [
  // 0. Maintenance Route
  {
    path: "/maintenance",
    element: (
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-[#F8F9FD]">
            <Skeleton className="w-12 h-12 rounded-full animate-spin border-4 border-blue-500 border-t-transparent bg-transparent" />
          </div>
        }
      >
        <MaintenancePage />
      </Suspense>
    ),
  },

  // 0.1 Public Payment Route
  {
    path: "/pay/:id",
    element: (
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-[#F8F9FD]">
            <Skeleton className="w-12 h-12 rounded-full animate-spin border-4 border-blue-500 border-t-transparent bg-transparent" />
          </div>
        }
      >
        <PublicPaymentPage />
      </Suspense>
    ),
  },

  // 1. Auth Routes (No Sidebar/Navbar)
  {
    index: true,
    element: (
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-[#F8F9FD]">
            <Skeleton className="w-12 h-12 rounded-full animate-spin border-4 border-blue-500 border-t-transparent bg-transparent" />
          </div>
        }
      >
        <LoginPage />
      </Suspense>
    ),
  },

  // 2. Protected Routes (With Main Layout)
  {
    element: (
      <Layout>
        <Outlet />
      </Layout>
    ),
    children: [
      {
        path: "/dashboard",
        element: (
          <Suspense fallback={<PageLoader />}>
            <DashboardPage />
          </Suspense>
        ),
      },
      {
        path: "pelanggan",
        children: [
          {
            path: "pendaftaran",
            element: (
              <Suspense fallback={<PageLoader />}>
                <CustomerRegistrationPage />
              </Suspense>
            ),
          },
          {
            path: "kelola",
            element: (
              <Suspense fallback={<PageLoader />}>
                <CustomerListPage />
              </Suspense>
            ),
          },
          {
            path: "layanan",
            element: (
              <Suspense fallback={<PageLoader />}>
                <ComingSoonPage />
              </Suspense>
            ),
          },
          {
            index: true,
            element: <Navigate to="kelola" replace />,
          },
        ],
      },
      {
        path: "reporting",
        children: [
          {
            path: "customers",
            element: (
              <Suspense fallback={<PageLoader />}>
                <CustomerReportPage />
              </Suspense>
            ),
          },
          {
            path: "financial",
            element: (
              <Suspense fallback={<PageLoader />}>
                <FinancialReportPage />
              </Suspense>
            ),
          },
          {
            path: "technician",
            element: (
              <Suspense fallback={<PageLoader />}>
                <TechnicianReportPage />
              </Suspense>
            ),
          },
          {
            path: "production",
            element: (
              <Suspense fallback={<PageLoader />}>
                <ProductionReportPage />
              </Suspense>
            ),
          },
          {
            path: "sales-performance",
            element: (
              <Suspense fallback={<PageLoader />}>
                <SalesReportPage />
              </Suspense>
            ),
          },
          {
            path: "activity",
            element: (
              <Suspense fallback={<PageLoader />}>
                <ActivityReportPage />
              </Suspense>
            ),
          },
          {
            path: "sales",
            element: (
              <Suspense fallback={<PageLoader />}>
                <SupervisorReportPage />
              </Suspense>
            ),
          },
          {
            path: "unit",
            element: (
              <Suspense fallback={<PageLoader />}>
                <UnitActivityPage />
              </Suspense>
            ),
          },
          {
            path: "sales-target",
            element: (
              <Suspense fallback={<PageLoader />}>
                <SalesTargetPage />
              </Suspense>
            ),
          },
          {
            path: "berkala",
            element: (
              <Suspense fallback={<PageLoader />}>
                <PeriodicReportPage />
              </Suspense>
            ),
          },
          {
            path: "expense-usage",
            element: (
              <Suspense fallback={<PageLoader />}>
                <ExpenseUsagePage />
              </Suspense>
            ),
          },
        ],
      },
      {
        path: "master",
        children: [
          {
            path: "wilayah",
            element: (
              <Suspense fallback={<PageLoader />}>
                <WilayahPage />
              </Suspense>
            ),
          },
          {
            path: "area",
            element: (
              <Suspense fallback={<PageLoader />}>
                <AreaPage />
              </Suspense>
            ),
          },
          {
            path: "cabang",
            element: (
              <Suspense fallback={<PageLoader />}>
                <CabangPage />
              </Suspense>
            ),
          },
          {
            path: "unit",
            element: (
              <Suspense fallback={<PageLoader />}>
                <UnitPage />
              </Suspense>
            ),
          },
          {
            path: "sub-unit",
            element: (
              <Suspense fallback={<PageLoader />}>
                <SubUnitPage />
              </Suspense>
            ),
          },
          {
            path: "paket",
            element: (
              <Suspense fallback={<PageLoader />}>
                <PackagePricingPage />
              </Suspense>
            ),
          },
          {
            path: "diskon",
            element: (
              <Suspense fallback={<PageLoader />}>
                <DiscountPage />
              </Suspense>
            ),
          },
          {
            path: "users",
            element: (
              <Suspense fallback={<PageLoader />}>
                <UserPage />
              </Suspense>
            ),
          },
          {
            path: "schedule",
            element: (
              <Suspense fallback={<PageLoader />}>
                <InstallSchedulePage />
              </Suspense>
            ),
          },
        ],
      },
      {
        path: "teknisi",
        children: [
          {
            path: "database",
            element: (
              <Suspense fallback={<PageLoader />}>
                <TechnicianPage />
              </Suspense>
            ),
          },
          {
            path: "harga-jasa",
            element: (
              <Suspense fallback={<PageLoader />}>
                <ServicePricingPage />
              </Suspense>
            ),
          },
          {
            path: "tools",
            element: (
              <Suspense fallback={<PageLoader />}>
                <TechnicianToolsPage />
              </Suspense>
            ),
          },
        ],
      },
      {
        path: "produksi",
        children: [
          {
            path: "prospek",
            element: (
              <Suspense fallback={<PageLoader />}>
                <ProspectEntryPage />
              </Suspense>
            ),
          },
          {
            path: "verifikasi",
            element: (
              <Suspense fallback={<PageLoader />}>
                <AdminVerificationPage />
              </Suspense>
            ),
          },
          {
            path: "wo",
            element: (
              <Suspense fallback={<PageLoader />}>
                <WorkOrderPage />
              </Suspense>
            ),
          },
          {
            path: "coverage-map",
            element: (
              <Suspense fallback={<PageLoader />}>
                <CoverageMapPage />
              </Suspense>
            ),
          },
        ],
      },
      {
        path: "keuangan",
        children: [
          {
            path: "invoice",
            element: (
              <Suspense fallback={<PageLoader />}>
                <InvoicePage />
              </Suspense>
            ),
          },
          {
            path: "saldo",
            element: (
              <Suspense fallback={<PageLoader />}>
                <SaldoPage />
              </Suspense>
            ),
          },
          {
            path: "history",
            element: (
              <Suspense fallback={<PageLoader />}>
                <PaymentHistoryPage />
              </Suspense>
            ),
          },
          {
            path: "aging",
            element: (
              <Suspense fallback={<PageLoader />}>
                <AgingReportsPage />
              </Suspense>
            ),
          },
          {
            path: "payout",
            element: (
              <Suspense fallback={<PageLoader />}>
                <PayoutPage />
              </Suspense>
            ),
          },
          {
            path: "commission",
            element: (
              <Suspense fallback={<PageLoader />}>
                <CommissionPage />
              </Suspense>
            ),
          },
          {
            path: "batch-payment",
            element: (
              <Suspense fallback={<PageLoader />}>
                <BatchPaymentPage />
              </Suspense>
            ),
          },
          {
            path: "unit-expense",
            element: (
              <Suspense fallback={<PageLoader />}>
                <UnitExpensePage />
              </Suspense>
            ),
          },
          {
            path: "daily-journal",
            element: (
              <Suspense fallback={<PageLoader />}>
                <DailyJournalPage />
              </Suspense>
            ),
          },
          {
            path: "revenue-share",
            element: (
              <Suspense fallback={<PageLoader />}>
                <UnitRevenuePage />
              </Suspense>
            ),
          },
          {
            path: "unit-balance",
            element: (
              <Suspense fallback={<PageLoader />}>
                <UnitBalancePage />
              </Suspense>
            ),
          },
          {
            index: true,
            element: <Navigate to="saldo" replace />,
          },
        ],
      },
      {
        path: "settings",
        children: [
          {
            path: "permissions",
            element: (
              <Suspense fallback={<PageLoader />}>
                <PermissionPage />
              </Suspense>
            )
          },
          {
            path: "whatsapp",
            element: (
              <Suspense fallback={<PageLoader />}>
                <WhatsAppSettingsPage />
              </Suspense>
            )
          },
          {
            path: "whatsapp-monitor",
            element: (
              <Suspense fallback={<PageLoader />}>
                <WhatsAppMonitorPage />
              </Suspense>
            )
          },
          {
            path: "commission",
            element: (
              <Suspense fallback={<PageLoader />}>
                <CommissionSettingsPage />
              </Suspense>
            )
          }
        ]
      },
      {
        path: "aplikasi",
        element: (
          <Suspense fallback={<PageLoader />}>
            <ComingSoonPage />
          </Suspense>
        ),
      },
      {
        path: "logs",
        element: (
          <Suspense fallback={<PageLoader />}>
            <LogPage />
          </Suspense>
        ),
      },
      {
        path: "/profile",
        element: (
          <Suspense fallback={<PageLoader />}>
            <ProfilePage />
          </Suspense>
        ),
      },
    ],
  },

  // 3. Fallback / 404
  {
    path: "*",
    element: (
      <Layout>
        <Suspense fallback={<PageLoader />}>
          <NotFoundPage />
        </Suspense>
      </Layout>
    ),
  },
];
