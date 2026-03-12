import { useState } from "react";
import { useRABDetail } from "../hooks/useRAB";
import { RABService, type RABStatus, type RAB } from "@/services/rab.service";
import { AuthService } from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/useToast";
import { formatCurrency } from "@/lib/utils";
import { X, CheckCircle2, XCircle, ChevronDown, User, Calendar, Loader2, Edit2, Trash2 } from "lucide-react";
import moment from "moment";

const STATUS_CONFIG: Record<RABStatus, { label: string; color: string }> = {
  DRAFT: { label: "Draft", color: "bg-slate-100 text-slate-600 border-slate-200" },
  SUBMITTED: { label: "Menunggu Review", color: "bg-amber-50 text-amber-700 border-amber-200" },
  APPROVED: { label: "Disetujui", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  REJECTED: { label: "Ditolak", color: "bg-rose-50 text-rose-700 border-rose-200" },
};

const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

interface Props {
  rabId: string | null;
  isReviewer: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onEditDraft?: (rab: RAB) => void;
  onDeleteDraft?: (rabId: string) => void;
}

export function RABDetailModal({ rabId, isReviewer, onClose, onSuccess, onEditDraft, onDeleteDraft }: Props) {
  const currentUser = AuthService.getUser();
  const { data: rab, loading } = useRABDetail(rabId);
  const [approvedAmount, setApprovedAmount] = useState("");
  const [reviewNotes, setReviewNotes] = useState("");
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  if (!rabId) return null;

  const handleApprove = async () => {
    setProcessing(true);
    try {
      await RABService.approve(rabId, {
        approvedAmount: approvedAmount ? parseFloat(approvedAmount) : undefined,
        reviewNotes: reviewNotes || undefined,
      });
      toast({ title: "Berhasil", description: "RAB telah disetujui." });
      onSuccess();
      onClose();
    } catch (err: any) {
      toast({ title: "Gagal", description: err.response?.data?.message ?? "Gagal menyetujui RAB", variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!reviewNotes.trim()) {
      toast({ title: "Wajib diisi", description: "Catatan penolakan harus diisi.", variant: "destructive" });
      return;
    }
    setProcessing(true);
    try {
      await RABService.reject(rabId, { reviewNotes });
      toast({ title: "Berhasil", description: "RAB telah ditolak." });
      onSuccess();
      onClose();
    } catch (err: any) {
      toast({ title: "Gagal", description: err.response?.data?.message ?? "Gagal menolak RAB", variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  };

  // Group items by category
  const byCategory: Record<string, any[]> = {};
  if (rab?.items) {
    for (const item of rab.items) {
      if (!byCategory[item.category]) byCategory[item.category] = [];
      byCategory[item.category].push(item as any);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-2xl max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div className="space-y-0.5">
            <h2 className="font-black text-slate-800 text-lg leading-tight">
              Detail RAB
              {rab && ` — ${MONTH_NAMES[rab.month - 1]} ${rab.year}`}
            </h2>
            {rab && (
              <p className="text-xs text-slate-400">
                {rab.unit?.name ?? rab.subUnit?.name ?? ""}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {rab && (
              <Badge variant="outline" className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border ${STATUS_CONFIG[rab.status as RABStatus].color}`}>
                {STATUS_CONFIG[rab.status as RABStatus].label}
              </Badge>
            )}
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-5">
          {loading && (
            <div className="flex items-center justify-center h-32">
              <Loader2 size={24} className="animate-spin text-slate-400" />
            </div>
          )}

          {!loading && rab && (
            <>
              {/* Meta info */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 rounded-2xl p-3">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <User size={10} /> Dibuat Oleh
                  </div>
                  <div className="text-sm font-semibold text-slate-700">{rab.creator?.name}</div>
                  <div className="text-[10px] text-slate-400 capitalize">{rab.creator?.role?.toLowerCase().replace(/_/g, " ")}</div>
                </div>
                {rab.submittedAt && (
                  <div className="bg-slate-50 rounded-2xl p-3">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Calendar size={10} /> Tgl Pengajuan
                    </div>
                    <div className="text-sm font-semibold text-slate-700">
                      {moment(rab.submittedAt).format("DD MMM YYYY")}
                    </div>
                  </div>
                )}
              </div>

              {/* Notes */}
              {rab.notes && (
                <div className="bg-blue-50 rounded-2xl p-3 border border-blue-100">
                  <div className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-1">Catatan Pengaju</div>
                  <p className="text-sm text-blue-800">{rab.notes}</p>
                </div>
              )}

              {/* Items by category */}
              {Object.entries(byCategory).map(([category, catItems]) => (
                <div key={category}>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <ChevronDown size={10} /> {category}
                  </div>
                  <div className="border border-slate-100 rounded-2xl overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="text-left py-2 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Deskripsi</th>
                          <th className="text-center py-2 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider w-16">Qty</th>
                          <th className="text-right py-2 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Harga</th>
                          <th className="text-right py-2 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {(catItems as any[]).map((item: any) => (
                          <tr key={item.id}>
                            <td className="py-2.5 px-3 text-slate-700">{item.description}</td>
                            <td className="py-2.5 px-3 text-center text-slate-500">{item.quantity}</td>
                            <td className="py-2.5 px-3 text-right text-slate-500">{formatCurrency(item.unitPrice)}</td>
                            <td className="py-2.5 px-3 text-right font-semibold text-slate-700">{formatCurrency(item.totalPrice)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}

              {/* Totals */}
              <div className="bg-slate-50 rounded-2xl p-4 space-y-2">
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Total Diajukan</span>
                  <span className="font-semibold">{formatCurrency(rab.totalAmount)}</span>
                </div>
                {rab.rolloverAmount > 0 && (
                  <div className="flex justify-between text-sm text-blue-600">
                    <span>Rollover Bulan Lalu</span>
                    <span className="font-semibold">+{formatCurrency(rab.rolloverAmount)}</span>
                  </div>
                )}
                {rab.approvedAmount != null && (
                  <div className="flex justify-between text-sm text-emerald-700 border-t border-slate-200 pt-2 mt-2">
                    <span className="font-bold">Total Disetujui</span>
                    <span className="font-black text-base">{formatCurrency(rab.approvedAmount + rab.rolloverAmount)}</span>
                  </div>
                )}
              </div>

              {/* Review notes from reviewer */}
              {rab.reviewNotes && (
                <div className={`rounded-2xl p-3 border ${rab.status === "APPROVED" ? "bg-emerald-50 border-emerald-100" : "bg-rose-50 border-rose-100"}`}>
                  <div className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${rab.status === "APPROVED" ? "text-emerald-600" : "text-rose-600"}`}>
                    Catatan Reviewer {rab.reviewer && `— ${rab.reviewer.name}`}
                  </div>
                  <p className={`text-sm ${rab.status === "APPROVED" ? "text-emerald-800" : "text-rose-800"}`}>{rab.reviewNotes}</p>
                </div>
              )}

              {/* Creator Actions */}
              {["DRAFT", "REJECTED"].includes(rab.status) && rab.createdBy === currentUser?.id && (
                <div className="bg-slate-50 rounded-2xl p-4 space-y-3 border border-slate-100">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Aksi Pengaju</div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (onEditDraft) onEditDraft(rab as unknown as RAB);
                      }}
                      className="flex-1 rounded-2xl h-11 text-amber-600 border-amber-200 hover:bg-amber-50 font-bold"
                    >
                      <Edit2 size={16} className="mr-2" />
                      Edit RAB
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (onDeleteDraft) {
                          onDeleteDraft(rab.id);
                          onClose();
                        }
                      }}
                      className="flex-1 rounded-2xl h-11 text-rose-600 border-rose-200 hover:bg-rose-50 font-bold"
                    >
                      <Trash2 size={16} className="mr-2" />
                      Hapus RAB
                    </Button>
                  </div>
                </div>
              )}

              {/* Reviewer Actions */}
              {isReviewer && rab.status === "SUBMITTED" && (
                <div className="bg-slate-50 rounded-2xl p-4 space-y-3 border border-slate-100">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tindakan Reviewer</div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Nominal yang Disetujui (kosongkan = sesuai pengajuan)
                    </label>
                    <input
                      type="number"
                      value={approvedAmount}
                      onChange={(e) => setApprovedAmount(e.target.value)}
                      placeholder={`Default: ${formatCurrency(rab.totalAmount)}`}
                      className="w-full h-10 rounded-xl border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Catatan (wajib jika menolak)
                    </label>
                    <textarea
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      rows={2}
                      placeholder="Catatan persetujuan atau alasan penolakan..."
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 resize-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={handleReject}
                      disabled={processing}
                      className="flex-1 rounded-2xl h-11 text-rose-600 border-rose-200 hover:bg-rose-50 font-bold"
                    >
                      {processing ? <Loader2 size={16} className="animate-spin mr-2" /> : <XCircle size={16} className="mr-2" />}
                      Tolak
                    </Button>
                    <Button
                      onClick={handleApprove}
                      disabled={processing}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl h-11 font-bold"
                    >
                      {processing ? <Loader2 size={16} className="animate-spin mr-2" /> : <CheckCircle2 size={16} className="mr-2" />}
                      Setujui
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default RABDetailModal;
