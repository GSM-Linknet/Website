import { 
  LayoutDashboard, 
  Users, 
  Database,
  Wrench,
  Factory,
  BarChart3,
  TrendingUp, 
  Smartphone, 
  History,
  Settings
} from "lucide-react";
import type { NavItem } from "@/types";

export const NAVIGATION_ITEMS: NavItem[] = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/",
  },
  {
    title: "Master",
    icon: Database,
    items: [
      { title: "Wilayah", href: "/master/wilayah" },
      { title: "Unit & Supervisor", href: "/master/unit" },
      { title: "Paket & Harga", href: "/master/paket" },
      { title: "Diskon", href: "/master/diskon" },
      { title: "Schedule Pasang", href: "/master/schedule" },
    ],
  },
  {
    title: "Pelanggan",
    icon: Users,
    items: [
      { title: "Pendaftaran (Sales)", href: "/pelanggan/pendaftaran" },
      { title: "Kelola Pelanggan", href: "/pelanggan/kelola" },
      { title: "Layanan Mandiri", href: "/pelanggan/layanan" },
    ],
  },
  {
    title: "Teknisi",
    icon: Wrench,
    items: [
      { title: "Database Teknisi", href: "/teknisi/database" },
      { title: "Tools & Peralatan", href: "/teknisi/tools" },
      { title: "Harga Jasa (Labor)", href: "/teknisi/harga-jasa" },
    ],
  },
  {
    title: "Produksi",
    icon: Factory,
    items: [
      { title: "Input Prospek", href: "/produksi/prospek" },
      { title: "Verifikasi Admin", href: "/produksi/verifikasi" },
      { title: "Work Orders (WO)", href: "/produksi/wo" },
    ],
  },
  {
    title: "Reporting",
    icon: BarChart3,
    items: [
      { title: "Performance Sales", href: "/reporting/sales" },
      { title: "KA Unit Activity", href: "/reporting/unit" },
      { title: "Laporan Berkala", href: "/reporting/berkala" },
    ],
  },
  {
    title: "Keuangan",
    icon: TrendingUp,
    items: [
      { title: "History Pembayaran", href: "/keuangan/history" },
      { title: "Aging Reports", href: "/keuangan/aging" },
      { title: "Saldo & Payout", href: "/keuangan/saldo" },
    ],
  },
  {
    title: "Settings",
    icon: Settings,
    items: [
      { title: "Hak Akses", href: "/settings/permissions" },
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
