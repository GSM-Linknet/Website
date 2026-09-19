/**
 * permissions-provider.tsx
 * Tujuan      : React Context & Provider untuk mengelola hak akses (permissions)
 *               yang divalidasi langsung oleh server (single source of truth in-memory).
 *               Mencegah tampering via DevTools/localStorage karena state disimpan
 *               di memori React dan diverifikasi langsung ke server backend.
 * Dipakai oleh: Layout.tsx (membungkus seluruh layout aplikasi terlindungi),
 *               Sidebar.tsx (untuk filtering menu yang valid dari server),
 *               PermissionGuard.tsx (untuk verifikasi blocking level route).
 * Dependensi  : React Context, apiClient, AuthService, permission-integrity.ts
 * Fungsi utama: PermissionsProvider, useServerPermissions
 * Side effects: HTTP GET /auth/my-permissions, navigasi /security-warning saat ada pelanggaran keamanan.
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { apiClient } from "@/services/api-client";
import { AuthService } from "@/services/auth.service";
import { getRoleFromToken } from "@/lib/permission-integrity";

interface PermissionsContextValue {
  isLoaded: boolean;
  isLoading: boolean;
  isSuperAdmin: boolean;
  permissions: Set<string>;
  hasPermission: (resource?: string, action?: string) => boolean;
  refetchPermissions: () => Promise<void>;
  reportSecurityViolation: (reason?: string) => void;
}

const PermissionsContext = createContext<PermissionsContextValue | null>(null);

interface MyPermissionsResponse {
  success: boolean;
  data: {
    role: string;
    isSuperAdmin: boolean;
    permissions: string[];
  };
}

export const PermissionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [permissions, setPermissions] = useState<Set<string>>(new Set());

  // Laporkan pelanggaran keamanan dan redirect ke halaman /security-warning
  const reportSecurityViolation = useCallback((reason = "Unspecified security violation") => {
    console.warn(`[SECURITY ALERT] ${reason}. Mengarahkan ke /security-warning.`);
    try {
      localStorage.removeItem("user_profile");
      localStorage.removeItem("app_permissions");
      localStorage.removeItem("app_permissions_signed");
    } catch {
      // ignore
    }
    window.location.href = "/security-warning";
  }, []);

  const fetchPermissions = useCallback(async () => {
    const user = AuthService.getUser();
    const jwtRole = getRoleFromToken();

    // Jika tidak ada user atau JWT token tidak valid
    if (!user || !jwtRole) {
      setIsLoaded(true);
      setIsLoading(false);
      setIsSuperAdmin(false);
      setPermissions(new Set());
      return;
    }

    try {
      setIsLoading(true);
      const res = await apiClient.get<MyPermissionsResponse>("/auth/my-permissions");
      
      if (res && res.success && res.data) {
        const { role, isSuperAdmin: superAdminFlag, permissions: serverPerms } = res.data;
        
        // Verifikasi konsistensi role: role dari backend harus cocok dengan role di JWT token
        if (role !== jwtRole) {
          reportSecurityViolation(`Role mismatch between server (${role}) and JWT (${jwtRole})`);
          return;
        }

        setIsSuperAdmin(superAdminFlag || jwtRole === "SUPER_ADMIN");
        setPermissions(new Set(serverPerms || []));
        setIsLoaded(true);
      } else {
        // Response tidak valid dari server
        setIsLoaded(true);
      }
    } catch (error: any) {
      console.error("[PermissionsProvider] Gagal memuat permission dari server:", error);
      // Jika server mengembalikan 401/403 -> token expired atau dilarang
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        reportSecurityViolation("Server authentication failed during permission verification");
        return;
      }
      setIsLoaded(true);
    } finally {
      setIsLoading(false);
    }
  }, [reportSecurityViolation]);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  // Cek apakah user memiliki izin untuk resource dan action tertentu
  const hasPermission = useCallback(
    (resource?: string, action: string = "view"): boolean => {
      // Jika resource tidak ditentukan -> boleh diakses (menu umum / tanpa batasan)
      if (!resource) return true;

      // DENY-BY-DEFAULT: Selama data server belum selesai dimuat, tolak semua akses!
      if (!isLoaded) return false;

      // SUPER_ADMIN memiliki semua izin
      if (isSuperAdmin) return true;

      // Cek variasi grant yang sah
      const exactMatch = `${resource}:${action}`;
      const manageMatch = `${resource}:manage`;
      const wildcardActionMatch = `${resource}:*`;
      const fullWildcard = "*:*";

      return (
        permissions.has(exactMatch) ||
        permissions.has(manageMatch) ||
        permissions.has(wildcardActionMatch) ||
        permissions.has(fullWildcard)
      );
    },
    [isLoaded, isSuperAdmin, permissions]
  );

  return (
    <PermissionsContext.Provider
      value={{
        isLoaded,
        isLoading,
        isSuperAdmin,
        permissions,
        hasPermission,
        refetchPermissions: fetchPermissions,
        reportSecurityViolation,
      }}
    >
      {children}
    </PermissionsContext.Provider>
  );
};

/**
 * Custom hook untuk mengakses state permission yang divalidasi oleh server.
 */
export const useServerPermissions = () => {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error("useServerPermissions must be used within a PermissionsProvider");
  }
  return context;
};
