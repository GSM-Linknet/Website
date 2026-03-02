import { useState, useEffect } from "react";
import { AuthService } from "@/services/auth.service";
import { SuspendQueueService } from "@/services/suspend-queue.service";
import { SystemSettingService } from "@/services/system-setting.service";

const DISMISS_KEY = "suspend-queue-alert-dismissed";
const DISMISS_DURATION_MS = 60 * 60 * 1000; // 1 jam
const POLL_INTERVAL_MS = 5 * 60 * 1000; // 5 menit

export const useSuspendQueueAlert = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const user = AuthService.getUser();
    if (!user) return;

    // Hanya tampilkan kepada user dengan permission pelanggan.suspend-queue + edit
    const hasAccess = AuthService.hasPermission(
      user.role,
      "pelanggan.suspend-queue",
      "edit",
    );
    if (!hasAccess) return;

    checkPendingQueue();

    const interval = setInterval(checkPendingQueue, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  const checkPendingQueue = async () => {
    try {
      // Jika Auto Suspend aktif, tidak perlu notifikasi review manual
      const setting = await SystemSettingService.getSetting(
        "AUTO_SUSPEND_DIRECT",
      );
      if (setting.data.value === "true") return;

      // Cek apakah sudah di-dismiss dalam 1 jam terakhir
      const dismissedAt = localStorage.getItem(DISMISS_KEY);
      if (dismissedAt) {
        const elapsed = Date.now() - Number(dismissedAt);
        if (elapsed < DISMISS_DURATION_MS) return;
      }

      const response = await SuspendQueueService.findAll({
        where: "status:PENDING",
        paginate: true,
        limit: 1,
      } as any);

      const total = (response.data as any)?.totalItems ?? 0;
      if (total > 0) {
        setPendingCount(total);
        setIsOpen(true);
      }
    } catch {
      // Abaikan error agar tidak mengganggu UI
    }
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setIsOpen(false);
  };

  const handleReview = () => {
    handleDismiss();
    window.location.href = "/pelanggan/review-suspend";
  };

  return { isOpen, setIsOpen, pendingCount, handleDismiss, handleReview };
};
