import { useState, useEffect } from "react";
import { BaseModal } from "@/components/shared/BaseModal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  Mail,
  Lock,
  Shield,
  MapPin,
  Building2,
  Building,
  Layers,
} from "lucide-react";
import { useWilayah } from "../hooks/useWilayah";
import { useCabang } from "../hooks/useCabang";
import { useUnit } from "../hooks/useUnit";
import { useSubUnit } from "../hooks/useSubUnit";
import type { User as UserType } from "@/services/user.service";
import type { UserRole } from "@/services/auth.service";

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<UserType>) => Promise<any>;
  isLoading: boolean;
  initialData?: UserType | null;
}

const ROLES: { value: UserRole; label: string }[] = [
  { value: "SUPER_ADMIN", label: "Super Admin" },
  { value: "ADMIN_PUSAT", label: "Admin Pusat" },
  { value: "ADMIN_CABANG", label: "Admin Cabang" },
  { value: "ADMIN_UNIT", label: "Admin Unit" },
  { value: "SUPERVISOR", label: "Supervisor" },
  { value: "SALES", label: "Sales" },
  { value: "TECHNICIAN", label: "Technician" },
  { value: "USER", label: "User" },
];

export function UserModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  initialData,
}: UserModalProps) {
  const [formData, setFormData] = useState<Partial<UserType>>({
    idUser: 0,
    name: "",
    email: "",
    password: "",
    role: "USER" as UserRole,
    wilayahId: "",
    cabangId: "",
    unitId: "",
    subUnitId: "",
  });

  const isEdit = !!initialData;

  // Data fetching for selections
  const { data: wilayahs } = useWilayah({ paginate: false });
  const { data: cabangs } = useCabang({
    paginate: false,
    idWilayah: formData.wilayahId || undefined,
  });
  const { data: units } = useUnit({
    paginate: false,
    cabangId: formData.cabangId || undefined,
  });
  const { data: subUnits } = useSubUnit({
    paginate: false,
    unitId: formData.unitId || undefined,
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          idUser: initialData.idUser,
          name: initialData.name,
          email: initialData.email,
          role: initialData.role,
          wilayahId: initialData.wilayahId || "",
          cabangId: initialData.cabangId || "",
          unitId: initialData.unitId || "",
          subUnitId: initialData.subUnitId || "",
          password: "", // Don't populate password on edit
        });
      } else {
        setFormData({
          idUser: Math.floor(Math.random() * 100000), // Random temporary ID for creation
          name: "",
          email: "",
          password: "",
          role: "USER" as UserRole,
          wilayahId: "",
          cabangId: "",
          unitId: "",
          subUnitId: "",
        });
      }
    }
  }, [isOpen, initialData]);

  const handleSubmit = async () => {
    // Basic validation
    if (!formData.name || !formData.email || (!isEdit && !formData.password)) {
      alert("Harap isi semua field yang wajib");
      return;
    }

    // Logic based on requested role rules to sanitize payload
    const role = formData.role || "USER";
    const sanitizedData: Partial<UserType> = {
      ...formData,
      // Convert empty strings to null for backend compatibility
      wilayahId: ["ADMIN_CABANG", "ADMIN_UNIT", "SUPERVISOR", "SALES"].includes(role)
        ? formData.wilayahId || null
        : null,
      cabangId: ["ADMIN_CABANG", "ADMIN_UNIT", "SUPERVISOR", "SALES"].includes(role)
        ? formData.cabangId || null
        : null,
      unitId: ["ADMIN_UNIT", "SUPERVISOR", "SALES"].includes(role)
        ? formData.unitId || null
        : null,
      subUnitId: ["SUPERVISOR", "SALES"].includes(role)
        ? formData.subUnitId || null
        : null,
    };

    // If password is empty in edit mode, remove it so it's not updated
    if (isEdit && !sanitizedData.password) {
      delete sanitizedData.password;
    }

    const success = await onSubmit(sanitizedData);
    if (success) {
      onClose();
    }
  };

  // Logic based on requested role rules:
  const role = formData.role || "USER";

  const showWilayah = ["ADMIN_CABANG", "ADMIN_UNIT", "SUPERVISOR", "SALES"].includes(role);
  const showCabang = ["ADMIN_CABANG", "ADMIN_UNIT", "SUPERVISOR", "SALES"].includes(role);
  const showUnit = ["ADMIN_UNIT", "SUPERVISOR", "SALES"].includes(role);
  const showSubUnit = ["SUPERVISOR", "SALES"].includes(role);

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Ubah Data User" : "Tambah User Baru"}
      description={
        isEdit
          ? "Perbarui informasi user dan hak aksesnya."
          : "Lengkapi informasi di bawah untuk menambahkan user baru."
      }
      icon={User}
      primaryActionLabel={isEdit ? "Simpan Perubahan" : "Simpan User"}
      primaryActionOnClick={handleSubmit}
      primaryActionLoading={isLoading}
      size="lg"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Name Field */}
        <div className="space-y-2">
          <Label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
            <User size={14} className="text-blue-500" /> Nama Lengkap
          </Label>
          <Input
            placeholder="Nama lengkap user"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="rounded-xl h-11"
            disabled={isLoading}
          />
        </div>

        {/* Email Field */}
        <div className="space-y-2">
          <Label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
            <Mail size={14} className="text-blue-500" /> Email
          </Label>
          <Input
            type="email"
            placeholder="email@contoh.com"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="rounded-xl h-11"
            disabled={isLoading}
          />
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <Label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
            <Lock size={14} className="text-blue-500" /> Password{" "}
            {isEdit && (
              <span className="text-[10px] normal-case text-slate-400 font-normal ml-1">
                (Kosongkan jika tidak diubah)
              </span>
            )}
          </Label>
          <Input
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            className="rounded-xl h-11"
            disabled={isLoading}
          />
        </div>

        {/* Role Field */}
        <div className="space-y-2">
          <Label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
            <Shield size={14} className="text-blue-500" /> Role
          </Label>
          <Select
            value={formData.role}
            onValueChange={(val) =>
              setFormData({ ...formData, role: val as UserRole })
            }
            disabled={isLoading}
          >
            <SelectTrigger className="rounded-xl h-11">
              <SelectValue placeholder="Pilih Role" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {ROLES.map((role) => (
                <SelectItem key={role.value} value={role.value}>
                  {role.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Hierarchy Selects */}
        {showWilayah && (
          <div className="space-y-2">
            <Label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
              <MapPin size={14} className="text-blue-500" /> Wilayah
            </Label>
            <Select
              value={formData.wilayahId || ""}
              onValueChange={(val) =>
                setFormData({
                  ...formData,
                  wilayahId: val,
                  cabangId: "",
                  unitId: "",
                  subUnitId: "",
                })
              }
            >
              <SelectTrigger className="rounded-xl h-11">
                <SelectValue placeholder="Pilih Wilayah" />
              </SelectTrigger>
              <SelectContent>
                {wilayahs.map((w) => (
                  <SelectItem key={w.id} value={w.id}>
                    {w.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {showCabang && (
          <div className="space-y-2">
            <Label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
              <Building2 size={14} className="text-blue-500" /> Cabang
            </Label>
            <Select
              value={formData.cabangId || ""}
              onValueChange={(val) =>
                setFormData({
                  ...formData,
                  cabangId: val,
                  unitId: "",
                  subUnitId: "",
                })
              }
              disabled={!formData.wilayahId}
            >
              <SelectTrigger className="rounded-xl h-11">
                <SelectValue placeholder="Pilih Cabang" />
              </SelectTrigger>
              <SelectContent>
                {cabangs.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {showUnit && (
          <div className="space-y-2">
            <Label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
              <Building size={14} className="text-blue-500" /> Unit
            </Label>
            <Select
              value={formData.unitId || ""}
              onValueChange={(val) =>
                setFormData({ ...formData, unitId: val, subUnitId: "" })
              }
              disabled={!formData.cabangId}
            >
              <SelectTrigger className="rounded-xl h-11">
                <SelectValue placeholder="Pilih Unit" />
              </SelectTrigger>
              <SelectContent>
                {units.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {showSubUnit && (
          <div className="space-y-2">
            <Label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
              <Layers size={14} className="text-blue-500" /> Sub Unit
            </Label>
            <Select
              value={formData.subUnitId || ""}
              onValueChange={(val) =>
                setFormData({ ...formData, subUnitId: val })
              }
              disabled={!formData.unitId}
            >
              <SelectTrigger className="rounded-xl h-11">
                <SelectValue placeholder="Pilih Sub Unit" />
              </SelectTrigger>
              <SelectContent>
                {subUnits.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </BaseModal>
  );
}
