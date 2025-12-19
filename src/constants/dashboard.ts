import { 
  Users, 
  UserPlus, 
  Handshake, 
  BadgePercent, 
  Wallet, 
  TrendingUp, 
  FileText, 
  CheckCircle2
} from "lucide-react";

export const DASHBOARD_STATS = [
  {
    title: "Total Pelanggan",
    value: "1,158",
    icon: Users,
    trend: { value: "12%", isPositive: true, label: "vs bulan lalu" },
    color: "blue" as const,
  },
  {
    title: "Pelanggan Baru",
    value: "42",
    icon: UserPlus,
    trend: { value: "8%", isPositive: true, label: "bulan ini" },
    color: "green" as const,
  },
  {
    title: "Total Mitra",
    value: "283",
    icon: Handshake,
    trend: { value: "5%", isPositive: true, label: "vs bulan lalu" },
    color: "purple" as const,
  },
  {
    title: "Total Komisi",
    value: "Rp 7.172.529",
    icon: BadgePercent,
    trend: { value: "15%", isPositive: true, label: "vs bulan lalu" },
    color: "blue" as const,
  },
  {
    title: "Total Saldo",
    value: "Rp 36.838",
    icon: Wallet,
    trend: { value: "2%", isPositive: false, label: "penurunan" },
    color: "orange" as const,
  },
  {
    title: "Tarik Saldo",
    value: "Rp 29.848.000",
    icon: TrendingUp,
    trend: { value: "10%", isPositive: true, label: "bulan ini" },
    color: "blue" as const,
  },
  {
    title: "Total Invoice",
    value: "Rp 204.318k",
    icon: FileText,
    trend: { value: "Des 2025", isPositive: true, label: "Bulan ini" },
    color: "blue" as const,
  },
  {
    title: "Invoice Lunas",
    value: "Rp 58.680k",
    icon: CheckCircle2,
    trend: { value: "88%", isPositive: true, label: "rate" },
    color: "green" as const,
  },
];
