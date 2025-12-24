import { useState, useMemo } from "react";
import { Plus, Building2, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BaseTable } from "@/components/shared/BaseTable";
import { CabangModal } from "../components/CabangModal";
import { useCabang } from "../hooks/useCabang";
import { useToast } from "@/hooks/useToast";
import type { Cabang } from "@/services/master.service";

// ==================== Page Component ====================

export default function CabangPage() {
  const { toast } = useToast();
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
  const [selectedCabang, setSelectedCabang] = useState<Cabang | null>(null);

  // Handlers
  const handleAdd = () => {
    setSelectedCabang(null);
    setIsModalOpen(true);
  };

  const handleEdit = (row: Cabang) => {
    setSelectedCabang(row);
    setIsModalOpen(true);
  };

  const handleDelete = async (row: Cabang) => {
    if (
      window.confirm(`Apakah Anda yakin ingin menghapus cabang ${row.name}?`)
    ) {
      const success = await deleteCabang(row.id);
      if (success) {
        toast({
          title: "Berhasil",
          description: "Cabang berhasil dihapus",
        });
      }
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
        accessorKey: "wilayahId",
        cell: (row: Cabang) => row.wilayah?.name || "-",
        className: "text-slate-500",
      },
      {
        header: "AKSI",
        id: "actions",
        accessorKey: "id",
        className: "w-[120px] text-center",
        cell: (row: Cabang) => (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full text-blue-600 hover:bg-blue-50"
              onClick={() => handleEdit(row)}
            >
              <Edit2 size={14} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full text-red-600 hover:bg-red-50"
              onClick={() => handleDelete(row)}
              disabled={deleting}
            >
              <Trash2 size={14} />
            </Button>
          </div>
        ),
      },
    ],
    [deleting],
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
        <Button
          onClick={handleAdd}
          className="bg-[#101D42] text-white rounded-xl font-bold shadow-lg shadow-blue-900/10"
        >
          <Plus size={18} className="mr-2" />
          Tambah Cabang
        </Button>
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

      {/* Modal */}
      <CabangModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        isLoading={creating || updating}
        initialData={selectedCabang}
      />
    </div>
  );
}
