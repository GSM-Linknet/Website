/**
 * PermissionGuard.tsx
 * Tujuan      : Route-level permission guard dengan validasi server-side BLOCKING.
 *               Mencegah rendering halaman sama sekali jika user tidak memiliki izin sah dari server.
 *               Jika ada indikasi manipulasi sesi atau pelanggaran akses, user diarahkan ke /security-warning.
 * Dipakai oleh: routes/config.tsx (membungkus seluruh protected page yang membutuhkan permission)
 * Dependensi  : useServerPermissions (PermissionsProvider), AuthService, Skeleton, Navigate
 * Fungsi utama: PermissionGuard (React component)
 * Side effects:
 *   - Menampilkan loading skeleton selama izin server divalidasi
 *   - Jika tidak memiliki izin atau terjadi pelanggaran keamanan -> redirect ke /security-warning
 */

import { useEffect, useState, type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { AuthService, type PermissionResource, type AppAction } from "@/services/auth.service";
import { useServerPermissions } from "@/providers/permissions-provider";
import { Skeleton } from "@/components/ui/skeleton";

interface PermissionGuardProps {
  resource: PermissionResource;
  action?: AppAction;
  children: ReactNode;
}

type GuardStatus = "checking" | "allowed" | "denied";

export const PermissionGuard = ({
  resource,
  action = "view",
  children,
}: PermissionGuardProps) => {
  const { isLoaded, hasPermission, reportSecurityViolation } = useServerPermissions();
  const [status, setStatus] = useState<GuardStatus>("checking");

  useEffect(() => {
    // Tunggu sampai permission dari server selesai dimuat
    if (!isLoaded) {
      return;
    }

    const user = AuthService.getUser();
    if (!user) {
      setStatus("denied");
      return;
    }

    // Validasi hak akses langsung terhadap in-memory state server
    const allowed = hasPermission(resource, action);
    if (!allowed) {
      console.warn(
        `[PermissionGuard] Server permission denied for resource: ${resource}, action: ${action}. Mengarahkan ke /security-warning.`
      );
      setStatus("denied");
      reportSecurityViolation(
        `Akses tidak sah ke resource "${resource}" (action: "${action}") oleh user ${user.name}`
      );
      return;
    }

    setStatus("allowed");
  }, [isLoaded, resource, action, hasPermission, reportSecurityViolation]);

  // Jika tidak terautentikasi dan pengecekan selesai
  const user = AuthService.getUser();
  if (!user && isLoaded && status === "denied") {
    return <Navigate to="/" replace />;
  }

  // BLOCKING: Selama permission server belum dimuat atau status masih checking,
  // jangan render halaman sensitif sama sekali!
  if (!isLoaded || status === "checking") {
    return (
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
  }

  // Denied: Kembalikan null (redirect ke /security-warning sedang dieksekusi)
  if (status === "denied") {
    return null;
  }

  // Allowed: Render konten halaman yang aman
  return <>{children}</>;
};

export default PermissionGuard;
