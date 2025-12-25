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
const PaymentHistoryPage = lazy(
  () => import("@/features/finance/pages/PaymentHistoryPage"),
);
const AgingReportsPage = lazy(
  () => import("@/features/finance/pages/AgingReportsPage"),
);
const WilayahPage = lazy(() => import("@/features/master/pages/WilayahPage"));
const CabangPage = lazy(() => import("@/features/master/pages/CabangPage"));
const UnitPage = lazy(() => import("@/features/master/pages/UnitPage"));
const SubUnitPage = lazy(() => import("@/features/master/pages/SubUnitPage"));
const PackagePricingPage = lazy(
  () => import("@/features/master/pages/PackagePricingPage"),
);
const DiscountPage = lazy(() => import("@/features/master/pages/DiscountPage"));
const UserPage = lazy(() => import("@/features/master/pages/UserPage"));
const InstallSchedulePage = lazy(
  () => import("@/features/master/pages/InstallSchedulePage"),
);
const AdminVerificationPage = lazy(
  () => import("@/features/production/pages/AdminVerificationPage"),
);
const WorkOrderPage = lazy(
  () => import("@/features/production/pages/WorkOrderPage"),
);
const PermissionPage = lazy(
  () => import("@/features/settings/pages/PermissionPage"),
);
const PeriodicReportPage = lazy(
  () => import("@/features/reporting/pages/PeriodicReportPage"),
);
const ComingSoonPage = lazy(() => import("@/pages/ComingSoonPage"));
const NotFoundPage = lazy(() => import("@/pages/NotFound"));

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
  // 1. Auth Routes (No Sidebar/Navbar)
  {
    path: "/login",
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
    path: "/",
    element: (
      <Layout>
        <Outlet />
      </Layout>
    ),
    children: [
      {
        index: true,
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
            path: "berkala",
            element: (
              <Suspense fallback={<PageLoader />}>
                <PeriodicReportPage />
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
        ],
      },
      {
        path: "keuangan",
        children: [
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
            <ComingSoonPage />
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
