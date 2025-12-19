export interface Technician {
    id: string;
    name: string;
    region: string;
    residence: string;
    status: "Active" | "Inactive";
}

export const TECHNICIANS: Technician[] = [
    { id: "1", name: "Ahmad Teknisi", region: "TNJG", residence: "Tanjung", status: "Active" },
    { id: "2", name: "Budi Jaringan", region: "BMY", residence: "Banyumas", status: "Active" },
    { id: "3", name: "Citra Fiber", region: "PGY", residence: "Paguyangan", status: "Active" },
];

export interface LaborRate {
    id: string;
    serviceName: string;
    category: "Visit" | "Cable" | "Infrastructure";
    price: number;
}

export const LABOR_RATES: LaborRate[] = [
    { id: "1", serviceName: "Visit & Troubleshooting (ODP to Pelanggan)", category: "Visit", price: 50000 },
    { id: "2", serviceName: "Penarikan Jalur Kabel Distribusi", category: "Cable", price: 2000 },
    { id: "3", serviceName: "Pemasangan Tiang", category: "Infrastructure", price: 150000 },
    { id: "4", serviceName: "Pemasangan ODP", category: "Infrastructure", price: 100000 },
];

export interface Region {
    id: string;
    code: string;
    name: string;
    manager: string;
}

export const REGIONS: Region[] = [
    { id: "1", code: "TNJG", name: "Tanjung", manager: "Ahmad S." },
    { id: "2", code: "BMY", name: "Banyumas", manager: "Budi H." },
    { id: "3", code: "PGY", name: "Paguyangan", manager: "Citra W." },
];

export interface Unit {
    id: string;
    name: string;
    supervisor: string;
    region: string;
}

export const UNITS: Unit[] = [
    { id: "1", name: "Unit A1", supervisor: "Dedi Suprapto", region: "TNJG" },
    { id: "2", name: "Unit B2", supervisor: "Eko Prasetyo", region: "BMY" },
];

export interface Package {
    id: string;
    name: string;
    speed: string;
    price: number;
    description: string;
}

export const PACKAGES: Package[] = [
    { id: "1", name: "Hemat 10", speed: "10 Mbps", price: 150000, description: "Paket ekonomis untuk kebutuhan dasar" },
    { id: "2", name: "Standard 20", speed: "20 Mbps", price: 250000, description: "Paket ideal untuk keluarga" },
    { id: "3", name: "Fast 50", speed: "50 Mbps", price: 450000, description: "Paket cepat untuk bisnis/streaming" },
];

export interface Discount {
    id: string;
    name: string;
    type: "Percentage" | "Fixed";
    value: number;
    status: "Active" | "Expired";
}

export const DISCOUNTS: Discount[] = [
    { id: "1", name: "Promo Akhir Tahun", type: "Percentage", value: 10, status: "Active" },
    { id: "2", name: "Diskon Instalasi", type: "Fixed", value: 50000, status: "Active" },
];
