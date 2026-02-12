import { useState, useEffect } from "react";
import { WhatsAppService } from "@/services/whatsapp.service";
import { SystemService } from "@/services/system.service";
import { AuthService } from "@/services/auth.service";

export const useWhatsAppAlert = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    checkWhatsAppStatus();
  }, []);

  const checkWhatsAppStatus = async () => {
    try {
      // Check user role
      const user = AuthService.getUser();
      if (!user) return;

      // Only show for SUPER_ADMIN and ADMIN_PUSAT
      const allowedRoles = ["SUPER_ADMIN", "ADMIN_PUSAT"];
      if (!allowedRoles.includes(user.role)) {
        return;
      }

      // Check if already dismissed today
      const dismissedDate = localStorage.getItem("whatsapp-alert-dismissed");
      const today = new Date().toDateString();
      if (dismissedDate === today) {
        return;
      }

      // Try to check WhatsApp settings (optional - if fails, assume enabled)
      let whatsappEnabled = true; // Default: assume enabled
      try {
        const settingsResponse = await SystemService.getWhatsappStatus()
        
        const settings = settingsResponse.data;
        whatsappEnabled = settings.enabled
      } catch (settingsError) {
      }

      if (!whatsappEnabled) {
        return;
      }

      // Check WhatsApp connection status
      const statusResponse = await WhatsAppService.getStatus();
      const whatsappStatus = statusResponse.data;

      // Show alert if WhatsApp is enabled but not connected (disconnected or qr)
      if (
        whatsappStatus.status === "disconnected" ||
        whatsappStatus.status === "qr"
      ) {
        setIsOpen(true);
      } 
    } catch (error) {
    }
  };

  const handleDismiss = () => {
    const today = new Date().toDateString();
    localStorage.setItem("whatsapp-alert-dismissed", today);
    setIsOpen(false);
  };

  const handleGoToSettings = () => {
    handleDismiss();
    window.location.href = "/settings/whatsapp";
  };

  return {
    isOpen,
    setIsOpen,
    handleDismiss,
    handleGoToSettings,
  };
};
