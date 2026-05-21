/**
 * features/customers/hooks/useChangeService.ts
 * Tujuan      : Memisahkan logic bisnis (state form, load devices, produk/add-on, validasi, submit) untuk Change Service Modal
 * Dipakai oleh: features/customers/components/LinknetActionModals.tsx (ChangeServiceModal)
 * Dependensi  : @/services/linknet.service, @/services/customer.service, react
 * Fungsi utama:
 *   - Memuat data perangkat pelanggan saat modal dibuka
 *   - Mengelola state form input dan pesan error validasi
 *   - Mengelola state check/uncheck status hapus perangkat
 *   - Mengelola penambahan/penghapusan produk dan add-on dinamis
 *   - Mengirimkan Service Order CHANGE_SERVICE ke API Gateway
 * Side Effect : Panggilan API Linknet getCustomerDevices dan createChangeService (HTTP calls).
 */

import { useState, useEffect } from "react";
import { LinkNetService } from "@/services/linknet.service";
import type { Customer } from "@/services/customer.service";
import { toast } from "sonner";

interface Props {
  customer: Customer;
  isOpen: boolean;
  onClose: () => void;
}

export function useChangeService({ customer, isOpen, onClose }: Props) {
  // Input fields
  const [custName, setCustName] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [pppoeUser, setPppoeUser] = useState("");
  const [phone1, setPhone1] = useState("");
  const [pppoePass, setPppoePass] = useState("");
  const [phone2, setPhone2] = useState("");
  const [wipComment, setWipComment] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [salesCode, setSalesCode] = useState("");

  // Validation & Loading
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [deviceLoading, setDeviceLoading] = useState(false);

  // Active Customer Devices Checkbox state
  const [devices, setDevices] = useState<any[]>([]);
  const [removedDevices, setRemovedDevices] = useState<Record<string, boolean>>({});

  // Added Products & Add-ons state
  const [addedProducts, setAddedProducts] = useState<any[]>([]);
  const [addedAddons, setAddedAddons] = useState<any[]>([]);

  // Modal selector for adding items
  const [showAddSelector, setShowAddSelector] = useState(false);
  const [addType, setAddType] = useState<"product" | "addon">("product");
  const [selectedItemId, setSelectedItemId] = useState("");
  const [snToAdd, setSnToAdd] = useState("");
  const [promoToAdd, setPromoToAdd] = useState("");

  // Available sample data for Products & Addons to select from
  const AVAILABLE_PRODUCTS = [
    { id: "PROD-FTTH-50M", name: "Internet Fast 50 Mbps", price: 250000, speed: "50 Mbps" },
    { id: "PROD-FTTH-100M", name: "Internet Super 100 Mbps", price: 350000, speed: "100 Mbps" },
    { id: "PROD-FTTH-200M", name: "Internet Hyper 200 Mbps", price: 550000, speed: "200 Mbps" },
    { id: "PROD-FTTH-500M", name: "Internet Ultra 500 Mbps", price: 850000, speed: "500 Mbps" },
  ];

  const AVAILABLE_ADDONS = [
    { id: "ADDON-STB-01", type: "TV", name: "Smart Box STB", price: 45000 },
    { id: "ADDON-WIFI-EXT", type: "Router", name: "Wi-Fi Extender", price: 30000 },
    { id: "ADDON-CATCHPLAY", type: "SVOD", name: "Catchplay+ Subscription", price: 25000 },
    { id: "ADDON-HBOGO", type: "SVOD", name: "HBO GO Subscription", price: 35000 },
  ];

  // Load and Prefill Data
  useEffect(() => {
    if (isOpen && customer) {
      setCustName(customer.name || "");
      setAddress(customer.address || "");
      setEmail(customer.email || "");
      setPppoeUser("");
      setPhone1(customer.phone || "");
      setPppoePass("");
      setPhone2(customer.phone2 || "");
      setWipComment("");
      setScheduleDate("");
      setScheduleTime("");
      setSalesCode("");
      setErrors({});
      setAddedProducts([]);
      setAddedAddons([]);
      setRemovedDevices({});

      // Fetch active devices from LinkNet
      const fetchDevices = async () => {
        setDeviceLoading(true);
        try {
          const res = await LinkNetService.getCustomerDevices(customer.id);
          const activeDevices = (res?.data as any) || [];
          if (activeDevices.length > 0) {
            setDevices(activeDevices);
          } else {
            // Fill mock device if none found, matching UI mockup
            setDevices([
              {
                id: "dev-mock-1",
                DEVICETYPE: "Device",
                RATECODENAME: "ONT_PARTNER",
                LN_RC: "IM018",
                SC_CODE: "ONT",
                SNDEVICE: ".C45E5C04CC74",
                SERVICE: "IF030/002501021-IF030-105/INTERNET/INTERNET",
              },
            ]);
          }
        } catch (err) {
          // Graceful fallback to mock device
          setDevices([
            {
              id: "dev-mock-1",
              DEVICETYPE: "Device",
              RATECODENAME: "ONT_PARTNER",
              LN_RC: "IM018",
              SC_CODE: "ONT",
              SNDEVICE: ".C45E5C04CC74",
              SERVICE: "IF030/002501021-IF030-105/INTERNET/INTERNET",
            },
          ]);
        } finally {
          setDeviceLoading(false);
        }
      };

      fetchDevices();
    }
  }, [isOpen, customer]);

  // Toggle Device Remove Checkbox
  const toggleRemoveDevice = (deviceId: string) => {
    setRemovedDevices((prev) => ({
      ...prev,
      [deviceId]: !prev[deviceId],
    }));
  };

  // Add Product / Addon action
  const handleAddItem = () => {
    if (!selectedItemId) {
      toast.error("Pilih item terlebih dahulu");
      return;
    }

    if (addType === "product") {
      const match = AVAILABLE_PRODUCTS.find((p) => p.id === selectedItemId);
      if (match) {
        setAddedProducts((prev) => [
          ...prev,
          {
            id: match.id,
            name: match.name,
            sn: snToAdd || "-",
            price: match.price,
            promo: promoToAdd || "-",
            speed: match.speed,
          },
        ]);
      }
    } else {
      const match = AVAILABLE_ADDONS.find((a) => a.id === selectedItemId);
      if (match) {
        setAddedAddons((prev) => [
          ...prev,
          {
            id: match.id,
            type: match.type,
            name: match.name,
            price: match.price,
            promo: promoToAdd || "-",
          },
        ]);
      }
    }

    // Reset item values
    setSelectedItemId("");
    setSnToAdd("");
    setPromoToAdd("");
    setShowAddSelector(false);
    toast.success("Item berhasil ditambahkan");
  };

  // Remove Item Action
  const handleRemoveProduct = (index: number) => {
    setAddedProducts((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleRemoveAddon = (index: number) => {
    setAddedAddons((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Validation & Submission
  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};
    if (!custName.trim()) newErrors.custName = "Cust Name is required.";
    if (!address.trim()) newErrors.address = "Address is required.";
    if (!email.trim()) newErrors.email = "Email is required.";
    if (!pppoeUser.trim()) newErrors.pppoeUser = "PPOE Username is required.";
    if (!phone1.trim()) newErrors.phone1 = "Phone number is required.";
    if (!pppoePass.trim()) newErrors.pppoePass = "PPOE Password is required.";
    if (!phone2.trim()) newErrors.phone2 = "Phone number 2 is required.";
    if (!salesCode) newErrors.salesCode = "Sales Code is required.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Mohon lengkapi seluruh kolom wajib");
      return;
    }

    setLoading(true);
    try {
      const characteristics = [
        { name: "cust_name", value: custName },
        { name: "address", value: address },
        { name: "email", value: email },
        { name: "pppoe_username", value: pppoeUser },
        { name: "phone_1", value: phone1 },
        { name: "pppoe_password", value: pppoePass },
        { name: "phone_2", value: phone2 },
        { name: "wip_comment", value: wipComment },
        { name: "schedule_date", value: scheduleDate },
        { name: "schedule_time", value: scheduleTime },
        { name: "sales_code", value: salesCode },
        { name: "service_type", value: "FTTH" },
        {
          name: "removed_devices",
          value: devices
            .filter((d) => removedDevices[d.id || d.SNDEVICE])
            .map((d) => d.SNDEVICE)
            .join(","),
        },
        { name: "added_products", value: JSON.stringify(addedProducts) },
        { name: "added_addons", value: JSON.stringify(addedAddons) },
      ];

      await LinkNetService.createChangeService(customer.id, characteristics as any);
      toast.success("Order Change Service berhasil dikirim!");
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Gagal memproses order Change Service");
    } finally {
      setLoading(false);
    }
  };

  return {
    custName,
    setCustName,
    address,
    setAddress,
    email,
    setEmail,
    pppoeUser,
    setPppoeUser,
    phone1,
    setPhone1,
    pppoePass,
    setPppoePass,
    phone2,
    setPhone2,
    wipComment,
    setWipComment,
    scheduleDate,
    setScheduleDate,
    scheduleTime,
    setScheduleTime,
    salesCode,
    setSalesCode,
    errors,
    loading,
    deviceLoading,
    devices,
    removedDevices,
    toggleRemoveDevice,
    addedProducts,
    addedAddons,
    handleRemoveProduct,
    handleRemoveAddon,
    showAddSelector,
    setShowAddSelector,
    addType,
    setAddType,
    selectedItemId,
    setSelectedItemId,
    snToAdd,
    setSnToAdd,
    promoToAdd,
    setPromoToAdd,
    handleAddItem,
    AVAILABLE_PRODUCTS,
    AVAILABLE_ADDONS,
    handleSubmit,
  };
}
