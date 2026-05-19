import { useState, useMemo } from "react";
import { BaseTable } from "@/components/shared/BaseTable";
import { Button } from "@/components/ui/button";
import { useInvoices } from "../hooks/useInvoices";
import {
  Receipt,
  Search,
  CheckCircle2,
  Wallet2,
  Clock,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import moment from "moment";
import { useDebounce } from "@/hooks/useDebounce";
import { CreateBatchPaymentModal } from "../components/CreateBatchPaymentModal";
import { useBatchPayments } from "../hooks/useBatchPayments";

export default function ReviewUnitPaymentPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<string[]>([]);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);

  const {
    data: invoices,
    loading: isLoading,
    refetch,
    setPage,
    totalItems,
    page,
    totalPages,
  } = useInvoices({
    where: "isReportedPaid:true",
    search: debouncedSearchQuery ? `customer.name:${debouncedSearchQuery}` : undefined,
  });

  // Get quota info from useBatchPayments (same as BatchPaymentPage)
  const { data: batchPayments } = useBatchPayments();
  const quotaInfo = batchPayments?.[0]?.unit || batchPayments?.[0]?.subUnit;
  const expenseQuota = quotaInfo?.expenseQuota || 0;
  const expenseQuotaUsed = quotaInfo?.expenseQuotaUsed || 0;
  const quotaAvailable = Math.max(0, expenseQuota - expenseQuotaUsed);

  const selectedInvoices = useMemo(() => {
    return (invoices || []).filter((inv) => selectedInvoiceIds.includes(inv.id));
  }, [invoices, selectedInvoiceIds]);

  const totalAmount = useMemo(() => {
    return selectedInvoices.reduce((sum, inv) => sum + inv.amount, 0);
  }, [selectedInvoices]);

  const uniqueCustomerIds = useMemo(() => {
    const ids = new Set(selectedInvoices.map((inv) => inv.customer?.id).filter(Boolean));
    return Array.from(ids) as string[];
  }, [selectedInvoices]);

  const toggleSelect = (id: string) => {
    setSelectedInvoiceIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedInvoiceIds.length === (invoices?.length || 0)) {
      setSelectedInvoiceIds([]);
    } else {
      setSelectedInvoiceIds((invoices || []).map((inv) => inv.id));
    }
  };

  const columns = [
    {
      id: "select",
      accessorKey: "id",
      hideable: false,
      header: (
        <input
          type="checkbox"
          className="rounded border-slate-300"
          checked={!!invoices?.length && selectedInvoiceIds.length === invoices.length}
          onChange={toggleSelectAll}
        />
      ),
      cell: (invoice: any) => (
        <input
          type="checkbox"
          className="rounded border-slate-300"
          checked={selectedInvoiceIds.includes(invoice.id)}
          onChange={() => toggleSelect(invoice.id)}
        />
      ),
    },
    {
      accessorKey: "invoiceNumber",
      header: "Nomor Invoice",
      cell: (invoice: any) => (
        <div className="flex flex-col">
          <span className="font-bold text-[#101D42]">{invoice.invoiceNumber}</span>
          <span className="text-[10px] text-slate-400 font-mono">
            {moment(invoice.createdAt).format("DD/MM/YYYY")}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "customer.name",
      header: "Pelanggan",
      cell: (invoice: any) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
            <User size={14} />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-slate-700">
              {invoice.customer?.name || "-"}
            </span>
            <span className="text-[10px] text-slate-400">
              {invoice.customer?.customerId || "-"}
            </span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "reportedPaidAt",
      header: "Dilaporkan Pada",
      cell: (invoice: any) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-blue-600">
            <Clock size={12} />
            <span className="text-xs font-medium">
              {moment(invoice.reportedPaidAt).format("DD MMM YYYY, HH:mm")}
            </span>
          </div>
          <span className="text-[10px] text-slate-400">
            Oleh: {invoice.reportedPaidBy?.name || "Admin Unit"}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "amount",
      header: "Nominal",
      cell: (invoice: any) => (
        <span className="font-bold text-slate-700">{formatCurrency(invoice.amount)}</span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status Perlindungan",
      cell: () => (
        <Badge className="bg-emerald-100 text-emerald-700 border-none shadow-sm">
          TERLINDUNGI (SUDAH BAYAR)
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <h1 className="text-2xl font-extrabold text-[#101D42] tracking-tight sm:text-3xl">
            Review Report Invoice
          </h1>
          <p className="text-sm font-medium text-slate-500 max-w-2xl leading-relaxed">
            Daftar tagihan yang telah dilaporkan "Sudah Bayar" oleh unit. Tagihan ini terlindungi dari isolir otomatis hingga dibayar kolektif.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
          <div className="relative group w-full sm:w-auto">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors"
              size={18}
            />
            <Input
              placeholder="Cari pelanggan..."
              className="pl-10 w-full sm:w-72 rounded-xl bg-white border-slate-200 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            onClick={() => setIsBatchModalOpen(true)}
            disabled={selectedInvoiceIds.length === 0}
            className="bg-[#101D42] hover:bg-[#1a2b5e] text-white rounded-xl font-bold shadow-lg transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:scale-100 w-full sm:w-auto"
          >
            <Receipt className="mr-2 h-4 w-4" />
            Bayar Kolektif ({selectedInvoiceIds.length})
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-blue-50 text-blue-600">
              <Receipt size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Invoices Terpilih</p>
              <h3 className="text-xl font-black text-[#101D42]">{selectedInvoiceIds.length} <span className="text-slate-400 text-sm font-bold tracking-tight">Terlapor</span></h3>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
              <Wallet2 size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Nominal</p>
              <h3 className="text-xl font-black text-[#101D42]">{formatCurrency(totalAmount)}</h3>
            </div>
          </div>
        </div>

        <div className="bg-[#101D42] rounded-3xl p-6 shadow-lg shadow-blue-900/10">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-white/10 text-white">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-white/50 uppercase tracking-widest">Quota Unit Tersedia</p>
              <h3 className="text-xl font-black text-white">{formatCurrency(quotaAvailable)}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="bg-white rounded-[2.5rem] p-1 border border-slate-100 shadow-xl shadow-slate-200/40">
        <BaseTable
          tableId="finance-review-unit-payment"
          data={invoices || []}
          columns={columns}
          rowKey={(row) => row.id}
          loading={isLoading}
          totalItems={totalItems || 0}
          page={page || 1}
          totalPages={totalPages || 1}
          onPageChange={setPage}
          className="border-none shadow-none"
        />
      </div>

      {isBatchModalOpen && (
        <CreateBatchPaymentModal
          isOpen={isBatchModalOpen}
          onClose={() => setIsBatchModalOpen(false)}
          onSuccess={() => {
            refetch();
            setSelectedInvoiceIds([]);
            setIsBatchModalOpen(false);
          }}
          initialSelectedCustomers={uniqueCustomerIds}
        />
      )}
    </div>
  );
}
