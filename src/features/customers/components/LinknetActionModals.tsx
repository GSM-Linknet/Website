/**
 * features/customers/components/LinknetActionModals.tsx
 * Tujuan      : Kumpulan modal aksi untuk layanan Linknet (Change Service, Ticket, etc.)
 * Dipakai oleh: features/customers/pages/LinkNetPage.tsx
 * Dependensi  : @/components/shared/BaseModal, @/services/linknet.service
 */

import { useState, useEffect } from "react";
import { BaseModal } from "@/components/shared/BaseModal";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LinkNetService } from "@/services/linknet.service";
import type { Customer } from "@/services/customer.service";
import { toast } from "sonner";
import { AlertCircle, Settings2, Wrench, FileText, Activity, Info } from "lucide-react";

// ─── 1. Change Service Modal ───

export function ChangeServiceModal({ customer, isOpen, onClose }: { customer: Customer, isOpen: boolean, onClose: () => void }) {
  const [productPlan, setProductPlan] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!productPlan) return toast.error("Pilih paket baru");
    setLoading(true);
    try {
      await LinkNetService.createChangeService(customer.id, [
        { name: "product_plan", value: productPlan },
        { name: "service_type", value: "FTTH" }, // Mandatory for v2.0
        { name: "notes", value: notes }
      ]);
      toast.success("Permintaan ganti paket berhasil dikirim");
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Gagal ganti paket");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Ganti Paket Layanan"
      description={`Customer: ${customer.name} (${customer.lnId || "-"})`}
      icon={Settings2}
      primaryActionLabel="Kirim Permintaan"
      primaryActionOnClick={handleSubmit}
      primaryActionLoading={loading}
    >
      <div className="space-y-4 py-2">
        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase text-slate-500">Paket Baru</Label>
          <Input placeholder="Nama paket (misal: 100Mbps)" value={productPlan} onChange={e => setProductPlan(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase text-slate-500">Catatan</Label>
          <Input placeholder="Alasan perubahan" value={notes} onChange={e => setNotes(e.target.value)} />
        </div>
      </div>
    </BaseModal>
  );
}

// ─── 2. Create Ticket Modal ───

export function CreateTicketModal({ customer, isOpen, onClose }: { customer: Customer, isOpen: boolean, onClose: () => void }) {
  const [desc, setDesc] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!desc) return toast.error("Isi deskripsi gangguan");
    setLoading(true);
    try {
      const res: any = await LinkNetService.createTroubleTicket(customer.id, {
        description: desc,
        priority,
        severity: "Medium",
        ticketType: "380",
        status: "OPEN",
        name: customer.name,
        version: 1, // Mandatory for v2.0
        requestedResolutionDate: new Date(Date.now() + 86400000).toISOString(), // +24 hours
        relatedEntity: [
          { id: customer.lnId || "", name: "account_id" },
          { id: "Mobile", name: "channel" }
        ]
      });
      toast.success(`Tiket berhasil dibuat: ${res?.data?.id || ""}`);
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Gagal buat tiket");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Buat Tiket Gangguan"
      description={`Pelaporan untuk ${customer.name}`}
      icon={AlertCircle}
      primaryActionLabel="Buka Tiket"
      primaryActionOnClick={handleSubmit}
      primaryActionLoading={loading}
    >
      <div className="space-y-4 py-2">
        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase text-slate-500">Prioritas</Label>
          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase text-slate-500">Deskripsi Masalah</Label>
          <Input placeholder="Misal: Internet mati total / Los merah" value={desc} onChange={e => setDesc(e.target.value)} />
        </div>
      </div>
    </BaseModal>
  );
}

// ─── 3. Disconnect Modal ───

export function DisconnectModal({ customer, isOpen, onClose }: { customer: Customer, isOpen: boolean, onClose: () => void }) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await LinkNetService.createDisconnect(customer.id, [
        { name: "reason", value: reason || "Customer request" }
      ]);
      toast.success("Permintaan pemutusan layanan dikirim");
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Gagal proses pemutusan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Dismantle / Putus Layanan"
      description={`Konfirmasi penghentian layanan untuk ${customer.name}`}
      icon={FileText}
      primaryActionLabel="Ya, Putuskan"
      primaryActionOnClick={handleSubmit}
      primaryActionLoading={loading}
      className="border-red-100"
    >
      <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 text-sm mb-4">
        <p className="font-bold flex items-center gap-2"><Info size={16} /> PERINGATAN</p>
        <p className="mt-1">Aksi ini akan mengirimkan Service Order DISCONNECT ke Linknet. Pastikan koordinasi dengan pelanggan sudah final.</p>
      </div>
      <div className="space-y-2">
        <Label className="text-xs font-bold uppercase text-slate-500">Alasan Berhenti</Label>
        <Input placeholder="Isi alasan jika ada" value={reason} onChange={e => setReason(e.target.value)} />
      </div>
    </BaseModal>
  );
}

// ─── 4. Ticket Status Modal ───

export function TicketStatusModal({ ticketId, isOpen, onClose }: { ticketId: string, isOpen: boolean, onClose: () => void }) {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && ticketId) fetchStatus();
  }, [isOpen, ticketId]);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res: any = await LinkNetService.getTicketStatus(ticketId);
      setStatus(res?.data || {});
    } catch (err: any) {
      toast.error("Gagal ambil status tiket");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Status Tiket Gangguan"
      icon={Activity}
      showFooter={false}
      size="lg"
    >
      {loading ? (
        <div className="py-20 flex justify-center"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : status ? (
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Status</p>
              <p className="text-sm font-bold text-blue-600">{status.status || "UNKNOWN"}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Tipe</p>
              <p className="text-sm font-bold text-slate-700">{status.ticketType || "-"}</p>
            </div>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Deskripsi</p>
            <p className="text-xs text-slate-600 leading-relaxed">{status.description || "-"}</p>
          </div>
          <pre className="p-4 bg-slate-900 text-blue-400 rounded-xl text-[10px] overflow-auto max-h-40 font-mono">
            {JSON.stringify(status, null, 2)}
          </pre>
        </div>
      ) : (
        <p className="text-center py-10 text-slate-400">Pilih tiket untuk melihat status</p>
      )}
    </BaseModal>
  );
}

// ─── 5. Change Device Modal ───

export function ChangeDeviceModal({ customer, isOpen, onClose }: { customer: Customer, isOpen: boolean, onClose: () => void }) {
  const [sn, setSn] = useState("");
  const [action, setAction] = useState<"ADD_DEVICE" | "REM_DEVICE">("ADD_DEVICE");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!sn) return toast.error("Isi Serial Number");
    setLoading(true);
    try {
      await LinkNetService.changeDevice(customer.id, action, [
        { name: "sn_device", value: sn },
        { name: "deviceType", value: "ONT" },
        { name: "service_type", value: "FTTH" } // Mandatory for v2.0
      ], action === "ADD_DEVICE" ? "active" : "inactive");
      toast.success(`Perangkat berhasil di-${action === "ADD_DEVICE" ? "tambah" : "tarik"}`);
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Gagal ubah perangkat");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Ganti / Tambah Perangkat"
      icon={Wrench}
      primaryActionLabel="Eksekusi Order"
      primaryActionOnClick={handleSubmit}
      primaryActionLoading={loading}
    >
      <div className="space-y-4 py-2">
        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase text-slate-500">Jenis Aksi</Label>
          <Select value={action} onValueChange={(v: any) => setAction(v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ADD_DEVICE">Pasang Perangkat (ADD)</SelectItem>
              <SelectItem value="REM_DEVICE">Tarik Perangkat (REM)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase text-slate-500">Serial Number (SN)</Label>
          <Input placeholder="Contoh: SN123456789" value={sn} onChange={e => setSn(e.target.value)} className="font-mono" />
        </div>
      </div>
    </BaseModal>
  );
}
