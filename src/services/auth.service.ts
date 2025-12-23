
export type UserRole = "Super Admin" | "Pusat" | "Unit" | "Sub Unit";

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
}

export const MOCK_USERS: User[] = [
  { id: "1", name: "Muhamad Fathurohman", role: "Super Admin" },
  { id: "2", name: "Admin Pusat", role: "Pusat" },
  { id: "3", name: "Supervisor Unit", role: "Unit" },
  { id: "4", name: "Sales Sub Unit", role: "Sub Unit" },
];

type PermissionMatrix = {
    [key in UserRole]: {
        [key in PermissionResource]?: AppAction[];
    };
};

export const PERMISSIONS: PermissionMatrix = {
  "Super Admin": {
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
  "Pusat": {
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
  "Unit": {
      "dashboard": ["view"],
      "master.wilayah": ["view"],
      "master.unit": ["view"],
      "master.paket": ["view"],
      "master.diskon": ["view"],
      "master.schedule": ["view", "create", "edit"],
      "pelanggan.pendaftaran": ["view", "create", "verify"], // Can verify local
      "pelanggan.kelola": ["view", "edit"],
      "pelanggan.layanan": [],
      "teknisi.database": ["view"],
      "teknisi.tools": ["view", "create"], // Request tools
      "teknisi.harga": ["view"],
      "produksi.prospek": ["view", "create"],
      "produksi.verifikasi": ["view"],
      "produksi.wo": ["view", "create", "edit"],
      "reporting.sales": ["view", "create", "edit"], // Submit report
      "reporting.unit": ["view", "create", "edit"],
      "reporting.berkala": [],
      "keuangan.history": [],
      "keuangan.aging": [],
      "keuangan.saldo": [],
      "settings.permissions": [],
  },
  "Sub Unit": {
      "dashboard": ["view"],
      "master.wilayah": [],
      "master.unit": [],
      "master.paket": [],
      "master.diskon": [],
      "master.schedule": ["view"],
      "pelanggan.pendaftaran": ["view", "create", "edit"], // No verify
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
};

/**
 * AuthService handles all authentication related requests.
 */
export const AuthService = {
  /**
   * Simulates a user login.
   */
  async login(credentials: any): Promise<LoginResponse> {
    console.log("Attempting login for:", credentials.email);
    
    // Simulating network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Simple mock logic to switch users based on email prefix for testing
    let user = MOCK_USERS[0]; // Default Super Admin
    
    if (credentials.email.includes("pusat")) user = MOCK_USERS[1];
    else if (credentials.email.includes("unit") && !credentials.email.includes("sub")) user = MOCK_USERS[2];
    else if (credentials.email.includes("sub")) user = MOCK_USERS[3];

    // Mock successful response
    return {
      user,
      token: "mock-jwt-token-gsm"
    };
  },

  /**
   * Simulates a user logout.
   */
  async logout() {
    await new Promise(resolve => setTimeout(resolve, 500));
    localStorage.removeItem("auth_token");
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
  }
};
