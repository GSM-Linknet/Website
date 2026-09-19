/**
 * @file PayoutColumns.tsx
 * @description Definisi konfigurasi kolom tabel Payout (Disbursement) dan Rekening Koran (Mutasi Saldo) beserta renderers cell.
 * @caller PayoutPage.tsx
 * @dependencies lucide-react, @/components/ui/button, @/components/ui/badge, @/lib/utils, moment, @/components/shared/BaseTable
 * @exports PayoutItem, StatementItem, PayoutColumnOptions, getPayoutColumns, statementColumns
 * @sideEffects Memicu callback aksi dari baris tabel (onApprove, onReject, onSyncStatus)
 */

import {
  CheckCircle2,
  XCircle,
  Landmark,
  User,
  Loader2,
  Smartphone,
  RefreshCcw,
  ArrowDown,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, formatCurrency } from "@/lib/utils";
import moment from "moment";
import type { Column } from "@/components/shared/BaseTable";

export interface PayoutItem {
  id: string;
  createdAt: string | Date;
  externalId: string;
  reference?: string;
  description: string;
  bankCode: string;
  accountName: string;
  accountNumber: string;
  amount: number;
  status: string;
  proposer?: {
    name?: string;
    role?: string;
  };
  approver?: {
    name?: string;
    role?: string;
  };
}

export interface StatementItem {
  id?: string;
  date: string | Date;
  description: string;
  type: string;
  referenceId?: string;
  amount: number;
  balance: number;
  status?: string;
}

export interface PayoutColumnOptions {
  canApprove: boolean;
  isMaintenanceMode: boolean;
  syncingId: string | null;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onSyncStatus: (id: string) => void;
}



export function getPayoutColumns(
  options: PayoutColumnOptions,
): Column<PayoutItem>[] {
  const {
    canApprove,
    isMaintenanceMode,
    syncingId,
    onApprove,
    onReject,
    onSyncStatus,
  } = options;

  return [
    {
      accessorKey: "createdAt",
      header: "Tanggal",
      cell: (payout: PayoutItem) => (
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
      cell: (payout: PayoutItem) => (
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
      cell: (payout: PayoutItem) => (
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
      cell: (payout: PayoutItem) => {
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
      cell: (payout: PayoutItem) => (
        <span className="font-extrabold text-slate-900 tracking-tight">
          {formatCurrency(payout.amount)}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Alur Persetujuan",
      cell: (payout: PayoutItem) => (
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
              className={`w-6 h-6 rounded-full border flex items-center justify-center ${
                payout.approver
                  ? "bg-emerald-50 border-emerald-100"
                  : "bg-slate-50 border-slate-100"
              }`}
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
      cell: (payout: PayoutItem) => {
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
      accessorKey: "actions",
      header: "Aksi",
      hideable: false,
      cell: (payout: PayoutItem) => {
        const canSync = [
          "APPROVED",
          "PENDING",
          "PENDING_XENDIT",
          "ACCEPTED",
          "PROCESSED",
        ].includes(payout.status);

        return (
          <div className="flex gap-2">
            {payout.status === "PROPOSED" && canApprove && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 w-8 p-0 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-50 border-rose-100"
                  onClick={() => onReject(payout.id)}
                  title="Tolak"
                  disabled={isMaintenanceMode}
                >
                  <XCircle size={16} />
                </Button>
                <Button
                  size="sm"
                  className="h-8 w-8 p-0 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white"
                  onClick={() => onApprove(payout.id)}
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
                onClick={() => onSyncStatus(payout.id)}
                disabled={syncingId === payout.id}
                title="Sinkronisasi Status Xendit"
              >
                <RefreshCcw
                  size={14}
                  className={cn(syncingId === payout.id && "animate-spin")}
                />
              </Button>
            )}
          </div>
        );
      },
    },
  ];
}

export const statementColumns: Column<StatementItem>[] = [
  {
    accessorKey: "date",
    header: "Tanggal",
    cell: (item: StatementItem) => moment(item.date).format("DD MMM YY, HH:mm"),
  },
  {
    accessorKey: "description",
    header: "Keterangan",
    className: "max-w-[250px]",
    cell: (item: StatementItem) => (
      <div className="flex flex-col">
        <span className="font-semibold text-slate-700">{item.description}</span>
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
          {item.type} &bull; {item.referenceId || "-"}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "amount",
    header: "Nilai (IDR)",
    cell: (item: StatementItem) => {
      const isIncome = item.type === "INCOME";
      return (
        <span
          className={`font-mono font-bold ${
            isIncome ? "text-green-600" : "text-red-600"
          }`}
        >
          {isIncome ? "+" : "-"}
          {formatCurrency(item.amount)}
        </span>
      );
    },
  },
  {
    accessorKey: "balance",
    header: "Saldo (IDR)",
    className: "bg-slate-50/50",
    cell: (item: StatementItem) => {
      const isExpensePending =
        item.type === "EXPENSE" &&
        !["SUCCEEDED", "SUCCESS", "COMPLETED"].includes(item.status || "");
      return (
        <div className="flex flex-col items-end">
          <span
            className={cn(
              "font-mono font-black",
              isExpensePending ? "text-slate-400 italic" : "text-[#101D42]",
            )}
          >
            {formatCurrency(item.balance)}
          </span>
          {isExpensePending && (
            <span className="text-[8px] text-amber-500 font-bold uppercase tracking-tighter">
              Hold (Pending)
            </span>
          )}
        </div>
      );
    },
  },
];
