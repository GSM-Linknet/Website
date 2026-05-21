/**
 * features/customers/pages/LinkNetPage.tsx
 * Tujuan      : Halaman manajemen layanan Linknet berbasis pelanggan.
 * Dipakai oleh: Router `/pelanggan/layanan`
 * Dependensi  : LinknetServiceTable, LinknetActionModals, useCustomers
 * Fungsi Utama: Menampilkan daftar pelanggan Linknet dan memfasilitasi aksi operasional (ganti paket, ganti perangkat, dismantle, buat tiket, dan status tiket).
 * Side Effect : Membaca data pelanggan (HTTP GET `/customers`), memicu aksi layanan via modal (HTTP POST/PATCH).
 */

import { useState } from "react";
import { Search, LayoutGrid, ListFilter, Activity } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useCustomers } from "../hooks/useCustomers";
import { LinknetServiceTable } from "@/features/customers/components/LinknetServiceTable";
import { useDebounce } from "@/hooks/useDebounce";
import { 
  ChangeServiceModal, 
  DisconnectModal, 
  TicketStatusModal, 
  ChangeDeviceModal 
} from "../components/LinknetActionModals";
import type { Customer } from "@/services/customer.service";
import { cn } from "@/lib/utils";

export default function LinkNetPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);

  // Hook customers khusus yang sudah di pipeline linknet
  const {
    data: customers,
    loading,
    totalItems,
    page,
    totalPages,
    setPage,
    setQuery,
  } = useCustomers({ linknetPipeline: 'done' });

  // Filter query effect
  useState(() => {
    setQuery({ search: debouncedSearch || undefined, linknetPipeline: 'done' });
  });

  // State Modals
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const handleAction = (action: string, customer: Customer) => {
    setSelectedCustomer(customer);
    setActiveModal(action);
  };

  const closeModals = () => {
    setActiveModal(null);
    setSelectedCustomer(null);
  };

  return (
    <div className="p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-brand-blue tracking-tight sm:text-3xl flex items-center gap-2">
            <Activity className="text-blue-500" />
            Layanan Link Net
          </h1>
          <p className="text-sm font-medium text-slate-500 leading-relaxed">
            Kelola operasional pelanggan Linknet: Service Order, Tiket Gangguan, dan Perangkat.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
            <Input
              placeholder="Cari nama atau LN ID..."
              className="pl-9 w-64 rounded-xl bg-white border-slate-200 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ── Dashboard Stats (Simple) ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Total Pelanggan LN" value={totalItems.toString()} color="blue" icon={LayoutGrid} />
        <StatCard label="Pipeline Selesai" value={customers.length.toString()} color="emerald" icon={ListFilter} />
        <StatCard label="Status Layanan" value="Aktif" color="indigo" icon={Activity} />
      </div>

      {/* ── Main Table ── */}
      <Card className="rounded-4xl border-slate-100 shadow-xl shadow-slate-200/40 p-2 overflow-hidden bg-white">
        <LinknetServiceTable
          customers={customers}
          loading={loading}
          page={page}
          totalPages={totalPages}
          totalItems={totalItems}
          onPageChange={setPage}
          onAction={handleAction}
        />
      </Card>

      {/* ── Modals ── */}
      {selectedCustomer && (
        <>
          <ChangeServiceModal 
            customer={selectedCustomer} 
            isOpen={activeModal === "change_service"} 
            onClose={closeModals} 
          />
           <DisconnectModal 
            customer={selectedCustomer} 
            isOpen={activeModal === "disconnect"} 
            onClose={closeModals} 
          />
          <ChangeDeviceModal 
            customer={selectedCustomer} 
            isOpen={activeModal === "change_device"} 
            onClose={closeModals} 
          />
          <TicketStatusModal 
            customer={selectedCustomer} 
            isOpen={activeModal === "ticket_status" || activeModal === "create_ticket"} 
            defaultTab={activeModal === "create_ticket" ? "create" : "check"}
            onClose={closeModals} 
          />
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, color, icon: Icon }: any) {
  const colors: any = {
    blue: "text-blue-600 bg-blue-50 border-blue-100",
    emerald: "text-emerald-600 bg-emerald-50 border-emerald-100",
    indigo: "text-indigo-600 bg-indigo-50 border-indigo-100",
  };

  return (
    <div className={cn("p-5 rounded-2xl border flex items-center justify-between shadow-sm bg-white hover:shadow-md transition-shadow", colors[color])}>
      <div>
        <p className="text-xs font-bold uppercase tracking-wider opacity-70 mb-1">{label}</p>
        <p className="text-2xl font-black">{value}</p>
      </div>
      <div className={cn("p-3 rounded-xl", colors[color])}>
        <Icon size={24} />
      </div>
    </div>
  );
}
