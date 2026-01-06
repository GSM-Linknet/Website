import { useState, useEffect } from "react";
import { BaseModal } from "@/components/shared/BaseModal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Wrench,
  FileText,
  Activity,
  Building,
  Layers,
} from "lucide-react";
import { useUnit } from "../../master/hooks/useUnit";
import { useSubUnit } from "../../master/hooks/useSubUnit";
import { useTechnicians } from "../../technicians/hooks/useTechnicians";
import { useCustomers } from "../../customers/hooks/useCustomers";
import type { Schedule } from "@/services/master.service";

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<any>;
  isLoading: boolean;
  initialData?: Schedule | null;
}

const STATUS_OPTIONS = [
  { value: "scheduled", label: "Terjadwal" },
  { value: "in_progress", label: "Dalam Proses" },
  { value: "completed", label: "Selesai" },
  { value: "cancelled", label: "Dibatalkan" },
];

export function ScheduleModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  initialData,
}: ScheduleModalProps) {
  const [formData, setFormData] = useState<any>({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    location: "",
    technicianId: "",
    customerId: "",
    status: "scheduled",
    unitId: "",
    subUnitId: "",
  });

  const isEdit = !!initialData;

  // Load necessary data
  const { data: units } = useUnit({ paginate: false });
  const { data: subUnits } = useSubUnit({
    paginate: false,
    unitId: formData.unitId || undefined,
  });
  const { data: technicians } = useTechnicians({ paginate: false, limit: 100 });
  const { data: customers } = useCustomers({ paginate: false, limit: 100 });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // Format dates for input type="datetime-local" (YYYY-MM-DDTHH:mm)
        const formatForInput = (dateStr: string) => {
          if (!dateStr) return "";
          const d = new Date(dateStr);
          return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 16);
        };

        setFormData({
          title: initialData.title || "",
          description: initialData.description || "",
          startTime: formatForInput(initialData.startTime),
          endTime: formatForInput(initialData.endTime),
          location: initialData.location || "",
          technicianId: initialData.technicianId || "",
          customerId: initialData.customerId || "",
          status: initialData.status || "scheduled",
          unitId: initialData.unitId || "",
          subUnitId: initialData.subUnitId || "",
        });
      } else {
        setFormData({
          title: "",
          description: "",
          startTime: "",
          endTime: "",
          location: "",
          technicianId: "",
          customerId: "",
          status: "scheduled",
          unitId: "",
          subUnitId: "",
        });
      }
    }
  }, [isOpen, initialData]);

  const handleSubmit = async () => {
    // Prepare data (ensure dates are valid)
    const payload = {
      ...formData,
      startTime: formData.startTime
        ? new Date(formData.startTime).toISOString()
        : null,
      endTime: formData.endTime
        ? new Date(formData.endTime).toISOString()
        : null,
      unitId: formData.unitId || null,
      subUnitId: formData.subUnitId || null,
      technicianId: formData.technicianId || null,
      customerId: formData.customerId || null,
    };

    const success = await onSubmit(payload);
    if (success) onClose();
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Jadwal Pemasangan" : "Tambah Jadwal Pemasangan"}
      primaryActionLoading={isLoading}
      primaryActionOnClick={handleSubmit}
      size="2xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-1">
        {/* Left Column: Basic Info */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-slate-700 font-bold flex items-center gap-2">
              <Calendar size={14} className="text-blue-500" />
              Judul Agenda
            </Label>
            <Input
              placeholder="Contoh: Instalasi Pelanggan Baru..."
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="rounded-xl border-slate-200 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-700 font-bold flex items-center gap-2">
                <Clock size={14} className="text-blue-500" />
                Waktu Mulai
              </Label>
              <Input
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) =>
                  setFormData({ ...formData, startTime: e.target.value })
                }
                className="rounded-xl border-slate-200"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700 font-bold flex items-center gap-2">
                <Clock size={14} className="text-blue-500" />
                Waktu Selesai
              </Label>
              <Input
                type="datetime-local"
                value={formData.endTime}
                onChange={(e) =>
                  setFormData({ ...formData, endTime: e.target.value })
                }
                className="rounded-xl border-slate-200"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-700 font-bold flex items-center gap-2">
              <MapPin size={14} className="text-blue-500" />
              Lokasi / Alamat
            </Label>
            <Input
              placeholder="Masukkan lokasi pemasangan"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              className="rounded-xl border-slate-200"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-slate-700 font-bold flex items-center gap-2">
              <FileText size={14} className="text-blue-500" />
              Keterangan
            </Label>
            <Textarea
              placeholder="Detail pekerjaan atau catatan tambahan..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="min-h-[100px] rounded-xl border-slate-200"
            />
          </div>
        </div>

        {/* Right Column: Assignment & Hierarchy */}
        <div className="space-y-4 pt-1">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-700 font-bold flex items-center gap-2 text-xs uppercase tracking-wider">
                <Activity size={12} className="text-blue-500" />
                Status Progress
              </Label>
              <Select
                value={formData.status}
                onValueChange={(v) => setFormData({ ...formData, status: v })}
              >
                <SelectTrigger className="rounded-xl bg-white border-slate-200">
                  <SelectValue placeholder="Pilih Status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700 font-bold flex items-center gap-2 text-xs uppercase tracking-wider">
                <Wrench size={12} className="text-blue-500" />
                Penanggung Jawab (Teknisi)
              </Label>
              <Select
                value={formData.technicianId}
                onValueChange={(v) =>
                  setFormData({ ...formData, technicianId: v })
                }
              >
                <SelectTrigger className="rounded-xl bg-white border-slate-200">
                  <SelectValue placeholder="Pilih Teknisi" />
                </SelectTrigger>
                <SelectContent>
                  {technicians?.map((t: any) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.user?.name} ({t.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700 font-bold flex items-center gap-2 text-xs uppercase tracking-wider">
                <User size={12} className="text-blue-500" />
                Target Pelanggan
              </Label>
              <Select
                value={formData.customerId}
                onValueChange={(v) =>
                  setFormData({ ...formData, customerId: v })
                }
              >
                <SelectTrigger className="rounded-xl bg-white border-slate-200">
                  <SelectValue placeholder="Pilih Pelanggan" />
                </SelectTrigger>
                <SelectContent>
                  {customers?.map((c: any) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} - {c.phone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50 space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-700 font-bold flex items-center gap-2 text-xs uppercase tracking-wider">
                <Building size={12} className="text-blue-500" />
                Unit Kerja
              </Label>
              <Select
                value={formData.unitId}
                onValueChange={(v) =>
                  setFormData({ ...formData, unitId: v, subUnitId: "" })
                }
              >
                <SelectTrigger className="rounded-xl bg-white border-slate-200">
                  <SelectValue placeholder="Pilih Unit" />
                </SelectTrigger>
                <SelectContent>
                  {units?.map((u: any) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700 font-bold flex items-center gap-2 text-xs uppercase tracking-wider">
                <Layers size={12} className="text-blue-500" />
                Sub-Unit (Opsional)
              </Label>
              <Select
                value={formData.subUnitId}
                onValueChange={(v) =>
                  setFormData({ ...formData, subUnitId: v })
                }
                disabled={!formData.unitId}
              >
                <SelectTrigger className="rounded-xl bg-white border-slate-200 disabled:opacity-50">
                  <SelectValue placeholder="Pilih Sub-Unit" />
                </SelectTrigger>
                <SelectContent>
                  {subUnits?.map((s: any) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    </BaseModal>
  );
}
