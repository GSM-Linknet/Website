import { useState, useEffect, useRef } from "react";
import { BaseTable } from "@/components/shared/BaseTable";
import { Button } from "@/components/ui/button";
import { usePayouts } from "../hooks/usePayouts";
import {
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Landmark,
  User,
  Loader2,
  Download,
  CalendarRange,
  X,
  Smartphone,
  Wallet,
  RefreshCcw,
  AlertTriangle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CreatePayoutModal } from "../components/CreatePayoutModal";
import { cn, formatCurrency } from "@/lib/utils";
import moment from "moment";
import { AuthService } from "@/services/auth.service";
import { XenditService } from "@/services/xendit.service";
import { FinanceService } from "@/services/finance.service";
import { useToast } from "@/hooks/useToast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { commissionService } from "@/services/commission.service";
import { SystemSettingService } from "@/services/system-setting.service";

export default function PayoutPage() {
  const {
    data: payouts,
    loading: isLoading,
    refetch,
    setPage,
    totalItems,
    page,
    totalPages,
    setQuery,
  } = usePayouts();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { toast } = useToast();
  const currentUser = AuthService.getUser();

  // Date range filter
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  // Statement (Financial History) state
  const [activeTab, setActiveTab] = useState("requests");
  const [statement, setStatement] = useState<any[]>([]);
  const [statementLoading, setStatementLoading] = useState(false);
  const [totalCommission, setTotalCommission] = useState(0);
  const [totalPending, setTotalPending] = useState(0);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);

  const isFirstRender = useRef(true);
  
  // Apply date filters to the backend query when they change
  useEffect(() => {
    // Only skip on actual first mount to avoid redundant initial call
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    setQuery({
      gte: dateFrom ? `createdAt:${dateFrom}` : undefined,
      lte: dateTo ? `createdAt:${dateTo}` : undefined,
    });
  }, [dateFrom, dateTo, setQuery]);

  useEffect(() => {
    fetchSummary();
    fetchMaintenanceStatus();
    if (activeTab === "statement") {
      fetchStatement();
    }
  }, [activeTab, dateFrom, dateTo]);

  const fetchMaintenanceStatus = async () => {
    try {
      const res = await SystemSettingService.getSetting("PAYOUT_MAINTENANCE_MODE");
      if (res.data && res.data.value === "true") {
        setIsMaintenanceMode(true);
      } else {
        setIsMaintenanceMode(false);
      }
    } catch (error) {
      console.error("Failed to fetch maintenance status:", error);
    }
  };

  const fetchSummary = async () => {
    try {
      const res = await commissionService.getSummary({ personal: true });
      if (res) {
        setTotalCommission(res.totalCommission);
        setTotalPending(res.totalPending);
      }
    } catch (error) {
      console.error("Failed to fetch balance summary:", error);
    }
  };

  const fetchStatement = async () => {
    setStatementLoading(true);
    try {
      const res = await FinanceService.getCommissionStatement({ 
        personal: true,
        startDate: dateFrom,
        endDate: dateTo
      });
      if (res.data) {
        setStatement(res.data);
      }
    } catch (error: any) {
      console.error("Failed to fetch statement:", error);
      if (error?.response?.status === 403 || error?.message?.includes("izin")) {
        toast({ 
          title: "Akses Ditolak", 
          description: error?.response?.data?.message || "Anda tidak memiliki izin untuk melihat Rekening Koran.", 
          variant: "destructive" 
        });
      }
    } finally {
      setStatementLoading(false);
    }
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setQuery({ q: search });
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await XenditService.approvePayout(id);
      toast({
        title: "Berhasil",
        description: "Payout telah disetujui dan diproses ke Xendit.",
      });
      refetch();
    } catch (error: any) {
      toast({
        title: "Gagal",
        description: error.response?.data?.message || "Gagal menyetujui payout",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (id: string) => {
    try {
      await XenditService.rejectPayout(id);
      toast({ title: "Berhasil", description: "Payout telah ditolak." });
      refetch();
    } catch (error: any) {
      toast({
        title: "Gagal",
        description: error.response?.data?.message || "Gagal menolak payout",
        variant: "destructive",
      });
    }
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const response = await XenditService.exportExcel({
        q: search,
        gte: dateFrom ? `createdAt:${dateFrom}` : undefined,
        lte: dateTo ? `createdAt:${dateTo}` : undefined,
      });
      const url = window.URL.createObjectURL(new Blob([response as any]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `data-payout-${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      toast({ title: "Berhasil", description: "File Excel berhasil diunduh" });
    } catch (error) {
      toast({
        title: "Gagal",
        description: "Gagal mengunduh file Excel",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleSyncStatus = async (id: string) => {
    setSyncingId(id);
    try {
      await XenditService.syncStatus(id);
      toast({
        title: "Berhasil",
        description: "Status payout telah diperbarui dan sinkronisasi saldo berhasil.",
      });
      refetch();
      if (activeTab === "statement") fetchStatement();
      fetchSummary();
    } catch (error: any) {
      toast({
        title: "Gagal",
        description: error.response?.data?.message || "Gagal sinkronisasi status",
        variant: "destructive",
      });
    } finally {
      setSyncingId(null);
    }
  };

  const canApprove = currentUser?.role === "SUPER_ADMIN";

  const columns: any[] = [
    {
      accessorKey: "createdAt",
      header: "Tanggal",
      cell: (payout: any) => (
        <div className="flex flex-col">
          <span className="font-medium text-slate-700">
            {moment(payout.createdAt).format("DD MMM YYYY")}
          </span>
          <span className="text-[10px] text-slate-400 font-mono tracking-tight uppercase">
            {moment(payout.createdAt).format("HH:mm:ss")}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "externalId",
      header: "ID Referensi",
      cell: (payout: any) => (
        <div className="flex flex-col">
          <span className="text-xs font-mono font-medium text-slate-500 uppercase">
            {payout.externalId}
          </span>
          {payout.reference && (
            <span className="text-[9px] text-slate-400">
              Xendit ID: {payout.reference}
            </span>
          )}
        </div>
      ),
    },
    {
      accessorKey: "description",
      header: "Deskripsi",
      cell: (payout: any) => (
        <div className="flex flex-col">
          <span className="text-xs font-mono font-medium text-slate-500 uppercase">
            {payout.description}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "bankCode",
      header: "Informasi Bank",
      cell: (payout: any) => {
        const isEWallet = [
          "ID_DANA",
          "ID_OVO",
          "ID_GOPAY",
          "ID_SHOPEEPAY",
          "ID_LINKAJA",
        ].includes(payout.bankCode);
        return (
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-11 h-11 rounded-2xl border flex items-center justify-center transition-all duration-300",
                isEWallet
                  ? "bg-indigo-50 border-indigo-100 text-indigo-500 shadow-sm shadow-indigo-500/5"
                  : "bg-blue-50 border-blue-100 text-blue-600 shadow-sm shadow-blue-500/5",
              )}
            >
              {isEWallet ? <Smartphone size={18} /> : <Landmark size={18} />}
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                {payout.bankCode?.replace("ID_", "")}
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[8px] px-1.5 py-0 h-4 uppercase tracking-tighter border-none font-black",
                    isEWallet
                      ? "bg-indigo-500/10 text-indigo-600"
                      : "bg-blue-500/10 text-blue-600",
                  )}
                >
                  {isEWallet ? "E-Wallet" : "Bank"}
                </Badge>
              </span>
              <span className="text-xs text-slate-500 font-semibold tracking-wide uppercase truncate max-w-[150px]">
                {payout.accountName}
              </span>
              <span className="text-[10px] text-slate-400 font-mono leading-none mt-1 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 w-fit">
                {payout.accountNumber}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "amount",
      header: "Jumlah (IDR)",
      cell: (payout: any) => (
        <span className="font-extrabold text-slate-900 tracking-tight">
          {formatCurrency(payout.amount)}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Alur Persetujuan",
      cell: (payout: any) => (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center">
              <User size={12} className="text-blue-600" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                Diajukan Oleh
              </span>
              <span className="text-xs font-semibold text-slate-700">
                {payout.proposer?.name || "System"}
              </span>
            </div>
          </div>

          <ArrowDown className="text-slate-200 ml-3" size={14} />

          <div className="flex items-center gap-2">
            <div
              className={`w-6 h-6 rounded-full border flex items-center justify-center ${payout.approver ? "bg-emerald-50 border-emerald-100" : "bg-slate-50 border-slate-100"}`}
            >
              {payout.approver ? (
                <CheckCircle2 size={12} className="text-emerald-500" />
              ) : (
                <Loader2 size={12} className="text-slate-300 animate-pulse" />
              )}
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                Persetujuan
              </span>
              <span className="text-xs font-semibold text-slate-700">
                {payout.approver?.name || "Menunggu..."}
              </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "statusBadge",
      header: "Status Akhir",
      cell: (payout: any) => {
        const status = payout.status;
        let color = "bg-slate-100 text-slate-600 border-slate-200";
        let label = status;

        switch (status) {
          case "PROPOSED":
            color =
              "bg-amber-50 text-amber-600 border-amber-100 ring-2 ring-amber-400/10";
            label = "MENUNGGU";
            break;
          case "APPROVED":
            color = "bg-blue-50 text-blue-600 border-blue-100";
            label = "DISETUJUI";
            break;
          case "PENDING_XENDIT":
          case "PENDING":
            color = "bg-indigo-50 text-indigo-600 border-indigo-100";
            label = "PROSES XENDIT";
            break;
          case "COMPLETED":
          case "SUCCESS":
            color =
              "bg-emerald-50 text-emerald-600 border-emerald-100 ring-2 ring-emerald-400/10";
            label = "SELESAI";
            break;
          case "REJECTED":
            color = "bg-rose-50 text-rose-600 border-rose-100";
            label = "DITOLAK";
            break;
          case "FAILED":
            color = "bg-red-50 text-red-700 border-red-100";
            label = "GAGAL";
            break;
        }

        return (
          <Badge
            variant="outline"
            className={`px-2.5 py-1 rounded-lg border font-bold text-[10px] tracking-widest uppercase ${color}`}
          >
            {label}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Aksi",
      hideable: false,
      cell: (payout: any) => {
        const canSync = ['APPROVED', 'PENDING', 'PENDING_XENDIT', 'ACCEPTED', 'PROCESSED'].includes(payout.status);
        
        return (
          <div className="flex gap-2">
            {payout.status === "PROPOSED" && canApprove && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 w-8 p-0 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-50 border-rose-100"
                  onClick={() => handleReject(payout.id)}
                  title="Tolak"
                  disabled={isMaintenanceMode}
                >
                  <XCircle size={16} />
                </Button>
                <Button
                  size="sm"
                  className="h-8 w-8 p-0 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white"
                  onClick={() => handleApprove(payout.id)}
                  title="Setujui"
                  disabled={isMaintenanceMode}
                >
                  <CheckCircle2 size={16} />
                </Button>
              </>
            )}
            
            {canSync && (
              <Button
                size="sm"
                variant="outline"
                className="h-8 w-8 p-0 rounded-lg text-blue-500 hover:text-blue-600 hover:bg-blue-50 border-blue-100"
                onClick={() => handleSyncStatus(payout.id)}
                disabled={syncingId === payout.id}
                title="Sinkronisasi Status Xendit"
              >
                <RefreshCcw size={14} className={cn(syncingId === payout.id && "animate-spin")} />
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  const statementColumns = [
    {
      accessorKey: "date",
      header: "Tanggal",
      cell: (item: any) => moment(item.date).format("DD MMM YY, HH:mm"),
    },
    {
      accessorKey: "description",
      header: "Keterangan",
      className: "max-w-[250px]",
      cell: (item: any) => (
        <div className="flex flex-col">
          <span className="font-semibold text-slate-700">{item.description}</span>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
            {item.type} &bull; {item.referenceId || '-'}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "amount",
      header: "Nilai (IDR)",
      cell: (item: any) => {
        const isIncome = item.type === 'INCOME';
        return (
          <span className={`font-mono font-bold ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
            {isIncome ? '+' : '-'}{formatCurrency(item.amount)}
          </span>
        );
      },
    },
    {
      accessorKey: "balance",
      header: "Saldo (IDR)",
      className: "bg-slate-50/50",
      cell: (item: any) => {
        const isExpensePending = item.type === 'EXPENSE' && !['SUCCEEDED', 'SUCCESS', 'COMPLETED'].includes(item.status);
        return (
          <div className="flex flex-col items-end">
            <span className={cn(
              "font-mono font-black",
              isExpensePending ? "text-slate-400 italic" : "text-[#101D42]"
            )}>
              {formatCurrency(item.balance)}
            </span>
            {isExpensePending && (
              <span className="text-[8px] text-amber-500 font-bold uppercase tracking-tighter">
                Hold (Pending)
              </span>
            )}
          </div>
        );
      }
    },
  ];

  return (
    <div className="space-y-8 bg-[#F8F9FD] min-h-screen p-0 sm:p-2">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-[#101D42] tracking-tight">
            Disbursement
          </h1>
          <p className="text-slate-500 font-medium flex items-center gap-2">
            <Landmark size={14} className="text-blue-500" /> Manajemen Penarikan
            Dana & Persetujuan Berjenjang
          </p>
        </div>

        {/* Dynamic Balance Card */}
        <div className="flex bg-white border border-slate-100 rounded-3xl p-3 px-5 shadow-xl shadow-slate-200/40 items-center gap-6">
            <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Saldo Wallet Komisi</span>
                <span className="text-xl font-black text-blue-600 font-mono">{formatCurrency(totalCommission)}</span>
            </div>
            <div className="w-px h-10 bg-slate-100" />
            <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Komisi Pending</span>
                <span className="text-xl font-black text-amber-500 font-mono">{formatCurrency(totalPending)}</span>
            </div>
            <div className="p-3 bg-blue-50 rounded-2xl text-blue-600 ml-2">
                <Wallet size={24} />
            </div>
        </div>

        <div className="flex gap-3 items-center flex-wrap">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <input
              type="search"
              placeholder="Cari referensi atau nama..."
              className="bg-white rounded-2xl border border-slate-200 pl-10 pr-4 h-12 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 w-full md:w-64 shadow-sm transition-all text-slate-700"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleSearch}
            />
          </div>
          {canApprove && (
            <Button
              onClick={handleExport}
              disabled={isExporting}
              variant="outline"
              className="border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 hover:border-emerald-400 rounded-2xl font-semibold px-4 h-12 shadow-sm transition-all hover:scale-[1.02] disabled:opacity-60 text-sm"
            >
              <Download
                size={15}
                className={cn("mr-1.5", isExporting && "animate-bounce")}
              />
              {isExporting ? "Mengunduh..." : "Export"}
            </Button>
          )}
          <Button
            onClick={() => setIsCreateOpen(true)}
            disabled={isMaintenanceMode}
            className="bg-[#101D42] hover:bg-[#0a1329] text-white rounded-2xl h-12 px-6 font-bold shadow-xl shadow-blue-900/20 active:scale-95 transition-all disabled:opacity-50"
          >
            <Plus className="mr-2 h-5 w-5" />
            Ajukan Payout
          </Button>
        </div>
      </div>

      {isMaintenanceMode && (
        <div className="mx-2 bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start gap-4">
          <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
            <AlertTriangle size={20} />
          </div>
          <div className="flex-1">
            <h3 className="text-amber-800 font-bold text-sm mb-1">
              Layanan Xendit Sedang Mengalami Gangguan
            </h3>
            <p className="text-amber-700 text-xs font-medium leading-relaxed">
              Saat ini sistem penyedia layanan pembayaran (Xendit) sedang mengalami gangguan jaringan atau dalam masa pemeliharaan rutin. 
              Fitur pencairan dana (payout) dinonaktifkan sementara hingga koneksi ke layanan Xendit kembali stabil.
            </p>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-4 mx-2">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-slate-400">
            <CalendarRange size={14} />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Periode Laporan
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className={cn(
                  "h-9 px-3 w-40 rounded-xl border border-slate-200 bg-white text-sm shadow-sm transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-600",
                  dateFrom && "border-blue-500 text-blue-600 bg-blue-50/50",
                )}
              />
              {dateFrom && (
                <button
                  onClick={() => setDateFrom("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 bg-white"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            <span className="text-slate-400 text-sm font-medium">—</span>

            <div className="relative">
              <input
                type="date"
                value={dateTo}
                min={dateFrom || undefined}
                onChange={(e) => setDateTo(e.target.value)}
                className={cn(
                  "h-9 px-3 w-40 rounded-xl border border-slate-200 bg-white text-sm shadow-sm transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-600",
                  dateTo && "border-blue-500 text-blue-600 bg-blue-50/50",
                )}
              />
              {dateTo && (
                <button
                  onClick={() => setDateTo("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 bg-white"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          {(dateFrom || dateTo) && (
            <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
              {dateFrom && dateTo
                ? `${new Date(dateFrom).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })} – ${new Date(dateTo).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}`
                : dateFrom
                  ? `Dari ${new Date(dateFrom).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}`
                  : `Sampai ${new Date(dateTo).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}`}
            </span>
          )}
        </div>
      </div>

      <Tabs defaultValue="requests" className="px-2" onValueChange={setActiveTab}>
        <TabsList className="bg-white border border-slate-200 p-1 h-12 rounded-2xl shadow-sm mb-4">
          <TabsTrigger value="requests" className="px-6 rounded-xl data-[state=active]:bg-[#101D42] data-[state=active]:text-white font-bold transition-all">
            Pengajuan Payout
          </TabsTrigger>
          <TabsTrigger value="statement" className="px-6 rounded-xl data-[state=active]:bg-[#101D42] data-[state=active]:text-white font-bold transition-all">
            Mutasi Saldo (Rekening Koran)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="mt-0 space-y-4">
            <div className="bg-white rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative">
                <BaseTable
                tableId="finance-payout-requests"
                data={payouts || []}
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
        </TabsContent>

        <TabsContent value="statement" className="mt-0">
            <div className="bg-white rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative">
                <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                            <CalendarRange size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800">Riwayat Mutasi Keuangan</h3>
                            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Rekening Koran Wallet Komisi</p>
                        </div>
                    </div>
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-blue-600 font-bold text-xs hover:bg-blue-50"
                        onClick={fetchStatement}
                        disabled={statementLoading}
                    >
                        {statementLoading ? <Loader2 className="animate-spin h-3.5 w-3.5 mr-2" /> : <Loader2 size={14} className="mr-2" />}
                        Refresh Data
                    </Button>
                </div>
                <BaseTable
                    tableId="finance-payout-statement"
                    data={statement}
                    columns={statementColumns}
                    rowKey={(row) => `${row.date}-${row.amount}-${row.balance}`}
                    loading={statementLoading}
                    totalItems={statement.length}
                    page={1}
                    totalPages={1}
                    onPageChange={() => {}}
                    className="border-none shadow-none"
                />
                <div className="p-5 bg-amber-50/50 border-t border-amber-100/50">
                    <p className="text-[10px] text-amber-700 font-medium leading-relaxed italic">
                        * Catatan: Saldo (Running Balance) dihitung secara kronologis berdasarkan pendapatan komisi (PAID) dan penarikan dana (SUCCEEDED) yang sudah tervalidasi. Pengajuan yang masih berstatus pending tidak mengurangi saldo berjalan hingga transaksi berhasil.
                    </p>
                </div>
            </div>
        </TabsContent>
      </Tabs>

      <CreatePayoutModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={refetch}
      />
    </div>
  );
}

function ArrowDown({
  className,
  size = 16,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 5v14" />
      <path d="m19 12-7 7-7-7" />
    </svg>
  );
}
