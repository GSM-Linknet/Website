/**
 * @file DeleteRequestsPage.tsx
 * @description Halaman persetujuan penghapusan invoice oleh finance / supervisor dengan pembatasan hak akses.
 * @caller AppRouter (/finance/delete-requests)
 * @dependencies
 *   - useDeleteRequests (../hooks/useDeleteRequests)
 *   - BaseTable (components/shared/BaseTable)
 *   - AlertDialog (components/ui/alert-dialog)
 * @functions
 *   - DeleteRequestsPage (React Component)
 * @sideEffects
 *   - Render data tabel pengajuan hapus invoice
 *   - Memicu aksi konfirmasi hapus via modal
 */
import { BaseTable } from "@/components/shared/BaseTable";
import { Button } from "@/components/ui/button";
import { useDeleteRequests } from "../hooks/useDeleteRequests";
import {
  CheckCircle,
  XCircle,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import moment from "moment";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Invoice } from "@/services/finance.service";

export default function DeleteRequestsPage() {
  const {
    data: requests,
    loading: isLoading,
    setPage,
    totalItems,
    page,
    totalPages,
    alertOpen,
    setAlertOpen,
    alertConfig,
    handleApprove,
    handleReject,
    handleConfirm,
    canApproveOrReject,
  } = useDeleteRequests();

  const columns: any[] = [
    {
      accessorKey: "invoiceNumber",
      header: "Nomor Invoice",
    },
    {
      accessorKey: "customer.name",
      header: "Pelanggan",
      cell: (invoice: any) => invoice.customer?.name || "-",
    },
    {
      accessorKey: "amount",
      header: "Total",
      cell: (invoice: any) => formatCurrency(invoice.amount),
    },
    {
      accessorKey: "deleteRequestedBy.name",
      header: "Diminta Oleh",
      cell: (invoice: any) => invoice.deleteRequestedBy?.name || "-",
    },
    {
      accessorKey: "deleteRequestReason",
      header: "Alasan",
      cell: (invoice: any) => (
        <span className="text-slate-600 line-clamp-2" title={invoice.deleteRequestReason}>
          {invoice.deleteRequestReason}
        </span>
      ),
    },
    {
      accessorKey: "deleteRequestedAt",
      header: "Waktu Pengajuan",
      cell: (invoice: any) => moment(invoice.deleteRequestedAt).format("DD MMM YYYY HH:mm"),
    },
    {
      header: "Aksi",
      hideable: true,
      cell: (invoice: Invoice) => {
        if (!canApproveOrReject) {
          return <span className="text-slate-400 text-xs italic">Hanya lihat</span>;
        }

        return (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="default"
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => handleApprove(invoice)}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Setujui
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleReject(invoice)}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Tolak
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-extrabold text-[#101D42] tracking-tight sm:text-3xl">
          Persetujuan Hapus Invoice
        </h1>
        <p className="text-sm font-medium text-slate-500 max-w-2xl leading-relaxed">
          Tinjau dan setujui pengajuan penghapusan invoice dari kasir / sales.
        </p>
      </div>

      <div className="bg-white rounded-2xl sm:rounded-[2.5rem] p-1 border border-slate-100 shadow-xl shadow-slate-200/40">
        <BaseTable
          tableId="finance-delete-requests"
          data={requests || []}
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

      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{alertConfig.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {alertConfig.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className={
                alertConfig.variant === "destructive"
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-emerald-600 hover:bg-emerald-700"
              }
            >
              Konfirmasi
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
