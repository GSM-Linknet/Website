import { useState, useEffect } from "react";
import { RABService, type AddRABItemPayload, type RAB } from "@/services/rab.service";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/useToast";
import { AuthService } from "@/services/auth.service";
import { formatCurrency } from "@/lib/utils";
import { Plus, Trash2, X, Loader2, PackagePlus, Send } from "lucide-react";

const RAB_CATEGORIES = ["OPERASIONAL", "SDM", "PERALATAN", "MARKETING", "LAINNYA"];
const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  rabToEdit?: RAB | null;
}

interface DraftItem extends Omit<AddRABItemPayload, "unitPrice"> {
  id?: string;
  unitPrice: string; // keep as string for input
  isCustomCategory: boolean;
  customCategory: string;
}

const emptyItem = (): DraftItem => ({
  description: "",
  category: "OPERASIONAL",
  isCustomCategory: false,
  customCategory: "",
  quantity: 1,
  unitPrice: "",
  notes: "",
});

export function RABFormModal({ isOpen, onClose, onSuccess, rabToEdit }: Props) {
  const currentUser = AuthService.getUser();
  const now = new Date();

  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<DraftItem[]>([emptyItem()]);
  const [deletedItemIds, setDeletedItemIds] = useState<string[]>([]);
  
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      if (rabToEdit) {
        setMonth(rabToEdit.month);
        setYear(rabToEdit.year);
        setNotes(rabToEdit.notes ?? "");
        if (rabToEdit.items && rabToEdit.items.length > 0) {
          setItems(rabToEdit.items.map(i => ({
            id: i.id,
            description: i.description,
            category: RAB_CATEGORIES.includes(i.category) ? i.category : "LAINNYA",
            isCustomCategory: !RAB_CATEGORIES.includes(i.category),
            customCategory: !RAB_CATEGORIES.includes(i.category) ? i.category : "",
            quantity: i.quantity,
            unitPrice: i.unitPrice.toString(),
            notes: i.notes ?? ""
          })));
        } else {
          setItems([emptyItem()]);
        }
        setDeletedItemIds([]);
      } else {
        setMonth(now.getMonth() + 1);
        setYear(now.getFullYear());
        setNotes("");
        setItems([emptyItem()]);
        setDeletedItemIds([]);
      }
    }
  }, [isOpen, rabToEdit]);

  const addItem = () => setItems((prev) => [...prev, emptyItem()]);
  const removeItem = (idx: number) => {
    const itemToRemove = items[idx];
    if (itemToRemove?.id) {
      setDeletedItemIds(prev => [...prev, itemToRemove.id!]);
    }
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };
  const updateItem = (idx: number, field: keyof DraftItem, value: any) =>
    setItems((prev) => prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item)));

  const totalAmount = items.reduce((sum, item) => {
    const price = parseFloat(item.unitPrice) || 0;
    return sum + item.quantity * price;
  }, 0);

  const handleSave = async (andSubmit = false) => {
    const setLoading = andSubmit ? setSubmitting : setSaving;
    setLoading(true);
    try {
      let rabId = rabToEdit?.id;

      if (rabId) {
        // Mode Update
        const res = await RABService.update(rabId, { month, year, notes: notes || undefined });
        if (!res.status) throw new Error("Gagal memperbarui RAB");

        // Execute deletions
        for (const idToDelete of deletedItemIds) {
          await RABService.deleteItem(rabId, idToDelete);
        }

        // Add or Update Items
        for (const item of items) {
          if (!item.description || !item.unitPrice) continue;
          const actualCategory = item.isCustomCategory && item.customCategory
            ? item.customCategory.trim() || "LAINNYA" : item.category;

          const payload = {
            description: item.description,
            category: actualCategory,
            quantity: item.quantity,
            unitPrice: parseFloat(item.unitPrice),
            notes: item.notes || undefined,
          };

          if (item.id) {
            await RABService.updateItem(rabId, item.id, payload);
          } else {
            await RABService.addItem(rabId, payload);
          }
        }
      } else {
        // Mode Create
        const res = await RABService.create({
          unitId: currentUser?.unitId ?? undefined,
          subUnitId: currentUser?.subUnitId ?? undefined,
          month,
          year,
          notes: notes || undefined,
        });

        if (!res.status) throw new Error("Gagal membuat RAB");
        rabId = (res as any).data?.id as string;

        for (const item of items) {
          if (!item.description || !item.unitPrice) continue;
          const actualCategory = item.isCustomCategory && item.customCategory
            ? item.customCategory.trim() || "LAINNYA" : item.category;

          await RABService.addItem(rabId, {
            description: item.description,
            category: actualCategory,
            quantity: item.quantity,
            unitPrice: parseFloat(item.unitPrice),
            notes: item.notes || undefined,
          });
        }
      }

      // 3. Submit if requested
      if (andSubmit && rabId) {
        await RABService.submit(rabId);
        toast({ title: "Berhasil", description: rabToEdit ? "RAB berhasil diupdate dan diajukan" : "RAB berhasil dibuat dan diajukan" });
      } else {
        toast({ title: "Berhasil", description: rabToEdit ? "Perubahan RAB berhasil disimpan" : "RAB berhasil disimpan sebagai draft" });
      }

      onSuccess();
      handleClose();
    } catch (err: any) {
      toast({
        title: "Gagal",
        description: err.response?.data?.message ?? err.message ?? "Terjadi kesalahan",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setMonth(now.getMonth() + 1);
    setYear(now.getFullYear());
    setNotes("");
    setItems([emptyItem()]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-2xl max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center">
              <PackagePlus size={20} className="text-indigo-600" />
            </div>
            <div>
              <h2 className="font-black text-slate-800 text-lg leading-tight">{rabToEdit ? "Edit RAB Draft" : "Buat RAB Baru"}</h2>
              <p className="text-xs text-slate-400">Rencana Anggaran Biaya Bulanan</p>
            </div>
          </div>
          <button onClick={handleClose} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-5">
          {/* Period + Notes */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Bulan</label>
              <select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="w-full h-10 rounded-xl border border-slate-200 px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
              >
                {MONTH_NAMES.map((m, i) => (
                  <option key={i + 1} value={i + 1}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Tahun</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                min={2020}
                max={2100}
                className="w-full h-10 rounded-xl border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Catatan (opsional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Catatan atau keterangan RAB..."
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 resize-none"
            />
          </div>

          {/* Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Item Anggaran</label>
              <button
                onClick={addItem}
                className="flex items-center gap-1 text-xs text-indigo-600 font-semibold hover:text-indigo-700 transition-colors"
              >
                <Plus size={14} /> Tambah Item
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, idx) => (
                <div key={idx} className="bg-slate-50 rounded-2xl p-4 space-y-3 border border-slate-100">
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Deskripsi</label>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateItem(idx, "description", e.target.value)}
                        placeholder="Nama pengeluaran..."
                        className="w-full h-9 rounded-lg border border-slate-200 px-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Kategori</label>
                      {item.isCustomCategory ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={item.customCategory}
                            onChange={(e) => updateItem(idx, "customCategory", e.target.value)}
                            placeholder="Ketik kategori..."
                            className="h-9 w-full rounded-lg border border-slate-200 px-2.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => {
                              updateItem(idx, "isCustomCategory", false);
                              updateItem(idx, "customCategory", "");
                              updateItem(idx, "category", "OPERASIONAL");
                            }}
                            className="min-w-8 w-8 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                            title="Batal dan pilih dari daftar"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <select
                          value={item.category}
                          onChange={(e) => {
                            if (e.target.value === "LAINNYA") {
                              updateItem(idx, "isCustomCategory", true);
                            } else {
                              updateItem(idx, "category", e.target.value);
                            }
                          }}
                          className="h-9 w-full min-w-[120px] rounded-lg border border-slate-200 px-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                        >
                          {RAB_CATEGORIES.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Qty</label>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(idx, "quantity", Number(e.target.value))}
                        min={1}
                        className="w-full h-9 rounded-lg border border-slate-200 px-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Harga Satuan</label>
                      <input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(idx, "unitPrice", e.target.value)}
                        placeholder="0"
                        min={0}
                        className="w-full h-9 rounded-lg border border-slate-200 px-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                      />
                    </div>
                    <div className="flex flex-col justify-end">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Subtotal</label>
                      <div className="h-9 flex items-center px-2.5 rounded-lg bg-indigo-50 border border-indigo-100 text-sm font-bold text-indigo-700">
                        {formatCurrency(item.quantity * (parseFloat(item.unitPrice) || 0))}
                      </div>
                    </div>
                  </div>

                  {items.length > 1 && (
                    <button
                      onClick={() => removeItem(idx)}
                      className="flex items-center gap-1 text-[10px] text-rose-400 hover:text-rose-600 font-semibold transition-colors"
                    >
                      <Trash2 size={11} /> Hapus Item
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="bg-indigo-50 rounded-2xl p-4 flex items-center justify-between border border-indigo-100">
            <span className="text-sm font-bold text-indigo-700 uppercase tracking-wider">Total Anggaran</span>
            <span className="text-xl font-black text-indigo-800">{formatCurrency(totalAmount)}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 flex gap-3">
          <Button
            variant="outline"
            onClick={() => handleSave(false)}
            disabled={saving || submitting}
            className="flex-1 rounded-2xl h-11 font-semibold border-slate-200"
          >
            {saving ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
            Simpan Draft
          </Button>
          <Button
            onClick={() => handleSave(true)}
            disabled={saving || submitting || totalAmount === 0}
            className="flex-1 bg-[#101D42] hover:bg-[#0a1329] text-white rounded-2xl h-11 font-bold shadow-lg"
          >
            {submitting ? <Loader2 size={16} className="animate-spin mr-2" /> : <Send size={16} className="mr-2" />}
            Simpan & Ajukan
          </Button>
        </div>
      </div>
    </div>
  );
}

export default RABFormModal;
