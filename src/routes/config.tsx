/**
 * routes/config.tsx
 * Tujuan      : Konfigurasi routing aplikasi React dengan proteksi permission terpusat dan halaman peringatan keamanan.
 * Dipakai oleh: routes/index.tsx -> App.tsx
 * Dependensi  : react-router-dom, lazy-loaded page components, PermissionGuard, SecurityWarningPage
 * Fungsi utama: Menyusun hirarki route, layout wrap, blocking permission check di setiap halaman, fallback route.
 * Side effects: Navigasi URL klien, lazy loading bundle, redirect ke /security-warning saat ada pelanggaran keamanan.
 */

import { lazy, Suspense } from "react";
import type { RouteObject } from "react-router-dom";
import { Navigate, Outlet } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Layout } from "@/components/shared/Layout";
import { PermissionGuard } from "@/components/shared/PermissionGuard";


// Lazy load pages
const LoginPage = lazy(() => import("@/features/auth/pages/LoginPage"));
const DashboardPage = lazy(
  () => import("@/features/dashboard/pages/DashboardPage"),
);
const CustomerListPage = lazy(
  () => import("@/features/customers/pages/CustomerListPage"),
);
const ChildrenCustomerListPage = lazy(
  () => import("@/features/customers/pages/ChildrenCustomerListPage"),
);
const CustomerRegistrationPage = lazy(
  () => import("@/features/customers/pages/CustomerRegistrationPage"),
);
const LinkNetPage = lazy(
  () => import("@/features/customers/pages/LinkNetPage"),
);
const SuspendReviewPage = lazy(
  () => import("@/features/customers/pages/SuspendReviewPage"),
);
const DeletedCustomersPage = lazy(
  () => import("@/features/customers/pages/DeletedCustomersPage"),
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
const DeleteRequestsPage = lazy(() => import("@/features/finance/pages/DeleteRequestsPage"));
const PaymentHistoryPage = lazy(
  () => import("@/features/finance/pages/PaymentHistoryPage"),
);
const PendingPaymentsPage = lazy(
  () => import("@/features/finance/pages/PendingPaymentsPage"),
);
const UnallocatedPaymentPage = lazy(
  () => import("@/features/finance/pages/UnallocatedPaymentPage"),
);
const AgingReportsPage = lazy(
  () => import("@/features/finance/pages/AgingReportsPage"),
);
const PayoutPage = lazy(() => import("@/features/finance/pages/PayoutPage"));
const CommissionPage = lazy(() => import("@/features/finance/pages/CommissionPage"));
const CommissionManagementPage = lazy(() => import("@/features/finance/pages/CommissionManagementPage"));
const LinknetBillingPage = lazy(() => import("@/features/finance/pages/LinknetBillingPage"));
const WilayahPage = lazy(() => import("@/features/master/pages/WilayahPage"));
const AreaPage = lazy(() => import("@/features/master/pages/AreaPage"));
const CabangPage = lazy(() => import("@/features/master/pages/CabangPage"));
const UnitPage = lazy(() => import("@/features/master/pages/UnitPage"));
const SubUnitPage = lazy(() => import("@/features/master/pages/SubUnitPage"));
const PackagePricingPage = lazy(
  () => import("@/features/master/pages/PackagePricingPage"),
);
const DiscountPage = lazy(() => import("@/features/master/pages/DiscountPage"));
const UnitCommissionConfigPage = lazy(() => import("@/features/master/pages/UnitCommissionConfigPage"));
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

const TemplateManagementPage = lazy(
  () => import("@/features/settings/pages/TemplateManagementPage"),
);
const LinkNetLogPage = lazy(
  () => import("@/features/settings/pages/LinknetLogPage"),
);
const NotificationSettingsPage = lazy(
  () => import("@/features/settings/pages/NotificationSettingsPage"),
);
const SystemSettingsPage = lazy(
  () => import("@/features/settings/pages/SystemSettingsPage"),
);
const PeriodicReportPage = lazy(
  () => import("@/features/reporting/pages/PeriodicReportPage"),
);
const ComingSoonPage = lazy(() => import("@/pages/ComingSoonPage"));
const NotFoundPage = lazy(() => import("@/pages/NotFound"));
const PrivacyPolicyPage = lazy(() => import("@/pages/PrivacyPolicyPage"));
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
const KpiReportPage = lazy(() => import("@/features/reporting/pages/KpiReportPage"));
const UnitExpensePage = lazy(() => import("@/features/finance/pages/UnitExpensePage"));
const DailyJournalPage = lazy(() => import("@/features/finance/pages/DailyJournalPage"));
const UnitRevenuePage = lazy(() => import("@/features/finance/pages/UnitRevenuePage"));
const UnitBalancePage = lazy(() => import("@/features/finance/pages/UnitBalancePage"));
const CentralBalancePage = lazy(() => import("@/features/finance/pages/CentralBalancePage"));
const CustomersWithoutInvoicePage = lazy(() => import("@/features/finance/pages/CustomersWithoutInvoicePage"));
const RABPage = lazy(() => import("@/features/finance/pages/RABPage"));
const ReviewUnitPaymentPage = lazy(() => import("@/features/finance/pages/ReviewUnitPaymentPage"));
const CustomerSupportPage = lazy(() => import("@/features/customer-support/pages/CustomerSupportPage"));
const CsShiftPage = lazy(() => import("@/features/customer-support/pages/CsShiftPage"));

const SecurityWarningPage = lazy(() => import("@/pages/SecurityWarningPage"));

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

  // 0.2 Privacy Policy Route
  {
    path: "/kebijakan-privasi",
    element: (
      <Suspense fallback={<PageLoader />}>
        <PrivacyPolicyPage />
      </Suspense>
    ),
  },

  // 0.3 Security Warning Route (Standalone Warning Notification)
  {
    path: "/security-warning",
    element: (
      <Suspense fallback={<PageLoader />}>
        <SecurityWarningPage />
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

  // 1.5 Fullscreen Customer Support Route
  {
    path: "/customer-support/fullscreen",
    element: (
      <Suspense fallback={<PageLoader />}>
        <CustomerSupportPage />
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
          <PermissionGuard resource="dashboard" action="view">
            <Suspense fallback={<PageLoader />}>
              <DashboardPage />
            </Suspense>
          </PermissionGuard>
        ),
      },
      {
        path: "pelanggan",
        children: [
          {
            path: "pendaftaran",
            element: (
              <PermissionGuard resource="pelanggan.pendaftaran" action="view">
                <Suspense fallback={<PageLoader />}>
                  <CustomerRegistrationPage />
                </Suspense>
              </PermissionGuard>
            ),
          },
          {
            path: "kelola",
            element: (
              <PermissionGuard resource="pelanggan.kelola" action="view">
                <Suspense fallback={<PageLoader />}>
                  <CustomerListPage />
                </Suspense>
              </PermissionGuard>
            ),
          },
          {
            path: "children",
            element: (
              <PermissionGuard resource="pelanggan.kelola" action="view">
                <Suspense fallback={<PageLoader />}>
                  <ChildrenCustomerListPage />
                </Suspense>
              </PermissionGuard>
            ),
          },
          {
            path: "layanan",
            element: (
              <PermissionGuard resource="pelanggan.layanan" action="view">
                <Suspense fallback={<PageLoader />}>
                  <LinkNetPage />
                </Suspense>
              </PermissionGuard>
            ),
          },
          {
            path: "review-suspend",
            element: (
              <PermissionGuard resource="pelanggan.suspend-queue" action="view">
                <Suspense fallback={<PageLoader />}>
                  <SuspendReviewPage />
                </Suspense>
              </PermissionGuard>
            ),
          },
          {
            path: "trash",
            element: (
              <PermissionGuard resource="pelanggan.trash" action="view">
                <Suspense fallback={<PageLoader />}>
                  <DeletedCustomersPage />
                </Suspense>
              </PermissionGuard>
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
              <PermissionGuard resource="reporting.pelanggan" action="view">
                <Suspense fallback={<PageLoader />}>
                  <CustomerReportPage />
                </Suspense>
              </PermissionGuard>
            ),
          },
          {
            path: "financial",
            element: (
              <PermissionGuard resource="reporting.keuangan" action="view">
                <Suspense fallback={<PageLoader />}>
                  <FinancialReportPage />
                </Suspense>
              </PermissionGuard>
            ),
          },
          {
            path: "technician",
            element: (
              <PermissionGuard resource="reporting.teknisi" action="view">
                <Suspense fallback={<PageLoader />}>
                  <TechnicianReportPage />
                </Suspense>
              </PermissionGuard>
            ),
          },
          {
            path: "production",
            element: (
              <PermissionGuard resource="reporting.produksi" action="view">
                <Suspense fallback={<PageLoader />}>
                  <ProductionReportPage />
                </Suspense>
              </PermissionGuard>
            ),
          },
          {
            path: "sales-performance",
            element: (
              <PermissionGuard resource="reporting.master" action="view">
                <Suspense fallback={<PageLoader />}>
                  <SalesReportPage />
                </Suspense>
              </PermissionGuard>
            ),
          },
          {
            path: "activity",
            element: (
              <PermissionGuard resource="reporting.activity" action="view">
                <Suspense fallback={<PageLoader />}>
                  <ActivityReportPage />
                </Suspense>
              </PermissionGuard>
            ),
          },
          {
            path: "sales",
            element: (
              <PermissionGuard resource="reporting.sales" action="view">
                <Suspense fallback={<PageLoader />}>
                  <SupervisorReportPage />
                </Suspense>
              </PermissionGuard>
            ),
          },
          {
            path: "unit",
            element: (
              <PermissionGuard resource="reporting.unit" action="view">
                <Suspense fallback={<PageLoader />}>
                  <UnitActivityPage />
                </Suspense>
              </PermissionGuard>
            ),
          },
          {
            path: "sales-target",
            element: (
              <PermissionGuard resource="reporting.sales-target" action="view">
                <Suspense fallback={<PageLoader />}>
                  <SalesTargetPage />
                </Suspense>
              </PermissionGuard>
            ),
          },
          {
            path: "berkala",
            element: (
              <PermissionGuard resource="reporting.berkala" action="view">
                <Suspense fallback={<PageLoader />}>
                  <PeriodicReportPage />
                </Suspense>
              </PermissionGuard>
            ),
          },
          {
            path: "expense-usage",
            element: (
              <PermissionGuard resource="reporting.expense" action="view">
                <Suspense fallback={<PageLoader />}>
                  <ExpenseUsagePage />
                </Suspense>
              </PermissionGuard>
            ),
          },
          {
            path: "kpi",
            element: (
              <PermissionGuard resource="reporting.kpi" action="view">
                <Suspense fallback={<PageLoader />}>
                  <KpiReportPage />
                </Suspense>
              </PermissionGuard>
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
              <PermissionGuard resource="master.wilayah" action="view">
                <Suspense fallback={<PageLoader />}>
                  <WilayahPage />
                </Suspense>
              </PermissionGuard>
            ),
          },
          {
            path: "area",
            element: (
              <PermissionGuard resource="master.area" action="view">
                <Suspense fallback={<PageLoader />}>
                  <AreaPage />
                </Suspense>
              </PermissionGuard>
            ),
          },
          {
            path: "cabang",
            element: (
              <PermissionGuard resource="master.wilayah" action="view">
                <Suspense fallback={<PageLoader />}>
                  <CabangPage />
                </Suspense>
              </PermissionGuard>
            ),
          },
          {
            path: "unit",
            element: (
              <PermissionGuard resource="master.unit" action="view">
                <Suspense fallback={<PageLoader />}>
                  <UnitPage />
                </Suspense>
              </PermissionGuard>
            ),
          },
          {
            path: "unit/:unitId/commission",
            element: (
              <PermissionGuard resource="master.unit" action="view">
                <Suspense fallback={<PageLoader />}>
                  <UnitCommissionConfigPage />
                </Suspense>
              </PermissionGuard>
            ),
          },
          {
            path: "sub-unit",
            element: (
              <PermissionGuard resource="master.unit" action="view">
                <Suspense fallback={<PageLoader />}>
                  <SubUnitPage />
                </Suspense>
              </PermissionGuard>
            ),
          },
          {
            path: "paket",
            element: (
              <PermissionGuard resource="master.paket" action="view">
                <Suspense fallback={<PageLoader />}>
                  <PackagePricingPage />
                </Suspense>
              </PermissionGuard>
            ),
          },
          {
            path: "diskon",
            element: (
              <PermissionGuard resource="master.diskon" action="view">
                <Suspense fallback={<PageLoader />}>
                  <DiscountPage />
                </Suspense>
              </PermissionGuard>
            ),
          },
          {
            path: "users",
            element: (
              <PermissionGuard resource="master.users" action="impersonate">
                <Suspense fallback={<PageLoader />}>
                  <UserPage />
                </Suspense>
              </PermissionGuard>
            ),
          },
          {
            path: "schedule",
            element: (
              <PermissionGuard resource="master.schedule" action="view">
                <Suspense fallback={<PageLoader />}>
                  <InstallSchedulePage />
                </Suspense>
              </PermissionGuard>
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
              <PermissionGuard resource="teknisi.database" action="view">
                <Suspense fallback={<PageLoader />}>
                  <TechnicianPage />
                </Suspense>
              </PermissionGuard>
            ),
          },
          {
            path: "harga-jasa",
            element: (
              <PermissionGuard resource="teknisi.harga" action="view">
                <Suspense fallback={<PageLoader />}>
                  <ServicePricingPage />
                </Suspense>
              </PermissionGuard>
            ),
          },
          {
            path: "tools",
            element: (
              <PermissionGuard resource="teknisi.tools" action="view">
                <Suspense fallback={<PageLoader />}>
                  <TechnicianToolsPage />
                </Suspense>
              </PermissionGuard>
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
              <PermissionGuard resource="produksi.prospek" action="view">
                <Suspense fallback={<PageLoader />}>
                  <ProspectEntryPage />
                </Suspense>
              </PermissionGuard>
            ),
          },
          {
            path: "verifikasi",
            element: (
              <PermissionGuard resource="produksi.verifikasi" action="view">
                <Suspense fallback={<PageLoader />}>
                  <AdminVerificationPage />
                </Suspense>
              </PermissionGuard>
            ),
          },
          {
            path: "wo",
            element: (
              <PermissionGuard resource="produksi.wo" action="view">
                <Suspense fallback={<PageLoader />}>
                  <WorkOrderPage />
                </Suspense>
              </PermissionGuard>
            ),
          },
          {
            path: "coverage-map",
            element: (
              <PermissionGuard resource="produksi.cakupan" action="view">
                <Suspense fallback={<PageLoader />}>
                  <CoverageMapPage />
                </Suspense>
              </PermissionGuard>
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
              <PermissionGuard resource="keuangan.invoice" action="view">
                <Suspense fallback={<PageLoader />}>
                  <InvoicePage />
                </Suspense>
              </PermissionGuard>
            ),
          },
          {
            path: "delete-requests",
            element: (
              <PermissionGuard resource="keuangan.history" action="view">
                <Suspense fallback={<PageLoader />}>
                  <DeleteRequestsPage />
                </Suspense>
              </PermissionGuard>
            ),
          },
          {
            path: "review-unit",
            element: (
              <PermissionGuard resource="keuangan.review" action="view">
                <Suspense fallback={<PageLoader />}>
                  <ReviewUnitPaymentPage />
                </Suspense>
              </PermissionGuard>
            ),
          },
          {
            path: "customers-without-invoice",
            element: (
              <PermissionGuard resource="keuangan.invoice" action="view">
                <Suspense fallback={<PageLoader />}>
                  <CustomersWithoutInvoicePage />
                </Suspense>
              </PermissionGuard>
            ),
          },
          {
            path: "saldo",
            element: (
              <PermissionGuard resource="keuangan.saldo" action="view">
                <Suspense fallback={<PageLoader />}>
                  <SaldoPage />
                </Suspense>
              </PermissionGuard>
            ),
          },
          {
            path: "history",
            element: (
              <PermissionGuard resource="keuangan.history" action="view">
                <Suspense fallback={<PageLoader />}>
                  <PaymentHistoryPage />
                </Suspense>
              </PermissionGuard>
            ),
          },
          {
            path: "pending-payments",
            element: (
              <PermissionGuard resource="keuangan.history" action="view">
                <Suspense fallback={<PageLoader />}>
                  <PendingPaymentsPage />
                </Suspense>
              </PermissionGuard>
            ),
          },
          {
            path: "unallocated",
            element: (
              <PermissionGuard resource="keuangan.unallocated" action="view">
                <Suspense fallback={<PageLoader />}>
                  <UnallocatedPaymentPage />
                </Suspense>
              </PermissionGuard>
            ),
          },
          {
            path: "aging",
            element: (
              <PermissionGuard resource="keuangan.aging" action="view">
                <Suspense fallback={<PageLoader />}>
                  <AgingReportsPage />
                </Suspense>
              </PermissionGuard>
            ),
          },
          {
            path: "payout",
            element: (
              <PermissionGuard resource="payout" action="view">
                <Suspense fallback={<PageLoader />}>
                  <PayoutPage />
                </Suspense>
              </PermissionGuard>
            ),
          },
          {
            path: "commission",
            element: (
              <PermissionGuard resource="komisi.laporan" action="view">
                <Suspense fallback={<PageLoader />}>
                  <CommissionPage />
                </Suspense>
              </PermissionGuard>
            ),
          },
          {
            path: "commission-management",
            element: (
              <PermissionGuard resource="komisi.setting" action="view">
                <Suspense fallback={<PageLoader />}>
                  <CommissionManagementPage />
                </Suspense>
              </PermissionGuard>
            ),
          },
          {
            path: "batch-payment",
            element: (
              <PermissionGuard resource="keuangan.batch-payment" action="view">
                <Suspense fallback={<PageLoader />}>
                  <BatchPaymentPage />
                </Suspense>
              </PermissionGuard>
            ),
          },
          {
            path: "unit-expense",
            element: (
              <PermissionGuard resource="keuangan.unit-expense" action="view">
                <Suspense fallback={<PageLoader />}>
                  <UnitExpensePage />
                </Suspense>
              </PermissionGuard>
            ),
          },
          {
            path: "daily-journal",
            element: (
              <PermissionGuard resource="keuangan.daily-journal" action="view">
                <Suspense fallback={<PageLoader />}>
                  <DailyJournalPage />
                </Suspense>
              </PermissionGuard>
            ),
          },
          {
            path: "linknet-billing",
            element: (
              <PermissionGuard resource="keuangan.linknet-billing" action="view">
                <Suspense fallback={<PageLoader />}>
                  <LinknetBillingPage />
                </Suspense>
              </PermissionGuard>
            ),
          },
          {
            path: "revenue-share",
            element: (
              <PermissionGuard resource="keuangan.revenue-share" action="view">
                <Suspense fallback={<PageLoader />}>
                  <UnitRevenuePage />
                </Suspense>
              </PermissionGuard>
            ),
          },
          {
            path: "unit-balance",
            element: (
              <PermissionGuard resource="komisi.unit-balance" action="view">
                <Suspense fallback={<PageLoader />}>
                  <UnitBalancePage />
                </Suspense>
              </PermissionGuard>
            ),
          },
          {
            path: "central-balance",
            element: (
              <PermissionGuard resource="komisi.saldo" action="view">
                <Suspense fallback={<PageLoader />}>
                  <CentralBalancePage />
                </Suspense>
              </PermissionGuard>
            ),
          },
          {
            path: "rab",
            element: (
              <PermissionGuard resource="keuangan.rab" action="view">
                <Suspense fallback={<PageLoader />}>
                  <RABPage />
                </Suspense>
              </PermissionGuard>
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
              <PermissionGuard resource="settings.permissions" action="view">
                <Suspense fallback={<PageLoader />}>
                  <PermissionPage />
                </Suspense>
              </PermissionGuard>
            )
          },
          {
            path: "whatsapp",
            element: (
              <PermissionGuard resource="settings.whatsapp" action="view">
                <Suspense fallback={<PageLoader />}>
                  <WhatsAppSettingsPage />
                </Suspense>
              </PermissionGuard>
            )
          },
          {
            path: "whatsapp-monitor",
            element: (
              <PermissionGuard resource="settings.whatsapp" action="view">
                <Suspense fallback={<PageLoader />}>
                  <WhatsAppMonitorPage />
                </Suspense>
              </PermissionGuard>
            )
          },
          {
            path: "templates",
            element: (
              <PermissionGuard resource="settings.system" action="view">
                <Suspense fallback={<PageLoader />}>
                  <TemplateManagementPage />
                </Suspense>
              </PermissionGuard>
            )
          },
          {
            path: "linknet-logs",
            element: (
              <PermissionGuard resource="settings.system" action="view">
                <Suspense fallback={<PageLoader />}>
                  <LinkNetLogPage />
                </Suspense>
              </PermissionGuard>
            )
          },
          {
            path: "notifications",
            element: (
              <PermissionGuard resource="settings.system" action="view">
                <Suspense fallback={<PageLoader />}>
                  <NotificationSettingsPage />
                </Suspense>
              </PermissionGuard>
            )
          },
          {
            path: "system",
            element: (
              <PermissionGuard resource="settings.system" action="view">
                <Suspense fallback={<PageLoader />}>
                  <SystemSettingsPage />
                </Suspense>
              </PermissionGuard>
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
          <PermissionGuard resource="logs.customer" action="view">
            <Suspense fallback={<PageLoader />}>
              <LogPage />
            </Suspense>
          </PermissionGuard>
        ),
      },
      {
        path: "customer-support",
        element: (
          <PermissionGuard resource="customer-support" action="view">
            <Suspense fallback={<PageLoader />}>
              <CustomerSupportPage />
            </Suspense>
          </PermissionGuard>
        ),
      },
      {
        path: "customer-support/shifts",
        element: (
          <PermissionGuard resource="customer-support.shifts" action="view">
            <Suspense fallback={<PageLoader />}>
              <CsShiftPage />
            </Suspense>
          </PermissionGuard>
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
