import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Bell, MessageSquare, ShieldAlert, BadgeInfo, Receipt, Activity, Wrench } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { NotificationService, type NotificationPreference } from "@/services/notification.service";
import { NOTIFICATION_TYPES, type NotificationType } from "@/constants/notifications";

interface NotificationSettingsFormProps {
  userId?: string;
  customerId?: string;
  category?: "STAFF" | "CUSTOMER";
}

export function NotificationSettingsForm({ userId, customerId, category }: NotificationSettingsFormProps) {
  const [preferences, setPreferences] = useState<NotificationPreference[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    loadPreferences();
  }, [userId, customerId]);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const data = await NotificationService.getPreferences({ userId, customerId });
      setPreferences(data);
    } catch (error) {
      console.error("Failed to load notification preferences:", error);
      toast.error("Gagal memuat pengaturan notifikasi");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (type: NotificationType, channel: "whatsapp" | "email" | "ignoreLoyal", currentVal: boolean) => {
    const updateKey = `${type}-${channel}`;
    try {
      setUpdating(updateKey);
      await NotificationService.updatePreference({
        userId,
        customerId,
        type,
        [channel]: !currentVal
      });
      
      // Update local state
      setPreferences(prev => {
        const existing = prev.find(p => p.type === type);
        if (existing) {
          return prev.map(p => p.type === type ? { ...p, [channel]: !currentVal } : p);
        } else {
          // If it was a default value (not in DB yet), we'd need more data to mock the object
          // For simplicity, just reload since upsert happened
          loadPreferences();
          return prev;
        }
      });
      
      toast.success("Pengaturan diperbarui");
    } catch (error) {
      console.error("Failed to update preference:", error);
      toast.error("Gagal memperbarui pengaturan");
    } finally {
      setUpdating(null);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "BILLING_DIRECT":
      case "CUSTOMER_BILLING_ALERT":
        return <Receipt className="h-5 w-5 text-blue-500" />;
      case "NETWORK_UPDATE":
      case "CUSTOMER_NETWORK_ALERT":
        return <Activity className="h-5 w-5 text-emerald-500" />;
      case "WORK_ORDER_UPDATE":
      case "WORK_ORDER_ASSIGNMENT":
        return <Wrench className="h-5 w-5 text-orange-500" />;
      case "ACCOUNT_ALERT":
        return <ShieldAlert className="h-5 w-5 text-red-500" />;
      default:
        return <Bell className="h-5 w-5 text-slate-500" />;
    }
  };

  if (loading) {
    return (
      <Card border-slate-200 shadow-sm>
        <CardHeader>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
              <Skeleton className="h-6 w-12 rounded-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  // Filter types based on category if provided
  const typesToDisplay = Object.entries(NOTIFICATION_TYPES)
    .filter(([_, config]) => !category || config.category === category) as [NotificationType, any][];

  return (
    <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
      <CardHeader className="bg-slate-50/50 border-b pb-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-blue-600" />
          <CardTitle className="text-xl">Pengaturan Notifikasi WhatsApp</CardTitle>
        </div>
        <CardDescription>
          Pilih jenis notifikasi yang ingin Anda terima melalui WhatsApp
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-slate-100">
          {typesToDisplay.map(([type, config]) => {
            const pref = preferences.find(p => p.type === type);
            const isWhatsappEnabled = pref ? pref.whatsapp : true; // Default true
            
            return (
              <div key={type} className="flex flex-col p-5 hover:bg-slate-50/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-4 mr-4">
                    <div className="p-2.5 bg-slate-100 rounded-xl mt-0.5">
                      {getIcon(type)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 leading-none">{config.label}</h4>
                      <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
                        {config.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center gap-2 min-w-[80px]">
                    <Switch
                      checked={isWhatsappEnabled}
                      onCheckedChange={() => handleToggle(type, "whatsapp", isWhatsappEnabled)}
                      disabled={updating === `${type}-whatsapp`}
                      className="data-[state=checked]:bg-green-500"
                    />
                    <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                      WhatsApp
                    </span>
                  </div>
                </div>

                {isWhatsappEnabled && category === "STAFF" && (
                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between pl-[3.25rem]">
                    <div className="text-sm text-slate-600">
                      Abaikan notifikasi untuk <span className="font-medium text-slate-900">Pelanggan Loyal</span>
                    </div>
                    <Switch
                      checked={pref?.ignoreLoyal || false}
                      onCheckedChange={() => handleToggle(type, "ignoreLoyal", pref?.ignoreLoyal || false)}
                      disabled={updating === `${type}-ignoreLoyal`}
                      className="scale-90"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {typesToDisplay.length === 0 && (
          <div className="p-8 text-center">
            <BadgeInfo className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">Tidak ada kategori notifikasi tersedia</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
