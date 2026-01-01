import { useState, useMemo } from "react";
import { Plus, Building2, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BaseTable } from "@/components/shared/BaseTable";
import { CabangModal } from "../components/CabangModal";
import { DeleteConfirmationModal } from "@/components/shared/DeleteConfirmationModal";
import { useCabang } from "../hooks/useCabang";
import { useToast } from "@/hooks/useToast";
import type { Cabang } from "@/services/master.service";
import { AuthService } from "@/services/auth.service";

// ==================== Page Component ====================

export default function CabangPage() {
  const { toast } = useToast();
  const userProfile = AuthService.getUser();
  const userRole = userProfile?.role || "USER";
  const resource = "master.wilayah";

  const canCreate = AuthService.hasPermission(userRole, resource, "create");
  const canEdit = AuthService.hasPermission(userRole, resource, "edit");
  const canDelete = AuthService.hasPermission(userRole, resource, "delete");

  const {
    data,
    loading,
    totalItems,
    page,
    totalPages,
    setPage,
    create,
    creating,
    update,
    updating,
    remove: deleteCabang,
    deleting,
  } = useCabang();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCabang, setSelectedCabang] = useState<Cabang | null>(null);
  const [cabangToDelete, setCabangToDelete] = useState<Cabang | null>(null);

  // Handlers
  const handleAdd = () => {
    setSelectedCabang(null);
    setIsModalOpen(true);
  };

  const handleEdit = (row: Cabang) => {
    setSelectedCabang(row);
    setIsModalOpen(true);
  };

  const handleDelete = (row: Cabang) => {
    setCabangToDelete(row);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!cabangToDelete) return;
    const success = await deleteCabang(cabangToDelete.id);
    if (success) {
      toast({
        title: "Berhasil",
        description: "Cabang berhasil dihapus",
      });
      setIsDeleteModalOpen(false);
      setCabangToDelete(null);
    }
  };

  const handleSubmit = async (formData: Partial<Cabang>) => {
    let result = null;
    if (selectedCabang) {
      result = await update(selectedCabang.id, formData);
    } else {
      result = await create(formData);
    }

    if (result) {
      toast({
        title: "Berhasil",
        description: `Cabang berhasil ${selectedCabang ? "diperbarui" : "ditambahkan"}`,
      });
      return true;
    }
    return false;
  };

  // Columns with Action
  const columns = useMemo(
    () => [
      {
        header: "KODE",
        accessorKey: "code",
        className: "font-bold text-[#101D42]",
      },
      {
        header: "NAMA CABANG",
        accessorKey: "name",
        className: "font-semibold text-slate-700",
      },
      {
        header: "WILAYAH",
        accessorKey: "cabangWilayah",
        cell: (row: Cabang) => {
          const wilayahs = row.cabangWilayah?.map(cw => cw.wilayah.name) || [];
          return wilayahs.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {wilayahs.map((name, i) => (
                <span key={i} className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                  {name}
                </span>
              ))}
            </div>
          ) : <span className="text-slate-400">-</span>;
        },
        className: "text-slate-500",
      },
      {
        header: "AREA",
        accessorKey: "cabangArea",
        cell: (row: Cabang) => {
          const areas = row.cabangArea?.map(ca => ca.area.name) || [];
          return areas.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {areas.map((name, i) => (
                <span key={i} className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                  {name}
                </span>
              ))}
            </div>
          ) : <span className="text-slate-400">-</span>;
        },
        className: "text-slate-500",
      },
      {
        header: "AKSI",
        id: "actions",
        accessorKey: "id",
        className: "w-[120px] text-center",
        cell: (row: Cabang) => {
          if (!canEdit && !canDelete) return <span className="text-slate-400">-</span>;

          return (
            <div className="flex items-center justify-center gap-2">
              {canEdit && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full text-blue-600 hover:bg-blue-50"
                  onClick={() => handleEdit(row)}
                >
                  <Edit2 size={14} />
                </Button>
              )}
              {canDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full text-red-600 hover:bg-red-50"
                  onClick={() => handleDelete(row)}
                  disabled={deleting}
                >
                  <Trash2 size={14} />
                </Button>
              )}
            </div>
          );
        },
      },
    ],
    [deleting, canEdit, canDelete],
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#101D42]">Data Cabang</h1>
          <p className="text-sm text-slate-500">
            Manajemen kantor cabang operasional
          </p>
        </div>
        {canCreate && (
          <Button
            onClick={handleAdd}
            className="bg-[#101D42] text-white rounded-xl font-bold shadow-lg shadow-blue-900/10"
          >
            <Plus size={18} className="mr-2" />
            Tambah Cabang
          </Button>
        )}
      </div>

      {/* Content */}
      <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-xl shadow-slate-200/40">
        {/* Info Banner */}
        <div className="flex items-center gap-3 mb-6 p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
          <div className="p-2 bg-blue-500 rounded-lg text-white">
            <Building2 size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              Informasi
            </p>
            <p className="text-sm text-slate-600 font-medium">
              {loading
                ? "Memuat data..."
                : `Terdapat ${totalItems} cabang aktif dalam database.`}
            </p>
          </div>
        </div>

        {/* Table */}
        <BaseTable
          data={data}
          columns={columns}
          rowKey={(row: Cabang) => row.id}
          className="border-none shadow-none"
          loading={loading}
          page={page}
          totalPages={totalPages}
          totalItems={totalItems}
          onPageChange={setPage}
        />
      </div>

      {/* Modals */}
      <CabangModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        isLoading={creating || updating}
        initialData={selectedCabang}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        itemName={cabangToDelete?.name}
        isLoading={deleting}
      />
    </div>
  );
}
