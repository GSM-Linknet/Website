/**
 * types/index.ts
 * Tujuan      : Definisi tipe data global untuk navigasi, statistik, pelanggan, dan komponen bersama
 * Dipakai oleh: Sidebar.tsx, navigation.ts, Dashboard, Shared components
 * Dependensi  : lucide-react (LucideIcon)
 * Fungsi utama: Tipe NavItem, NavSubItem, StatItem, Customer
 * Side effects: Tidak ada (hanya tipe TypeScript)
 */

import type { LucideIcon } from "lucide-react";

export interface NavItem {
  title: string;
  href?: string;
  icon: LucideIcon;
  items?: NavSubItem[];
  resource?: string;
  roles?: string[];
  excludeRoles?: string[];
}

export interface NavSubItem {
  title: string;
  href: string;
  resource?: string;
  roles?: string[];
  excludeRoles?: string[];
}

export interface StatItem {
  title: string;
  value: string;
  unit?: string;
  icon: LucideIcon;
  subValue?: string;
  variant?: "default" | "success" | "danger" | "warning";
}

export interface Customer {
  id: string;
  name: string;
  area: string;
  internet: string;
  sales: string;
  notes?: string;
  invoiceNo: string;
  date: string;
  type: string;
  package: string;
  period: string;
}
