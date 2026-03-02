import { useState } from "react";
import { Trash2, RotateCcw, RefreshCw } from "lucide-react";
import { DeletedCustomerService } from "@/services/suspend-queue.service";
import { DeletedCustomerTable } from "../components/DeletedCustomerTable";
import useFetch from "@/hooks/useFetch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useToast } from "@/hooks/useToast";

export default function DeletedCustomersPage() {
    const [search, setSearch] = useState("");
    const [restoreTarget, setRestoreTarget] = useState<any>(null);
    const [restoring, setRestoring] = useState(false);
    const { toast } = useToast();

    const { data, loading, totalItems, totalPages, page, setPage, setQuery, refetch } =
        useFetch<any>((query) => DeletedCustomerService.findDeleted(query), {
            query: { paginate: true, limit: 20 },
        });

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        setQuery({ search: e.target.value || undefined, paginate: true, limit: 20 });
    };

    const handleRestore = async () => {
        if (!restoreTarget) return;
        setRestoring(true);
        try {
            await DeletedCustomerService.restore(restoreTarget.id);
            toast({
                title: "Pelanggan Dipulihkan",
                description: `${restoreTarget.name} berhasil dikembalikan ke daftar aktif.`,
            });
            setRestoreTarget(null);
            refetch();
        } catch {
            toast({
                title: "Gagal",
                description: "Terjadi kesalahan saat memulihkan pelanggan.",
                variant: "destructive",
            });
        } finally {
            setRestoring(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1.5">
                    <h1 className="text-2xl font-extrabold text-[#101D42] tracking-tight sm:text-3xl">
                        Recycle Bin Pelanggan
                    </h1>
                    <p className="text-sm font-medium text-slate-500 max-w-2xl leading-relaxed">
                        Daftar pelanggan yang telah dihapus. Data dapat dipulihkan kembali
                        ke daftar aktif.
                    </p>
                </div>
                <Button variant="outline" size="sm" onClick={refetch} className="gap-2 self-start md:self-auto">
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                </Button>
            </div>

            {/* Stats + Search bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex items-center gap-3 bg-rose-50 border border-rose-100 rounded-2xl px-5 py-3 shrink-0">
                    <Trash2 className="w-4 h-4 text-rose-500" />
                    <span className="text-sm text-rose-700 font-semibold">
                        {totalItems} pelanggan dihapus
                    </span>
                </div>
                <Input
                    placeholder="Cari nama, ID, atau nomor HP..."
                    className="max-w-sm"
                    value={search}
                    onChange={handleSearchChange}
                />
            </div>

            {/* Table */}
            <DeletedCustomerTable
                data={data}
                loading={loading}
                page={page}
                totalPages={totalPages}
                totalItems={totalItems}
                onPageChange={setPage}
                onRestore={setRestoreTarget}
            />

            {/* Confirm Restore Dialog */}
            <AlertDialog
                open={!!restoreTarget}
                onOpenChange={(open) => !open && setRestoreTarget(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="p-3 rounded-2xl bg-emerald-100 shrink-0">
                                <RotateCcw className="w-5 h-5 text-emerald-600" />
                            </div>
                            <AlertDialogTitle>Pulihkan Pelanggan?</AlertDialogTitle>
                        </div>
                        <AlertDialogDescription>
                            Data pelanggan{" "}
                            <strong className="text-slate-700">{restoreTarget?.name}</strong>{" "}
                            akan dikembalikan ke daftar aktif. Semua data terkait (invoice,
                            pembayaran, dll.) akan dapat diakses kembali.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleRestore}
                            disabled={restoring}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                            {restoring ? "Memulihkan..." : "Ya, Pulihkan"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
