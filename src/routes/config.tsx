import { lazy, Suspense } from "react";
import type { RouteObject } from "react-router-dom";
import { Navigate, Outlet } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Layout } from "@/components/shared/Layout";

// Lazy load pages
const LoginPage = lazy(() => import("@/features/auth/pages/LoginPage"));
const DashboardPage = lazy(() => import("@/features/dashboard/pages/DashboardPage"));
const CustomerListPage = lazy(() => import("@/features/customers/pages/CustomerListPage"));
const CustomerRegistrationPage = lazy(() => import("@/features/customers/pages/CustomerRegistrationPage"));
const SaldoPage = lazy(() => import("@/features/finance/pages/SaldoPage"));
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
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#F8F9FD]"><Skeleton className="w-12 h-12 rounded-full animate-spin border-4 border-blue-500 border-t-transparent bg-transparent" /></div>}>
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
                        index: true,
                        element: <Navigate to="kelola" replace />,
                    }
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
                        index: true,
                        element: <Navigate to="saldo" replace />,
                    }
                ],
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
