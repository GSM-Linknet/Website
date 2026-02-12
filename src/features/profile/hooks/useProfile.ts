import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { ProfileService, type UserProfile } from "@/services/profile.service";

export const useProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile form state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");

  // Password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await ProfileService.getProfile();
      setProfile(data);
      setName(data.name);
      setPhone(data.phone || "");
      setPhotoUrl(data.profile || "");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal memuat profil");
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    if (!name.trim()) {
      toast.error("Nama tidak boleh kosong");
      return false;
    }

    try {
      setUpdating(true);
      const updated = await ProfileService.updateProfile({
        name: name.trim(),
        phone: phone.trim() || undefined,
        profile: photoUrl.trim() || undefined,
      });
      setProfile(updated);
      toast.success("Profil berhasil diperbarui");
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal memperbarui profil");
      return false;
    } finally {
      setUpdating(false);
    }
  };

  const changePassword = async () => {
    if (!currentPassword || !newPassword) {
      toast.error("Semua field password harus diisi");
      return false;
    }

    if (newPassword.length < 6) {
      toast.error("Password baru minimal 6 karakter");
      return false;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Konfirmasi password tidak cocok");
      return false;
    }

    try {
      setChangingPassword(true);
      await ProfileService.changePassword({
        currentPassword,
        newPassword,
      });

      // Clear password fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      toast.success("Password berhasil diubah");
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal mengubah password");
      return false;
    } finally {
      setChangingPassword(false);
    }
  };

  const uploadPhoto = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar");
      return false;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 5MB");
      return false;
    }

    try {
      setUpdating(true);
      const updated = await ProfileService.uploadPhoto(file);
      setProfile(updated);
      setPhotoUrl(updated.profile || "");
      toast.success("Foto profil berhasil diupload");
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal mengupload foto");
      return false;
    } finally {
      setUpdating(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return {
    // State
    profile,
    loading,
    updating,
    changingPassword,
    name,
    setName,
    phone,
    setPhone,
    photoUrl,
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    fileInputRef,

    // Actions
    updateProfile,
    changePassword,
    uploadPhoto,
    triggerFileInput,
  };
};
