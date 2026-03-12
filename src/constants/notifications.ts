export const NOTIFICATION_TYPES = {
  // Customer Focused
  BILLING_DIRECT: {
    label: "Tagihan & Pembayaran",
    description: "Kirim tagihan dan bukti bayar langsung ke nomor saya",
    category: "CUSTOMER"
  },
  NETWORK_UPDATE: {
    label: "Update Jaringan",
    description: "Informasi aktivasi, isolir, dan pemeliharaan rutin",
    category: "CUSTOMER"
  },
  WORK_ORDER_UPDATE: {
    label: "Update Layanan",
    description: "Jadwal kunjungan teknisi and status pengaktifan",
    category: "CUSTOMER"
  },

  // Staff Focused
  CUSTOMER_BILLING_ALERT: {
    label: "Alert Penagihan Pelanggan",
    description: "Notifikasi saat pelanggan di jaringan saya membayar atau jatuh tempo",
    category: "STAFF"
  },
  CUSTOMER_NETWORK_ALERT: {
    label: "Alert Jaringan Pelanggan",
    description: "Notifikasi jika pelanggan di jaringan saya mengalami gangguan atau isolir",
    category: "STAFF"
  },
  WORK_ORDER_ASSIGNMENT: {
    label: "Penugasan WO",
    description: "Notifikasi penugasan Work Order baru",
    category: "STAFF"
  },
  ACCOUNT_ALERT: {
    label: "Alert Akun & Keamanan",
    description: "Notifikasi terkait login dan keamanan akun",
    category: "STAFF"
  }
};

export type NotificationType = keyof typeof NOTIFICATION_TYPES;
