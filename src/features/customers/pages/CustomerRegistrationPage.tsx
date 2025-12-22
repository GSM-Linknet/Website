import { useState } from "react";
import { Search, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RegistrationTable } from "../components/RegistrationTable";
import { AddCustomerDialog } from "../components/AddCustomerDialog";
import { REGISTRATIONS } from "@/constants/registrations";

/**
 * CustomerRegistrationPage matches the high-fidelity design for registration management.
 */
export default function CustomerRegistrationPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <h1 className="text-2xl font-extrabold text-[#101D42] tracking-tight sm:text-3xl">
            Pendaftaran Pelanggan
          </h1>
          <p className="text-sm font-medium text-slate-500 max-w-2xl leading-relaxed">
            Pendaftaran pelanggan yang diajukan oleh mitra
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative group">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"
              size={18}
            />
            <Input
              placeholder="Cari"
              className="pl-10 w-64 md:w-72 rounded-xl bg-white border-slate-200 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <AddCustomerDialog />
        </div>
      </div>

      {/* Filters Section */}
      <div className="flex flex-wrap items-center gap-3">
        <FilterDropdown label="Semua Status" />
        <FilterDropdown label="Semua Pembayaran" />
        <FilterDropdown label="Semua Internet" />
      </div>

      {/* Table Content */}
      <div className="bg-white rounded-[2.5rem] p-1 border border-slate-100 shadow-xl shadow-slate-200/40">
        <RegistrationTable registrations={REGISTRATIONS} />
      </div>
    </div>
  );
}

const FilterDropdown = ({ label }: { label: string }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button
        variant="outline"
        className="h-11 rounded-xl border-slate-200 bg-white text-slate-500 font-medium px-4 hover:bg-slate-50 hover:text-slate-700 transition-all justify-between min-w-[200px] border shadow-sm"
      >
        <span>{label}</span>
        <ChevronDown size={14} className="text-slate-400" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent className="w-[200px] rounded-xl border-slate-100 p-1 shadow-xl bg-white">
      <DropdownMenuItem className="rounded-lg cursor-pointer text-sm font-medium py-2.5 text-slate-700">
        Opsi 1
      </DropdownMenuItem>
      <DropdownMenuItem className="rounded-lg cursor-pointer text-sm font-medium py-2.5 text-slate-700">
        Opsi 2
      </DropdownMenuItem>
      <DropdownMenuItem className="rounded-lg cursor-pointer text-sm font-medium py-2.5 text-slate-700">
        Opsi 3
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);
