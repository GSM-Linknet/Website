import type { LucideIcon } from "lucide-react";

export interface NavItem {
  title: string;
  href?: string;
  icon: LucideIcon;
  items?: NavSubItem[];
}

export interface NavSubItem {
  title: string;
  href: string;
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
