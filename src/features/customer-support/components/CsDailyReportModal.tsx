import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CustomerSupportService } from "@/services/customer-support.service";
import type { CsDailyReport } from "@/services/customer-support.service";
import { toast } from "sonner";
import { FileText, Plus } from "lucide-react";

interface CsDailyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CsDailyReportModal({ isOpen, onClose }: CsDailyReportModalProps) {
  const [reports, setReports] = useState<CsDailyReport[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Form State
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [activity, setActivity] = useState("");

  const loadReports = async () => {
    setIsLoading(true);
    try {
      const res = await CustomerSupportService.getDailyReports();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setReports((res as any).data || []);
    } catch (err: any) {
      toast.error("Gagal memuat laporan harian");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadReports();
      setShowForm(false);
      setActivity("");
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!date || !activity.trim()) {
      toast.error("Tanggal dan aktivitas harus diisi");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await CustomerSupportService.createDailyReport({ date, activity });
      toast.success("Laporan berhasil disimpan");
      setActivity("");
      setShowForm(false);
      loadReports();
    } catch (err: any) {
      toast.error("Gagal menyimpan laporan", { description: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col gap-0 p-0">
        <DialogHeader className="p-6 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <FileText className="w-5 h-5 text-blue-600" />
              Laporan Harian CS
            </DialogTitle>
            {!showForm && (
              <Button onClick={() => setShowForm(true)} size="sm" className="gap-2 bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4" /> Buat Laporan
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
          {showForm ? (
            <div className="bg-white p-5 rounded-xl border shadow-sm mb-6 space-y-4">
              <h3 className="font-semibold text-slate-800 border-b pb-3">Form Laporan Baru</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal</label>
                  <input 
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Aktivitas</label>
                  <Textarea 
                    value={activity}
                    onChange={(e) => setActivity(e.target.value)}
                    placeholder="Contoh: Menghandle 50 chat masuk, memproses 10 tiket complain..."
                    className="min-h-[120px] resize-y"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => setShowForm(false)} disabled={isSubmitting}>Batal</Button>
                  <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
                    {isSubmitting ? "Menyimpan..." : "Simpan Laporan"}
                  </Button>
                </div>
              </div>
            </div>
          ) : null}

          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            {isLoading ? (
              <div className="p-8 text-center text-slate-500">Memuat riwayat laporan...</div>
            ) : reports.length === 0 ? (
              <div className="p-8 text-center text-slate-500">Belum ada laporan harian.</div>
            ) : (
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="w-[150px]">Nama CS</TableHead>
                    <TableHead className="w-[120px]">Tanggal</TableHead>
                    <TableHead>Aktivitas</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">{report.user?.name || "Unknown"}</TableCell>
                      <TableCell>
                        {new Date(report.date).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </TableCell>
                      <TableCell className="whitespace-pre-wrap">{report.activity}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
