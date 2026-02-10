import {
  LayoutDashboard,
  Users,
  Database,
  Wrench,
  Factory,
  BarChart3,
  TrendingUp,
  History,
  Settings,
} from "lucide-react";
import type { NavItem } from "@/types";

export const NAVIGATION_ITEMS: NavItem[] = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
    resource: "dashboard",
  },
  {
    title: "Master",
    icon: Database,
    resource: "master",
    items: [
      { title: "Area", href: "/master/area", resource: "master.area" },
      { title: "Wilayah", href: "/master/wilayah", resource: "master.wilayah" },
      { title: "Cabang", href: "/master/cabang", resource: "master.wilayah" }, // Maps to wilayah for simplicity or keep as is
      { title: "Unit", href: "/master/unit", resource: "master.unit" },
      { title: "Sub Unit", href: "/master/sub-unit", resource: "master.unit" },
      {
        title: "Paket & Harga",
        href: "/master/paket",
        resource: "master.paket",
      },
      // { title: "Diskon", href: "/master/diskon", resource: "master.diskon" },
      { title: "Users", href: "/master/users", resource: "master.users" },
    ],
  },
  {
    title: "Pelanggan",
    icon: Users,
    resource: "pelanggan",
    items: [
      {
        title: "Pendaftaran Baru",
        href: "/pelanggan/pendaftaran",
        resource: "pelanggan.pendaftaran",
      },
      {
        title: "Kelola Pelanggan",
        href: "/pelanggan/kelola",
        resource: "pelanggan.kelola",
      },
      // { title: "Layanan Mandiri", href: "/pelanggan/layanan", resource: "pelanggan.layanan" },
    ],
  },
  {
    title: "Teknisi",
    icon: Wrench,
    resource: "teknisi",
    items: [
      {
        title: "Database Teknisi",
        href: "/teknisi/database",
        resource: "teknisi.database",
      },
      {
        title: "Tools & Peralatan",
        href: "/teknisi/tools",
        resource: "teknisi.tools",
      },
      {
        title: "Harga Jasa (Labor)",
        href: "/teknisi/harga-jasa",
        resource: "teknisi.harga",
      },
    ],
  },
  {
    title: "Produksi",
    icon: Factory,
    resource: "produksi",
    items: [
      {
        title: "Sales Target",
        href: "/reporting/sales-target",
        resource: "reporting.sales-target",
      },
      // { title: "Input Prospek", href: "/produksi/prospek", resource: "produksi.prospek" },
      {
        title: "Peta Coverage",
        href: "/produksi/coverage-map",
        resource: "produksi.cakupan",
      },
      // { title: "Verifikasi Admin", href: "/produksi/verifikasi", resource: "produksi.verifikasi" },
      {
        title: "Schedule Pasang",
        href: "/master/schedule",
        resource: "master.schedule",
      },
      {
        title: "Work Orders (WO)",
        href: "/produksi/wo",
        resource: "produksi.wo",
      },
    ],
  },
  {
    title: "Reporting",
    icon: BarChart3,
    resource: "reporting",
    items: [
      {
        title: "Laporan Pelanggan",
        href: "/reporting/customers",
        resource: "reporting.pelanggan",
      },
      {
        title: "Laporan Keuangan",
        href: "/reporting/financial",
        resource: "reporting.keuangan",
      },
      {
        title: "Laporan Komisi",
        href: "/keuangan/commission",
        resource: "keuangan.invoice",
      }, // Using invoice permission for now
      {
        title: "Laporan Produksi",
        href: "/reporting/production",
        resource: "reporting.produksi",
      },
      {
        title: "Expense Usage",
        href: "/reporting/expense-usage",
        resource: "reporting.expense",
      },
      {
        title: "Sales Target",
        href: "/reporting/sales-target",
        resource: "reporting.sales-target",
      },
      {
        title: "KA Unit Activity",
        href: "/reporting/unit",
        resource: "reporting.unit",
      },
    ],
  },
  {
    title: "Keuangan",
    icon: TrendingUp,
    resource: "keuangan",
    items: [
      {
        title: "Tagihan",
        href: "/keuangan/invoice",
        resource: "keuangan.invoice",
      },
      {
        title: "History Pembayaran",
        href: "/keuangan/history",
        resource: "keuangan.history",
      },
      {
        title: "Pembayaran Batch",
        href: "/keuangan/batch-payment",
        resource: "keuangan.batch-payment",
      },
      {
        title: "Revenue Share",
        href: "/keuangan/revenue-share",
        resource: "keuangan.revenue-share",
      },
      {
        title: "Pengeluaran Unit",
        href: "/keuangan/unit-expense",
        resource: "keuangan.unit-expense",
      },
      {
        title: "Saldo Unit",
        href: "/keuangan/unit-balance",
        resource: "keuangan.unit-balance",
      },
      {
        title: "Jurnal Harian",
        href: "/keuangan/daily-journal",
        resource: "keuangan.daily-journal",
      },
      {
        title: "Saldo Xendit",
        href: "/keuangan/saldo",
        resource: "keuangan.saldo",
      },
      { title: "Disbursement", href: "/keuangan/payout", resource: "payout" },
    ],
  },
  {
    title: "Settings",
    icon: Settings,
    resource: "settings",
    items: [
      {
        title: "Hak Akses",
        href: "/settings/permissions",
        resource: "settings.permissions",
      },
      {
        title: "WhatsApp Gateway",
        href: "/settings/whatsapp",
        resource: "settings.whatsapp",
      },
      {
        title: "Monitor WA",
        href: "/settings/whatsapp-monitor",
        resource: "settings.whatsapp",
      },
      {
        title: "Template WhatsApp",
        href: "/settings/templates",
        resource: "pengaturan.template",
      },
      {
        title: "Pengaturan Komisi",
        href: "/settings/commission",
        resource: "settings.system",
      },
    ],
  },

  {
    title: "Logs",
    icon: History,
    href: "/logs",
    resource: "dashboard",
  },
];
