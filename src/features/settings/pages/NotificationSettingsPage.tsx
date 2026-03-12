import React from "react";
import { MessageSquare } from "lucide-react";
import { NotificationSettingsForm } from "@/components/shared/NotificationSettingsForm";
import { useProfile } from "@/features/profile/hooks/useProfile";
import { LoadingState } from "@/features/profile/components/ProfileStates";

const NotificationSettingsPage: React.FC = () => {
  const { profile, loading } = useProfile();

  if (loading) {
    return <LoadingState />;
  }

  if (!profile) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-500">Gagal memuat profil pengguna.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
          <MessageSquare className="h-8 w-8 text-blue-600" />
          Pengaturan Notifikasi
        </h1>
        <p className="text-slate-500">
          Kelola bagaimana Anda menerima notifikasi dari sistem.
        </p>
      </div>

      <div className="max-w-4xl">
        <NotificationSettingsForm userId={profile.id} category="STAFF" />
      </div>
    </div>
  );
};

export default NotificationSettingsPage;
