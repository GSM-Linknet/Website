import { apiClient } from "./api-client";
import Cookies from "js-cookie";

export type UserRole = "SUPER_ADMIN" | "ADMIN" | "SUPERVISOR" | "SALES" | "USER";

// Flattened keys for granular permissions
export type PermissionResource = 
    // Dashboard
    | "dashboard"
    // Master
    | "master.wilayah" 
    | "master.unit" 
    | "master.paket" 
    | "master.diskon" 
    | "master.schedule"
    // Pelanggan
    | "pelanggan.pendaftaran" 
    | "pelanggan.kelola" 
    | "pelanggan.layanan"
    // Teknisi
    | "teknisi.database" 
    | "teknisi.tools" 
    | "teknisi.harga"
    // Produksi
    | "produksi.prospek" 
    | "produksi.verifikasi" 
    | "produksi.wo"
    // Reporting
    | "reporting.sales" 
    | "reporting.unit" 
    | "reporting.berkala"
    // Keuangan
    | "keuangan.history" 
    | "keuangan.aging" 
    | "keuangan.saldo"
    // Settings
    | "settings.permissions";

export type AppAction = "view" | "create" | "edit" | "delete" | "verify" | "export";

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

interface LoginResponse {
  user: User;
  token: string;
  accessToken: string;
  refreshToken: string;
}

type PermissionMatrix = {
    [key in UserRole]: {
        [key in PermissionResource]?: AppAction[];
    };
};

export const MOCK_USERS: User[] = [
  { id: "1", name: "Muhamad Fathurohman", role: "SUPER_ADMIN" },
  { id: "2", name: "Admin Pusat", role: "ADMIN" },
  { id: "3", name: "Supervisor Unit", role: "SUPERVISOR" },
  { id: "4", name: "Sales Sub Unit", role: "SALES" },
];

export const PERMISSIONS: PermissionMatrix = {
  "SUPER_ADMIN": {
      // Full Access
      "dashboard": ["view", "export"],
      "master.wilayah": ["view", "create", "edit", "delete", "export"],
      "master.unit": ["view", "create", "edit", "delete", "export"],
      "master.paket": ["view", "create", "edit", "delete", "export"],
      "master.diskon": ["view", "create", "edit", "delete", "export"],
      "master.schedule": ["view", "create", "edit", "delete", "export"],
      "pelanggan.pendaftaran": ["view", "create", "edit", "delete", "verify", "export"],
      "pelanggan.kelola": ["view", "create", "edit", "delete", "export"],
      "pelanggan.layanan": ["view", "create", "edit", "delete"],
      "teknisi.database": ["view", "create", "edit", "delete"],
      "teknisi.tools": ["view", "create", "edit", "delete"],
      "teknisi.harga": ["view", "create", "edit", "delete"],
      "produksi.prospek": ["view", "create", "edit", "delete"],
      "produksi.verifikasi": ["view", "create", "edit", "delete", "verify"],
      "produksi.wo": ["view", "create", "edit", "delete"],
      "reporting.sales": ["view", "export"],
      "reporting.unit": ["view", "export"],
      "reporting.berkala": ["view", "export"],
      "keuangan.history": ["view", "export"],
      "keuangan.aging": ["view", "export"],
      "keuangan.saldo": ["view", "export"],
      "settings.permissions": ["view", "create", "edit", "delete"],
  },
  "ADMIN": {
      "dashboard": ["view"],
      "master.wilayah": ["view", "create", "edit"],
      "master.unit": ["view", "create", "edit"],
      "master.paket": ["view", "create", "edit"],
      "master.diskon": ["view", "create", "edit"],
      "master.schedule": ["view", "create", "edit"],
      "pelanggan.pendaftaran": ["view", "verify", "export"],
      "pelanggan.kelola": ["view", "edit", "export"],
      "pelanggan.layanan": ["view"],
      "teknisi.database": ["view", "create", "edit"],
      "teknisi.tools": ["view", "create", "edit"],
      "teknisi.harga": ["view", "create", "edit"],
      "produksi.prospek": ["view", "export"],
      "produksi.verifikasi": ["view", "verify"],
      "produksi.wo": ["view", "create", "edit"],
      "reporting.sales": ["view", "export"],
      "reporting.unit": ["view", "export"],
      "reporting.berkala": ["view", "export"],
      "keuangan.history": ["view"],
      "keuangan.aging": ["view"],
      "keuangan.saldo": ["view"],
      "settings.permissions": ["view"],
  },
  "SUPERVISOR": {
      "dashboard": ["view"],
      "master.wilayah": ["view"],
      "master.unit": ["view"],
      "master.paket": ["view"],
      "master.diskon": ["view"],
      "master.schedule": ["view", "create", "edit"],
      "pelanggan.pendaftaran": ["view", "create", "verify"],
      "pelanggan.kelola": ["view", "edit"],
      "pelanggan.layanan": [],
      "teknisi.database": ["view"],
      "teknisi.tools": ["view", "create"],
      "teknisi.harga": ["view"],
      "produksi.prospek": ["view", "create"],
      "produksi.verifikasi": ["view"],
      "produksi.wo": ["view", "create", "edit"],
      "reporting.sales": ["view", "create", "edit"],
      "reporting.unit": ["view", "create", "edit"],
      "reporting.berkala": [],
      "keuangan.history": [],
      "keuangan.aging": [],
      "keuangan.saldo": [],
      "settings.permissions": [],
  },
  "SALES": {
      "dashboard": ["view"],
      "master.wilayah": [],
      "master.unit": [],
      "master.paket": [],
      "master.diskon": [],
      "master.schedule": ["view"],
      "pelanggan.pendaftaran": ["view", "create", "edit"],
      "pelanggan.kelola": [],
      "pelanggan.layanan": [],
      "teknisi.database": [],
      "teknisi.tools": [],
      "teknisi.harga": [],
      "produksi.prospek": ["view", "create"],
      "produksi.verifikasi": [],
      "produksi.wo": [],
      "reporting.sales": [],
      "reporting.unit": [],
      "reporting.berkala": [],
      "keuangan.history": [],
      "keuangan.aging": [],
      "keuangan.saldo": [],
      "settings.permissions": [],
  },
  "USER": { "dashboard": [], "master.wilayah": [], "master.unit": [], "master.paket": [], "master.diskon": [], "master.schedule": [], "pelanggan.pendaftaran": [], "pelanggan.kelola": [], "pelanggan.layanan": [], "teknisi.database": [], "teknisi.tools": [], "teknisi.harga": [], "produksi.prospek": [], "produksi.verifikasi": [], "produksi.wo": [], "reporting.sales": [], "reporting.unit": [], "reporting.berkala": [], "keuangan.history": [], "keuangan.aging": [], "keuangan.saldo": [], "settings.permissions": [] }
};

/**
 * AuthService handles all authentication related requests.
 */
export const AuthService = {
  /**
   * Simulates a user login.
   */
  async login(credentials: { email: string; password: string }): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<{ data: LoginResponse }>("/auth/login", credentials);
      const { user, accessToken, refreshToken } = (response as { data: LoginResponse }).data;
      
      Cookies.set("auth_token", accessToken, { expires: 1 }); // 1 day
      Cookies.set("refresh_token", refreshToken, { expires: 7 }); // 7 days
      
      // Store user role for permission checks
      // user.role from backend might be object or string, ensuring compatibility
      const roleValue = user.role as unknown;
      const roleName = typeof roleValue === 'string' ? roleValue : (roleValue as { name?: string })?.name;
      const userProfile = { ...user, role: roleName as UserRole };

      localStorage.setItem("user_profile", JSON.stringify(userProfile));
      
      return {
        user: userProfile,
        token: accessToken,
        accessToken,
        refreshToken,
      };
    } catch (error) {
      console.error("Login failed", error);
      throw error;
    }
  },

  /**
   * Simulates a user logout.
   */
  async logout() {
    await new Promise(resolve => setTimeout(resolve, 500));
    Cookies.remove("auth_token");
    Cookies.remove("refresh_token");
    localStorage.removeItem("user_profile");
    window.location.href = "/login";
  },

  /**
   * Check if a role has a specific permission for a resource.
   */
  hasPermission(role: string, resource: PermissionResource, action: AppAction): boolean {
    const rolePermissions = PERMISSIONS[role as UserRole];
    if (!rolePermissions) return false;
    
    const resourcePermissions = rolePermissions[resource];
    if (!resourcePermissions) return false;

    return resourcePermissions.includes(action);
  },
  
  /**
   * Get list of potential mock users for testing UI
   */
  getMockUsers() {
      return MOCK_USERS;
  },

  /**
   * Get currently logged in user from local storage
   */
  getUser(): User | null {
      const userStr = localStorage.getItem("user_profile");
      if (userStr) {
          try {
              return JSON.parse(userStr);
          } catch {
              return null;
          }
      }
      return null;
  }
};
