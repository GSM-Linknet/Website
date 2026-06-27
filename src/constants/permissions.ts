import { LayoutDashboard, Database, Users, Wrench, Factory, BarChart3, TrendingUp, Settings, DollarSign, MessageCircle } from "lucide-react";
import type { PermissionResource, AppAction } from "@/services/auth.service";

// Mapping of Parent Modules to Sub-Resources
export const MODULE_GROUPS: {
    id: string;
    label: string;
    icon: any;
    resources: { key: PermissionResource; label: string }[]
}[] = [
    {
        id: "dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
        resources: [
            { key: "dashboard", label: "Dashboard Overview" }
        ]
    },
    {
        id: "master",
        label: "Master Data",
        icon: Database,
        resources: [
            { key: "master.area", label: "Area" },
            { key: "master.wilayah", label: "Wilayah & Cabang" },
            { key: "master.unit", label: "Unit & Sub Unit" },
            { key: "master.paket", label: "Paket & Harga" },
            { key: "master.diskon", label: "Diskon" },
            { key: "master.users", label: "User Management" }
        ]
    },
    {
        id: "pelanggan",
        label: "Pelanggan",
        icon: Users,
        resources: [
            { key: "pelanggan.pendaftaran", label: "Pendaftaran Baru" },
            { key: "pelanggan.kelola", label: "Kelola Pelanggan" },
            { key: "pelanggan.layanan", label: "Layanan Mandiri" },
            { key: "pelanggan.suspend-queue", label: "Review Suspend" }
        ]
    },
    {
        id: "teknisi",
        label: "Teknisi",
        icon: Wrench,
        resources: [
            { key: "teknisi.database", label: "Database Teknisi" },
            { key: "teknisi.tools", label: "Tools & Peralatan" },
            { key: "teknisi.harga", label: "Harga Jasa (Labor)" }
        ]
    },
    {
        id: "produksi",
        label: "Produksi",
        icon: Factory,
        resources: [
            { key: "produksi.cakupan", label: "Peta Coverage" },
            { key: "master.schedule", label: "Schedule Pasang" },
            { key: "produksi.wo", label: "Work Orders (WO)" },
        ]
    },
    {
        id: "reporting",
        label: "Reporting",
        icon: BarChart3,
        resources: [
            { key: "reporting.sales", label: "Performance Sales" },
            { key: "reporting.sales-target", label: "Sales Target Management" },
            { key: "reporting.unit", label: "KA Unit Activity" },
            { key: "reporting.berkala", label: "Laporan Berkala" },
            { key: "reporting.pelanggan", label: "Laporan Pelanggan" },
            { key: "reporting.keuangan", label: "Laporan Keuangan" },
            { key: "reporting.produksi", label: "Laporan Produksi" },
            { key: "reporting.teknisi", label: "Laporan Teknisi" },
            { key: "reporting.master", label: "Laporan Master Data" },
            { key: "reporting.activity", label: "Laporan Aktivitas" },
            { key: "reporting.kpi", label: "Laporan KPI" }
        ]
    },
    {
        id: "komisi",
        label: "Komisi",
        icon: DollarSign,
        resources: [
            { key: "komisi.laporan", label: "Laporan Komisi" },
            { key: "komisi.unit-balance", label: "Saldo Unit" },
            { key: "komisi.central-balance", label: "Saldo Holding" },
            { key: "komisi.setting", label: "Pengaturan Komisi" },
        ]
    },
    {
        id: "keuangan",
        label: "Keuangan",
        icon: TrendingUp,
        resources: [
            { key: "keuangan.invoice", label: "Tagihan" },
            { key: "keuangan.payment", label: "Pending Payments" },
            { key: "keuangan.review", label: "Review Tagihan" },
            { key: "keuangan.history", label: "History Pembayaran" },
            { key: "keuangan.unallocated", label: "Dana Mengendap" },
            { key: "keuangan.batch-payment", label: "Pembayaran Batch" },
            { key: "keuangan.aging", label: "Aging Reports" },
            { key: "keuangan.saldo", label: "Saldo & Payout" },
            { key: "keuangan.rab", label: "RAB Anggaran" },
            { key: "payout", label: "Disbursement" }
        ]
    },
    {
        id: "customer-support",
        label: "Customer Support",
        icon: MessageCircle,
        resources: [
            { key: "customer-support", label: "Pesan & Layanan Pelanggan" },
            { key: "customer-support.shifts", label: "Jadwal CS" }
        ]
    },
    {
        id: "settings",
        label: "Settings",
        icon: Settings,
        resources: [
            { key: "settings.permissions", label: "Hak Akses" },
            { key: "settings.whatsapp", label: "WhatsApp Gateway" },
            { key: "settings.system", label: "System Settings" }
        ]
    },
];

export const ACTIONS: { id: AppAction; label: string }[] = [
    { id: "pay", label: "Pay" },
    { id: "view", label: "View" },
    { id: "create", label: "Add" },
    { id: "edit", label: "Edit" },
    { id: "delete", label: "Del" },
    { id: "verify", label: "Ver" },
    { id: "export", label: "Exp" },
    { id: "impersonate", label: "Imp" },
    { id: "suspend", label: "Sus" },
    { id: "approve", label: "App" },
    { id: "linknet", label: "LNet" },
];
