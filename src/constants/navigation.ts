import { 
  LayoutDashboard, 
  Users, 
  PieChart, 
  UserCheck, 
  TrendingUp, 
  Smartphone, 
  History 
} from "lucide-react";
import type { NavItem } from "@/types";

export const NAVIGATION_ITEMS: NavItem[] = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/",
  },
  {
    title: "Pelanggan",
    icon: Users,
    items: [
      { title: "Pendaftaran Pelanggan", href: "/pelanggan/pendaftaran" },
      { title: "Kelola Pelanggan", href: "/pelanggan/kelola" },
    ],
  },
  {
    title: "Mitra",
    icon: PieChart,
    items: [
      { title: "Pendaftaran Mitra", href: "/mitra/pendaftaran" },
    ],
  },
  {
    title: "Pengguna",
    icon: UserCheck,
    items: [
      { title: "Admin", href: "/pengguna/admin" },
      { title: "Unit", href: "/pengguna/unit" },
      { title: "Supervisor", href: "/pengguna/supervisor" },
      { title: "Sales", href: "/pengguna/sales" },
      { title: "Mitra A", href: "/pengguna/mitra-a" },
      { title: "Mitra B", href: "/pengguna/mitra-b" },
    ],
  },
  {
    title: "Keuangan",
    icon: TrendingUp,
    items: [
      { title: "Monitoring Pembayaran", href: "/keuangan/pembayaran" },
      { title: "Pengajuan Penarikan", href: "/keuangan/penarikan" },
      { title: "Saldo Pengguna", href: "/keuangan/saldo" },
      { title: "Payout", href: "/keuangan/payout" },
      { title: "Cashflow", href: "/keuangan/cashflow" },
    ],
  },
  {
    title: "Aplikasi",
    icon: Smartphone,
    href: "/aplikasi",
  },
  {
    title: "Logs",
    icon: History,
    href: "/logs",
  },
];
