import { useState } from "react";
import { BaseTable } from "@/components/shared/BaseTable";
import { Button } from "@/components/ui/button";
import { usePayouts } from "../hooks/usePayouts";
import { Plus, Search, CheckCircle2, XCircle, Landmark, User, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CreatePayoutModal } from "../components/CreatePayoutModal";
import { formatCurrency } from "@/lib/utils";
import moment from "moment";
import { AuthService } from "@/services/auth.service";
import { XenditService } from "@/services/xendit.service";
import { useToast } from "@/hooks/useToast";

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

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            setQuery({ q: search });
        }
    };

    const handleApprove = async (id: string) => {
        try {
            await XenditService.approvePayout(id);
            toast({ title: "Berhasil", description: "Payout telah disetujui dan diproses ke Xendit." });
            refetch();
        } catch (error: any) {
            toast({
                title: "Gagal",
                description: error.response?.data?.message || "Gagal menyetujui payout",
                variant: "destructive"
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
                variant: "destructive"
            });
        }
    };

    const canApprove = currentUser?.role === "SUPER_ADMIN";

    const columns: any[] = [
        {
            accessorKey: "createdAt",
            header: "Tanggal",
            cell: (payout: any) => (
                <div className="flex flex-col">
                    <span className="font-medium text-slate-700">{moment(payout.createdAt).format("DD MMM YYYY")}</span>
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
                    <span className="text-xs font-mono font-medium text-slate-500 uppercase">{payout.externalId}</span>
                    {payout.reference && (
                        <span className="text-[9px] text-slate-400">Xendit ID: {payout.reference}</span>
                    )}
                </div>
            ),
        },
        {
            accessorKey: "bankCode",
            header: "Informasi Bank",
            cell: (payout: any) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                        <Landmark size={18} />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-slate-700 flex items-center gap-1.5">
                            {payout.bankCode?.replace("ID_", "")}
                            <Badge variant="secondary" className="text-[9px] py-0 h-4 bg-slate-100 uppercase">Bank</Badge>
                        </span>
                        <span className="text-xs text-slate-500 font-medium tracking-wide uppercase">{payout.accountName}</span>
                        <span className="text-[10px] text-slate-400 font-mono leading-none mt-0.5">{payout.accountNumber}</span>
                    </div>
                </div>
            ),
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
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Diajukan Oleh</span>
                            <span className="text-xs font-semibold text-slate-700">{payout.proposer?.name || "System"}</span>
                        </div>
                    </div>

                    <ArrowDown className="text-slate-200 ml-3" size={14} />

                    <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full border flex items-center justify-center ${payout.approver ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>
                            {payout.approver ? <CheckCircle2 size={12} className="text-emerald-500" /> : <Loader2 size={12} className="text-slate-300 animate-pulse" />}
                        </div>
                        <div className="flex flex-col leading-none">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Persetujuan</span>
                            <span className="text-xs font-semibold text-slate-700">{payout.approver?.name || "Menunggu..."}</span>
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
                        color = "bg-amber-50 text-amber-600 border-amber-100 ring-2 ring-amber-400/10";
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
                        color = "bg-emerald-50 text-emerald-600 border-emerald-100 ring-2 ring-emerald-400/10";
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
                    <Badge variant="outline" className={`px-2.5 py-1 rounded-lg border font-bold text-[10px] tracking-widest uppercase ${color}`}>
                        {label}
                    </Badge>
                );
            },
        },
        {
            id: "actions",
            header: "Aksi",
            cell: (payout: any) => {
                if (payout.status === "PROPOSED" && canApprove) {
                    return (
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 p-0 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-50 border-rose-100"
                                onClick={() => handleReject(payout.id)}
                                title="Tolak"
                            >
                                <XCircle size={16} />
                            </Button>
                            <Button
                                size="sm"
                                className="h-8 w-8 p-0 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white"
                                onClick={() => handleApprove(payout.id)}
                                title="Setujui"
                            >
                                <CheckCircle2 size={16} />
                            </Button>
                        </div>
                    );
                }
                return null;
            }
        }
    ];

    return (
        <div className="space-y-8 bg-[#F8F9FD] min-h-screen p-0 sm:p-2">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-[#101D42] tracking-tight">Disbursement</h1>
                    <p className="text-slate-500 font-medium flex items-center gap-2">
                        <Landmark size={14} className="text-blue-500" /> Manajemen Penarikan Dana & Persetujuan Berjenjang
                    </p>
                </div>

                <div className="flex gap-3 items-center">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        <input
                            type="search"
                            placeholder="Cari referensi atau nama..."
                            className="bg-white rounded-2xl border border-slate-200 pl-10 pr-4 h-12 text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 w-full md:w-80 shadow-sm transition-all"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={handleSearch}
                        />
                    </div>
                    <Button
                        onClick={() => setIsCreateOpen(true)}
                        className="bg-[#101D42] hover:bg-[#0a1329] text-white rounded-2xl h-12 px-6 font-bold shadow-xl shadow-blue-900/20 active:scale-95 transition-all"
                    >
                        <Plus className="mr-2 h-5 w-5" />
                        Ajukan Payout
                    </Button>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative">

                <BaseTable
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

            <CreatePayoutModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onSuccess={refetch}
            />
        </div>
    );
}

function ArrowDown({ className, size = 16 }: { className?: string; size?: number }) {
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
