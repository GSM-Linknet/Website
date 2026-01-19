import { useState, useEffect } from "react";
import { Plus, Wifi, Edit2, Trash2, MapPin, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BaseTable } from "@/components/shared/BaseTable";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { usePackage } from "../hooks/usePackage";
import { useWilayah } from "../hooks/useWilayah";
import { PackageModal } from "../components/PackageModal";
import { PackageDetailModal } from "../components/PackageDetailModal";
import { DeleteConfirmationModal } from "@/components/shared/DeleteConfirmationModal";
import { useDisclosure } from "@/hooks/use-disclosure";
import { AuthService } from "@/services/auth.service";
import type { Package } from "@/services/master.service";

export default function PackagePricingPage() {
    const user = AuthService.getUser();
    const userRole = user?.role || "USER";
    const resource = "master.paket";

    const canCreate = AuthService.hasPermission(userRole, resource, "create");
    const canEdit = AuthService.hasPermission(userRole, resource, "edit");
    const canDelete = AuthService.hasPermission(userRole, resource, "delete");

    const canSelectWilayah = ["SUPER_ADMIN", "ADMIN_PUSAT"].includes(userRole);

    const [selectedWilayahId, setSelectedWilayahId] = useState<string>(
        user?.wilayahId || "",
    );
    const { data: wilayahs } = useWilayah({ paginate: false });

    const {
        data: packages,
        loading,
        totalItems,
        page,
        totalPages,
        setPage,
        create,
        update,
        remove,
        isLoading,
    } = usePackage({
        idWilayah: selectedWilayahId || undefined,
        limit: 10,
    });

    const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
    const modal = useDisclosure();
    const detailModal = useDisclosure();
    const deleteModal = useDisclosure();

    // Default to first wilayah if admin haven't selected any
    useEffect(() => {
        if (canSelectWilayah && !selectedWilayahId && wilayahs.length > 0) {
            setSelectedWilayahId(wilayahs[0].id);
        }
    }, [canSelectWilayah, wilayahs, selectedWilayahId]);

    const handleAdd = () => {
        setSelectedPackage(null);
        modal.onOpen();
    };

    const handleDetail = (pkg: Package) => {
        setSelectedPackage(pkg);
        detailModal.onOpen();
    };

    const handleEdit = (pkg: Package) => {
        setSelectedPackage(pkg);
        modal.onOpen();
    };

    const handleDelete = (pkg: Package) => {
        setSelectedPackage(pkg);
        deleteModal.onOpen();
    };

    const handleSubmit = async (data: Partial<Package>) => {
        const payload = {
            ...data,
            // If creating and no wilayah selected but filter is active, auto-select it? 
            // Better to let user strictly choose in modal.
            // But if we want to be helpful:
            wilayahIds: (data.wilayahIds && data.wilayahIds.length > 0)
                ? data.wilayahIds
                : (selectedWilayahId ? [selectedWilayahId] : [])
        };

        if (selectedPackage) {
            return await update(selectedPackage.id, payload);
        } else {
            return await create(payload);
        }
    };

    const confirmDelete = async () => {
        if (selectedPackage) {
            const success = await remove(selectedPackage.id);
            if (success) deleteModal.onClose();
        }
    };

    const columns = [
        {
            header: "KODE",
            accessorKey: "code",
            className: "font-mono text-[10px] font-bold text-slate-400",
        },
        {
            header: "NAMA PAKET",
            accessorKey: "name",
            className: "font-bold text-brand-blue",
        },
        {
            header: "WILAYAH",
            accessorKey: "wilayah",
            cell: (row: any) => {
                const count = row.packagesWilayah?.length || 0;
                const names = row.packagesWilayah?.map((pw: any) => pw.wilayah?.name).join(", ");

                return (
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                            <MapPin size={10} /> {count > 0 ? `${count} Wilayah` : "-"}
                        </span>
                        {count > 0 && (
                            <span className="text-[10px] text-slate-400 truncate max-w-[150px]" title={names}>
                                {names}
                            </span>
                        )}
                    </div>
                );
            },
        },
        {
            header: "KECEPATAN",
            accessorKey: "speed",
            cell: (row: Package) => (
                <span className="font-semibold text-blue-600 flex items-center gap-1">
                    <Wifi size={14} /> {row.speed} Mbps
                </span>
            ),
        },
        {
            header: "HARGA / BULAN",
            accessorKey: "price",
            cell: (row: Package) => (
                <span className="font-mono font-bold text-slate-700">
                    Rp {row.price.toLocaleString("id-ID")}
                </span>
            ),
        },
        {
            header: "KOMISI",
            accessorKey: "salesCommission",
            cell: (row: Package) => (
                <div className="space-y-1 text-xs">
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[9px] font-bold text-slate-400 uppercase">Registrasi</span>
                        <div className="flex gap-2">
                            <span className="text-green-600 font-semibold">Sales: {row.salesCommission || 0}%</span>
                            <span className="text-blue-600 font-semibold">SPV: {row.spvCommission || 0}%</span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[9px] font-bold text-slate-400 uppercase">Rutin</span>
                        <div className="flex gap-2">
                            <span className="text-green-600 font-mono">Sales : Rp {(row.salesIncome || 0).toLocaleString("id-ID")}</span>
                            <span className="text-blue-600 font-mono">SPV : Rp {(row.spvIncome || 0).toLocaleString("id-ID")}</span>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            header: "DESKRIPSI",
            accessorKey: "description",
            className: "text-slate-500 max-w-xs truncate text-[11px]",
        },
        {
            header: "AKSI",
            accessorKey: "id",
            cell: (row: Package) => {
                if (!canEdit && !canDelete) return <span className="text-slate-400">-</span>;

                return (
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="w-8 h-8 rounded-lg text-slate-600 hover:bg-slate-50"
                            onClick={() => handleDetail(row)}
                        >
                            <Eye size={14} />
                        </Button>
                        {canEdit && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="w-8 h-8 rounded-lg text-blue-600 hover:bg-blue-50"
                                onClick={() => handleEdit(row)}
                            >
                                <Edit2 size={14} />
                            </Button>
                        )}
                        {canDelete && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="w-8 h-8 rounded-lg text-red-600 hover:bg-red-50"
                                onClick={() => handleDelete(row)}
                            >
                                <Trash2 size={14} />
                            </Button>
                        )}
                    </div>
                );
            },
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-brand-blue">Paket & Harga</h1>
                    <p className="text-sm text-slate-500">
                        Manajemen paket internet dan harga berlangganan bulanan
                    </p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    {canSelectWilayah && (
                        <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-slate-100 shadow-sm">
                            <Label className="text-[10px] font-bold text-slate-400 uppercase ml-2 flex items-center gap-1">
                                <MapPin size={12} /> Wilayah:
                            </Label>
                            <Select
                                value={selectedWilayahId}
                                onValueChange={setSelectedWilayahId}
                            >
                                <SelectTrigger className="w-[180px] h-9 border-none bg-slate-50 rounded-lg font-bold text-slate-600 text-xs shadow-none">
                                    <SelectValue placeholder="Pilih Wilayah" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-slate-100">
                                    {wilayahs.map((w) => (
                                        <SelectItem key={w.id} value={w.id} className="text-xs">
                                            {w.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {canCreate && (
                        <Button
                            className="bg-brand-blue text-white rounded-xl font-bold shadow-lg shadow-blue-900/10 h-11 px-6 whitespace-nowrap"
                            onClick={handleAdd}
                        >
                            <Plus size={18} className="mr-2" />
                            Tambah Paket
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {!loading &&
                    packages.slice(0, 3).map((pkg) => (
                        <div
                            key={pkg.id}
                            className="bg-white rounded-4xl p-6 border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group hover:scale-[1.02] transition-all"
                        >
                            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-all text-blue-900">
                                <Wifi size={80} />
                            </div>
                            <h3 className="text-xl font-black text-brand-blue mb-1">
                                {pkg.name}
                            </h3>
                            <p className="text-blue-500 font-bold mb-4">{pkg.speed} Mbps</p>
                            <p className="text-sm text-slate-500 mb-6 line-clamp-2">
                                {pkg.description || "Tidak ada deskripsi"}
                            </p>
                            <div className="pt-4 border-t border-slate-50">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                                    Harga Langganan
                                </p>
                                <p className="text-2xl font-black text-brand-blue">
                                    Rp {pkg.price.toLocaleString("id-ID")}
                                    <span className="text-sm font-bold text-slate-400">/bln</span>
                                </p>
                            </div>
                        </div>
                    ))}
                {!loading && packages.length === 0 && (
                    <div className="md:col-span-3 py-12 flex flex-col items-center justify-center bg-slate-50 rounded-4xl border-2 border-dashed border-slate-200">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 text-slate-300 shadow-sm">
                            <Wifi size={32} />
                        </div>
                        <p className="font-bold text-slate-400">
                            Belum ada paket untuk wilayah ini
                        </p>
                        {canCreate && (
                            <Button
                                variant="link"
                                className="text-blue-500 font-bold mt-2"
                                onClick={handleAdd}
                            >
                                Buat Paket Pertama
                            </Button>
                        )}
                    </div>
                )}
            </div>

            <div className="bg-white rounded-4xl p-4 border border-slate-100 shadow-xl shadow-slate-200/40 mt-8">
                <BaseTable
                    data={packages}
                    columns={columns}
                    rowKey={(row: Package) => row.id}
                    className="border-none shadow-none"
                    loading={loading}
                    page={page}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    onPageChange={setPage}
                />
            </div>

            {/* Modals */}
            <PackageModal
                isOpen={modal.isOpen}
                onClose={modal.onClose}
                onSubmit={handleSubmit}
                isLoading={isLoading}
                initialData={selectedPackage}
            />

            <PackageDetailModal
                isOpen={detailModal.isOpen}
                onClose={detailModal.onClose}
                data={selectedPackage}
            />

            <DeleteConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={deleteModal.onClose}
                onConfirm={confirmDelete}
                isLoading={isLoading}
                title="Hapus Paket"
                description={`Apakah Anda yakin ingin menghapus paket "${selectedPackage?.name}"? Tindakan ini tidak dapat dibatalkan.`}
                itemName={selectedPackage?.name || "Paket"}
            />
        </div>
    );
}
