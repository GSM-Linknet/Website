import { apiClient, type ResponseData } from "./api-client";
import Cookies from "js-cookie";

export type UserRole = "SUPER_ADMIN" | "ADMIN_PUSAT" | "ADMIN_CABANG" | "ADMIN_UNIT" | "SUPERVISOR" | "SALES" | "TECHNICIAN" | "USER";

// Flattened keys for granular permissions
export type PermissionResource = 
    // Dashboard
    | "dashboard"
    // Master
    | "master.wilayah"
    | "master.area"
    | "master.unit" 
    | "master.paket" 
    | "master.diskon" 
    | "master.schedule"
    | "master.users"
    // Pelanggan
    | "pelanggan.pendaftaran" 
    | "pelanggan.kelola" 
    | "pelanggan.layanan"
    | "pelanggan.legacy" // Legacy customer management
    // Teknisi
    | "teknisi.database" 
    | "teknisi.tools" 
    | "teknisi.harga"
    // Produksi
    | "produksi.prospek" 
    | "produksi.verifikasi" 
    | "produksi.wo"
    | "produksi.cakupan"
    // Reporting
    | "reporting.sales" 
    | "reporting.sales-target"
    | "reporting.unit" 
    | "reporting.berkala"
    | "reporting.pelanggan"
    | "reporting.keuangan"
    | "reporting.produksi"
    | "reporting.expense"
    | "reporting.teknisi"
    | "reporting.master"
    | "reporting.activity"
    // Keuangan
    | "keuangan.history" 
    | "keuangan.aging" 
    | "keuangan.saldo"
    | "keuangan.invoice"
    | "keuangan.batch-payment"
    // Settings
    | "settings.permissions"
    | "settings.whatsapp"
    | "settings.system"
    // Other
    | "customer"
    | "payout";

export type AppAction = "view" | "create" | "edit" | "delete" | "verify" | "export" | "impersonate";

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar?: string;
  profile?: string;
  wilayahId?: string;
  cabangId?: string;
  unitId?: string;
  subUnitId?: string;
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
  { id: "2", name: "Admin Pusat", role: "ADMIN_PUSAT" },
  { id: "3", name: "Admin Cabang", role: "ADMIN_CABANG" },
  { id: "4", name: "Admin Unit", role: "ADMIN_UNIT" },
  { id: "5", name: "Supervisor Unit", role: "SUPERVISOR" },
  { id: "6", name: "Sales Sub Unit", role: "SALES" },
  { id: "7", name: "Teknisi Lapangan", role: "TECHNICIAN" },
];

export const PERMISSIONS: PermissionMatrix = {
  "SUPER_ADMIN": {
      // Full Access
      "dashboard": ["view", "export"],
      "master.wilayah": ["view", "create", "edit", "delete", "export"],
      "master.area": ["view", "create", "edit", "delete", "export"],
      "master.unit": ["view", "create", "edit", "delete", "export"],
      "master.paket": ["view", "create", "edit", "delete", "export"],
      "master.diskon": ["view", "create", "edit", "delete", "export"],
      "master.schedule": ["view", "create", "edit", "delete", "export"],
      "pelanggan.pendaftaran": ["view", "create", "edit", "delete", "verify", "export"],
      "pelanggan.kelola": ["view", "create", "edit", "delete", "export"],
      "pelanggan.layanan": ["view", "create", "edit", "delete"],
      "pelanggan.legacy": ["view", "create", "edit", "delete"],
      "teknisi.database": ["view", "create", "edit", "delete"],
      "teknisi.tools": ["view", "create", "edit", "delete"],
      "teknisi.harga": ["view", "create", "edit", "delete"],
      "produksi.prospek": ["view", "create", "edit", "delete"],
      "produksi.verifikasi": ["view", "create", "edit", "delete", "verify"],
      "produksi.wo": ["view", "create", "edit", "delete"],
      "reporting.sales": ["view", "export"],
      "reporting.sales-target": ["view", "create", "edit", "delete", "export"],
      "reporting.unit": ["view", "export"],
      "reporting.berkala": ["view", "export"],
      "keuangan.history": ["view", "export"],
      "keuangan.aging": ["view", "export"],
      "keuangan.saldo": ["view", "export"],
      "keuangan.invoice": ["view", "create", "edit", "delete", "export"],
      "settings.permissions": ["view", "create", "edit", "delete"],
      "settings.whatsapp": ["view", "edit"],
      "settings.system": ["view", "edit"],
      "master.users": ["impersonate"],
  },
  "ADMIN_PUSAT": {
      "dashboard": ["view"],
      "master.wilayah": ["view", "create", "edit"],
      "master.area": ["view", "create", "edit"],
      "master.unit": ["view", "create", "edit"],
      "master.paket": ["view", "create", "edit"],
      "master.diskon": ["view", "create", "edit"],
      "master.schedule": ["view", "create", "edit"],
      "pelanggan.pendaftaran": ["view", "verify", "export"],
      "pelanggan.kelola": ["view", "edit", "export"],
      "pelanggan.layanan": ["view"],
      "pelanggan.legacy": ["view", "create", "edit"],
      "teknisi.database": ["view", "create", "edit"],
      "teknisi.tools": ["view", "create", "edit"],
      "teknisi.harga": ["view", "create", "edit"],
      "produksi.prospek": ["view", "export"],
      "produksi.verifikasi": ["view", "verify"],
      "produksi.wo": ["view", "create", "edit"],
      "reporting.sales": ["view", "export"],
      "reporting.sales-target": ["view", "create", "edit", "delete", "export"],
      "reporting.unit": ["view", "export"],
      "reporting.berkala": ["view", "export"],
      "keuangan.history": ["view"],
      "keuangan.aging": ["view"],
      "keuangan.saldo": ["view"],
      "settings.permissions": ["view"],
      "settings.system": ["view", "edit"],
  },
  "ADMIN_CABANG": {
      "dashboard": ["view"],
      "master.wilayah": ["view"],
      "master.area": ["view"],
      "master.unit": ["view", "create", "edit"],
      "pelanggan.pendaftaran": ["view", "verify"],
      "pelanggan.kelola": ["view", "edit"],
      "teknisi.database": ["view"],
      "teknisi.tools": ["view"],
      "produksi.prospek": ["view"],
      "produksi.verifikasi": ["view"],
      "produksi.wo": ["view", "create", "edit"],
      "reporting.sales": ["view"],
      "reporting.sales-target": ["view", "create", "edit", "delete"],
      "reporting.unit": ["view"],
  },
  "ADMIN_UNIT": {
      "dashboard": ["view"],
      "master.unit": ["view"],
      "pelanggan.pendaftaran": ["view"],
      "pelanggan.kelola": ["view"],
      "teknisi.database": ["view"],
      "teknisi.tools": ["view"],
      "produksi.prospek": ["view"],
      "produksi.wo": ["view"],
  },
  "SUPERVISOR": {
      "dashboard": ["view"],
      "master.wilayah": ["view"],
      "master.area": ["view"],
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
      "reporting.sales-target": ["view", "create", "edit", "delete"],
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
  "TECHNICIAN": {
      "dashboard": ["view"],
      "teknisi.database": ["view"],
      "produksi.prospek": ["view"],
      "produksi.wo": ["view", "edit"],
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
      const response = await apiClient.post<ResponseData<LoginResponse>>("/auth/login", credentials);
      const { status, success, data, message } = response;
      
      if (status === false || success === false) {
        throw new Error(message || "Login failed");
      }

      const { user, accessToken, refreshToken } = data;
      
      Cookies.set("auth_token", accessToken, { expires: 1 }); // 1 day
      Cookies.set("refresh_token", refreshToken, { expires: 7 }); // 7 days
      
      // Store user role for permission checks
      const roleValue = user.role as unknown;
      const roleName = typeof roleValue === 'string' ? roleValue : (roleValue as { name?: string })?.name;
      const userProfile = { ...user, role: roleName as UserRole };

      localStorage.setItem("user_profile", JSON.stringify(userProfile));
      
      // Fetch and store permissions
      await this.initPermissions();
      
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
   * Initializes permissions by fetching from API and storing in localStorage.
   */
  async initPermissions() {
    try {
      // Use direct apiClient call to avoid circular dependencies
      const response = await apiClient.get<{ data: { items: any[] } }>("/settings/permissions/find-all", { 
        params: { paginate: false } 
      });
      const items = response.data.items;
      
      // Group permissions by role and resource
      const matrix: any = {};
      items.forEach((p: any) => {
        if (!matrix[p.role]) matrix[p.role] = {};
        if (!matrix[p.role][p.resource]) matrix[p.role][p.resource] = [];
        if (!matrix[p.role][p.resource].includes(p.action)) {
          matrix[p.role][p.resource].push(p.action);
        }
      });

      localStorage.setItem("app_permissions", JSON.stringify(matrix));
      return matrix;
    } catch (error) {
        console.error("Failed to fetch permissions", error);
        return null;
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
    localStorage.removeItem("app_permissions");
    window.location.href = "/";
  },

  /**
   * Check if a role has a specific permission for a resource.
   */
  hasPermission(role: string, resource: PermissionResource, action: AppAction): boolean {
    // Super Admin has all permissions
    if (role === "SUPER_ADMIN") return true;

    const permissionsStr = localStorage.getItem("app_permissions");
    let rolePermissions: any = null;

    if (permissionsStr) {
        try {
            const matrix = JSON.parse(permissionsStr);
            rolePermissions = matrix[role];
        } catch (e) {
            console.error("Error parsing permissions", e);
        }
    }

    // Fallback to static PERMISSIONS if not loaded yet or error
    if (!rolePermissions) {
        rolePermissions = PERMISSIONS[role as UserRole];
    }

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
  },

  /**
   * Impersonate another user (switch session without password)
   */
  async impersonate(targetUserId: string): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<{ data: LoginResponse }>(`/auth/impersonate/${targetUserId}`);
      const { user, accessToken, refreshToken } = (response as { data: LoginResponse }).data;
      
      // Backup current session if not already impersonating
      if (!Cookies.get("original_auth_token")) {
        const currentToken = Cookies.get("auth_token");
        const currentRefreshToken = Cookies.get("refresh_token");
        const currentUserProfile = localStorage.getItem("user_profile");
        const currentPermissions = localStorage.getItem("app_permissions");
        
        if (currentToken) Cookies.set("original_auth_token", currentToken, { expires: 1 });
        if (currentRefreshToken) Cookies.set("original_refresh_token", currentRefreshToken, { expires: 7 });
        if (currentUserProfile) localStorage.setItem("original_user_profile", currentUserProfile);
        if (currentPermissions) localStorage.setItem("original_app_permissions", currentPermissions);
      }

      // Clear current session
      Cookies.remove("auth_token");
      Cookies.remove("refresh_token");
      localStorage.removeItem("user_profile");
      localStorage.removeItem("app_permissions");
      
      // Set new session
      Cookies.set("auth_token", accessToken, { expires: 1 });
      Cookies.set("refresh_token", refreshToken, { expires: 7 });
      
      const roleValue = user.role as unknown;
      const roleName = typeof roleValue === 'string' ? roleValue : (roleValue as { name?: string })?.name;
      const userProfile = { ...user, role: roleName as UserRole };
      localStorage.setItem("user_profile", JSON.stringify(userProfile));
      
      // Fetch permissions for new user
      await this.initPermissions();
      
      return {
        user: userProfile,
        token: accessToken,
        accessToken,
        refreshToken,
      };
    } catch (error) {
      console.error("Impersonate failed", error);
      throw error;
    }
  },

  /**
   * Stop impersonation and restore original session
   */
  async stopImpersonation(): Promise<boolean> {
    const originalToken = Cookies.get("original_auth_token");
    const originalRefreshToken = Cookies.get("original_refresh_token");
    const originalProfile = localStorage.getItem("original_user_profile");
    const originalPermissions = localStorage.getItem("original_app_permissions");

    if (!originalToken) return false;

    // Remove current impersonation session
    Cookies.remove("auth_token");
    Cookies.remove("refresh_token");
    localStorage.removeItem("user_profile");
    localStorage.removeItem("app_permissions");

    // Restore original session
    Cookies.set("auth_token", originalToken, { expires: 1 });
    if (originalRefreshToken) Cookies.set("refresh_token", originalRefreshToken, { expires: 7 });
    if (originalProfile) localStorage.setItem("user_profile", originalProfile);
    if (originalPermissions) localStorage.setItem("app_permissions", originalPermissions);

    // Clear backup
    Cookies.remove("original_auth_token");
    Cookies.remove("original_refresh_token");
    localStorage.removeItem("original_user_profile");
    localStorage.removeItem("original_app_permissions");

    return true;
  }
};
