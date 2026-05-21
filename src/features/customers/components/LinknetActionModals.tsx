/**
 * features/customers/components/LinknetActionModals.tsx
 * Tujuan      : Kumpulan modal aksi untuk layanan Linknet (Change Service, Ticket, etc.)
 * Dipakai oleh: features/customers/pages/LinkNetPage.tsx
 * Dependensi  : @/components/shared/BaseModal, @/services/linknet.service, @/components/ui/button
 * Fungsi utama:
 *   - ChangeServiceModal (Mengubah paket layanan)
 *   - DisconnectModal (Dismantle layanan)
 *   - TicketStatusModal (Menampilkan daftar & status tiket per pelanggan dalam tabel, cek status real-time, dan buka tiket baru)
 *   - ChangeDeviceModal (Ganti/pasang perangkat ONT/STB)
 * Side Effect : Panggilan API LinkNet (HTTP POST/GET/PATCH).
 */

import { useState, useEffect } from "react";
import { BaseModal } from "@/components/shared/BaseModal";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { LinkNetService } from "@/services/linknet.service";
import type { Customer } from "@/services/customer.service";
import { toast } from "sonner";
import { 
  AlertCircle, 
  Settings2, 
  Wrench, 
  FileText, 
  Activity, 
  Info, 
  X, 
  RefreshCw, 
  Clock,
  Plus,
  Trash2
} from "lucide-react";
import { useChangeService } from "../hooks/useChangeService";

// ─── 1. Change Service Modal ───
// (Unchanged code continues below)

// ─── 1. Change Service Modal ───

export function ChangeServiceModal({ customer, isOpen, onClose }: { customer: Customer, isOpen: boolean, onClose: () => void }) {
  const {
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
    handleSubmit
  } = useChangeService({ customer, isOpen, onClose });

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Change Service"
      description={`Pelanggan: ${customer.name}`}
      icon={Settings2}
      showFooter={false}
      size="6xl"
    >
      <div className="space-y-6 py-4 max-h-[75vh] overflow-y-auto px-1 text-slate-800">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Col 1 */}
          <div className="space-y-4">
            <div className="space-y-1">
              <Label className="text-xs font-bold uppercase text-slate-500">Partner Cust Account *</Label>
              <Input value={customer.customerId || ""} disabled className="bg-slate-100 border-slate-200 cursor-not-allowed font-semibold text-slate-500 rounded-xl h-10" />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold uppercase text-slate-500">Cust Name *</Label>
              <Input 
                value={custName} 
                onChange={(e) => setCustName(e.target.value)} 
                className={`rounded-xl h-10 border-slate-200 focus-visible:ring-blue-500 ${errors.custName ? "border-rose-400 focus-visible:ring-rose-400" : ""}`} 
              />
              {errors.custName && <p className="text-[11px] font-bold text-rose-500">{errors.custName}</p>}
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold uppercase text-slate-500">Email *</Label>
              <Input 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className={`rounded-xl h-10 border-slate-200 focus-visible:ring-blue-500 ${errors.email ? "border-rose-400 focus-visible:ring-rose-400" : ""}`} 
              />
              {errors.email && <p className="text-[11px] font-bold text-rose-500">{errors.email}</p>}
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold uppercase text-slate-500">Phone No 1 *</Label>
              <Input 
                value={phone1} 
                onChange={(e) => setPhone1(e.target.value)} 
                className={`rounded-xl h-10 border-slate-200 focus-visible:ring-blue-500 ${errors.phone1 ? "border-rose-400 focus-visible:ring-rose-400" : ""}`} 
              />
              {errors.phone1 && <p className="text-[11px] font-bold text-rose-500">{errors.phone1}</p>}
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold uppercase text-slate-500">Phone No 2 *</Label>
              <Input 
                value={phone2} 
                onChange={(e) => setPhone2(e.target.value)} 
                className={`rounded-xl h-10 border-slate-200 focus-visible:ring-blue-500 ${errors.phone2 ? "border-rose-400 focus-visible:ring-rose-400" : ""}`} 
              />
              {errors.phone2 && <p className="text-[11px] font-bold text-rose-500">{errors.phone2}</p>}
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold uppercase text-slate-500">Schedule Date</Label>
              <Input 
                type="date" 
                value={scheduleDate} 
                onChange={(e) => setScheduleDate(e.target.value)} 
                className="rounded-xl h-10 border-slate-200 focus-visible:ring-blue-500" 
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold uppercase text-slate-500">Sales Code *</Label>
              <Select value={salesCode} onValueChange={setSalesCode}>
                <SelectTrigger className={`rounded-xl h-10 border-slate-200 bg-white ${errors.salesCode ? "border-rose-400" : ""}`}>
                  <SelectValue placeholder="Please Select" />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-100 rounded-xl shadow-lg">
                  <SelectItem value="DIRECT" className="cursor-pointer text-xs">DIRECT - Direct Sales</SelectItem>
                  <SelectItem value="TELE" className="cursor-pointer text-xs">TELE - Telesales</SelectItem>
                  <SelectItem value="ONLINE" className="cursor-pointer text-xs">ONLINE - Online Channel</SelectItem>
                  <SelectItem value="AGENT" className="cursor-pointer text-xs">AGENT - Sales Agent</SelectItem>
                  <SelectItem value="RETAIL" className="cursor-pointer text-xs">RETAIL - Retail Partner</SelectItem>
                </SelectContent>
              </Select>
              {errors.salesCode && <p className="text-[11px] font-bold text-rose-500">{errors.salesCode}</p>}
            </div>
          </div>

          {/* Col 2 */}
          <div className="space-y-4">
            <div className="space-y-1">
              <Label className="text-xs font-bold uppercase text-slate-500">Homepass ID *</Label>
              <Input value={customer.lnId || ""} disabled className="bg-slate-100 border-slate-200 cursor-not-allowed font-semibold text-slate-500 rounded-xl h-10" />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold uppercase text-slate-500">Address *</Label>
              <Input 
                value={address} 
                onChange={(e) => setAddress(e.target.value)} 
                className={`rounded-xl h-10 border-slate-200 focus-visible:ring-blue-500 ${errors.address ? "border-rose-400 focus-visible:ring-rose-400" : ""}`} 
              />
              {errors.address && <p className="text-[11px] font-bold text-rose-500">{errors.address}</p>}
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold uppercase text-slate-500">PPOE Username *</Label>
              <Input 
                value={pppoeUser} 
                onChange={(e) => setPppoeUser(e.target.value)} 
                className={`rounded-xl h-10 border-slate-200 focus-visible:ring-blue-500 ${errors.pppoeUser ? "border-rose-400 focus-visible:ring-rose-400" : ""}`} 
              />
              {errors.pppoeUser && <p className="text-[11px] font-bold text-rose-500">{errors.pppoeUser}</p>}
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold uppercase text-slate-500">PPOE Password *</Label>
              <Input 
                type="password" 
                value={pppoePass} 
                onChange={(e) => setPppoePass(e.target.value)} 
                className={`rounded-xl h-10 border-slate-200 focus-visible:ring-blue-500 ${errors.pppoePass ? "border-rose-400 focus-visible:ring-rose-400" : ""}`} 
              />
              {errors.pppoePass && <p className="text-[11px] font-bold text-rose-500">{errors.pppoePass}</p>}
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold uppercase text-slate-500">WIP Comment</Label>
              <textarea 
                value={wipComment} 
                onChange={(e) => setWipComment(e.target.value)} 
                rows={2}
                placeholder="Masukkan komentar WIP jika ada..."
                className="flex w-full rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" 
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold uppercase text-slate-500">Schedule Time</Label>
              <Input 
                type="time" 
                value={scheduleTime} 
                onChange={(e) => setScheduleTime(e.target.value)} 
                className="rounded-xl h-10 border-slate-200 focus-visible:ring-blue-500" 
              />
            </div>
          </div>
        </div>

        {/* Customer Device Section */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <h4 className="font-bold text-slate-700 text-sm">Customer Device</h4>
          <div className="border border-slate-150 rounded-2xl overflow-hidden bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-800 text-white font-bold uppercase tracking-wider text-[10px]">
                    <th className="px-4 py-3 text-center w-16">Remove?</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">RC Name</th>
                    <th className="px-4 py-3">LN RC</th>
                    <th className="px-4 py-3">SC Code</th>
                    <th className="px-4 py-3">SN</th>
                    <th className="px-4 py-3">Service RC/SC RC/SC Name/SC Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {deviceLoading ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                        <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-blue-500" />
                        Memuat data perangkat...
                      </td>
                    </tr>
                  ) : devices.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-slate-400 font-medium">
                        Tidak ada data perangkat aktif ditemukan
                      </td>
                    </tr>
                  ) : (
                    devices.map((dev, idx) => {
                      const devId = dev.id || dev.SNDEVICE;
                      const isChecked = !!removedDevices[devId];
                      return (
                        <tr key={idx} className={`hover:bg-slate-50/50 transition-colors ${isChecked ? 'bg-rose-50/30' : ''}`}>
                          <td className="px-4 py-3 text-center">
                            <input 
                              type="checkbox" 
                              checked={isChecked} 
                              onChange={() => toggleRemoveDevice(devId)}
                              className="h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
                            />
                          </td>
                          <td className="px-4 py-3 font-semibold text-slate-700">{dev.DEVICETYPE || "Device"}</td>
                          <td className="px-4 py-3 text-slate-600">{dev.RATECODENAME || "-"}</td>
                          <td className="px-4 py-3 text-slate-500 font-mono">{dev.LN_RC || "-"}</td>
                          <td className="px-4 py-3 text-slate-600">{dev.SC_CODE || "-"}</td>
                          <td className="px-4 py-3 font-mono font-medium text-slate-700">{dev.SNDEVICE || "-"}</td>
                          <td className="px-4 py-3 text-slate-500 max-w-[250px] truncate" title={dev.SERVICE || dev.Service}>{dev.SERVICE || dev.Service || "-"}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Change Product / Add-On Section */}
        <div className="space-y-4 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-700 text-sm">Change Product / Add-On</h4>
            <Button
              onClick={() => setShowAddSelector(!showAddSelector)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs px-4 py-2 flex items-center gap-1.5 shadow-sm"
            >
              <Plus size={14} />
              Add
            </Button>
          </div>

          {/* Add Selector Box */}
          {showAddSelector && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 animate-in fade-in slide-in-from-top-2 duration-250">
              <div className="flex items-center gap-4 text-xs font-bold uppercase text-slate-500">
                <span className="text-slate-700 font-bold text-xs uppercase">Pilih Tipe Item:</span>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input type="radio" checked={addType === "product"} onChange={() => { setAddType("product"); setSelectedItemId(""); }} className="text-indigo-600 focus:ring-indigo-500" />
                  Product
                </label>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input type="radio" checked={addType === "addon"} onChange={() => { setAddType("addon"); setSelectedItemId(""); }} className="text-indigo-600 focus:ring-indigo-500" />
                  Add-on
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold uppercase text-slate-500">Pilih Paket/Addon</Label>
                  <Select value={selectedItemId} onValueChange={setSelectedItemId}>
                    <SelectTrigger className="rounded-xl bg-white border-slate-200 text-xs">
                      <SelectValue placeholder="Pilih item..." />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-100 rounded-xl shadow-lg">
                      {addType === "product"
                        ? AVAILABLE_PRODUCTS.map(p => (
                            <SelectItem key={p.id} value={p.id} className="text-xs cursor-pointer">
                              {p.name} (Rp {p.price.toLocaleString("id-ID")})
                            </SelectItem>
                          ))
                        : AVAILABLE_ADDONS.map(a => (
                            <SelectItem key={a.id} value={a.id} className="text-xs cursor-pointer">
                              {a.name} ({a.type} - Rp {a.price.toLocaleString("id-ID")})
                            </SelectItem>
                          ))}
                    </SelectContent>
                  </Select>
                </div>

                {addType === "product" && (
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold uppercase text-slate-500">Serial Number (SN)</Label>
                    <Input 
                      placeholder="Masukkan SN Perangkat..." 
                      value={snToAdd} 
                      onChange={e => setSnToAdd(e.target.value)} 
                      className="rounded-xl bg-white border-slate-200 text-xs h-9" 
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <Label className="text-[10px] font-bold uppercase text-slate-500">Promo</Label>
                  <Input 
                    placeholder="Masukkan kode promo..." 
                    value={promoToAdd} 
                    onChange={e => setPromoToAdd(e.target.value)} 
                    className="rounded-xl bg-white border-slate-200 text-xs h-9" 
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 text-xs">
                <Button variant="ghost" onClick={() => setShowAddSelector(false)} className="rounded-xl font-bold px-4 py-1.5 h-8">Batal</Button>
                <Button onClick={handleAddItem} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold px-4 py-1.5 h-8">Simpan</Button>
              </div>
            </div>
          )}

          {/* Added Products Table */}
          <div className="space-y-1">
            <h5 className="text-xs font-bold text-slate-500 uppercase">Product List</h5>
            <div className="border border-slate-150 rounded-2xl overflow-hidden bg-white shadow-xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-800 text-white font-bold uppercase tracking-wider text-[10px]">
                    <th className="px-4 py-2.5">Product Id</th>
                    <th className="px-4 py-2.5">Product Name</th>
                    <th className="px-4 py-2.5">Serial Number</th>
                    <th className="px-4 py-2.5">Price</th>
                    <th className="px-4 py-2.5">Promo</th>
                    <th className="px-4 py-2.5">Speed</th>
                    <th className="px-4 py-2.5 text-right w-16">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {addedProducts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-5 text-center text-slate-400 italic">
                        Belum ada produk baru ditambahkan
                      </td>
                    </tr>
                  ) : (
                    addedProducts.map((prod, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-2.5 font-semibold text-slate-700">{prod.id}</td>
                        <td className="px-4 py-2.5 text-slate-600">{prod.name}</td>
                        <td className="px-4 py-2.5 font-mono text-slate-600">{prod.sn}</td>
                        <td className="px-4 py-2.5 text-slate-600 font-semibold">Rp {prod.price.toLocaleString("id-ID")}</td>
                        <td className="px-4 py-2.5 text-indigo-600 font-medium">{prod.promo}</td>
                        <td className="px-4 py-2.5 text-slate-500 font-medium">{prod.speed}</td>
                        <td className="px-4 py-2.5 text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg"
                            onClick={() => handleRemoveProduct(idx)}
                          >
                            <Trash2 size={12} />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Added Add-ons Table */}
          <div className="space-y-1">
            <h5 className="text-xs font-bold text-slate-500 uppercase">Addon List</h5>
            <div className="border border-slate-150 rounded-2xl overflow-hidden bg-white shadow-xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-800 text-white font-bold uppercase tracking-wider text-[10px]">
                    <th className="px-4 py-2.5">Addon Id</th>
                    <th className="px-4 py-2.5">Addon Type</th>
                    <th className="px-4 py-2.5">Addon Name</th>
                    <th className="px-4 py-2.5">Price</th>
                    <th className="px-4 py-2.5">Promo</th>
                    <th className="px-4 py-2.5 text-right w-16">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {addedAddons.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-5 text-center text-slate-400 italic">
                        Belum ada add-on baru ditambahkan
                      </td>
                    </tr>
                  ) : (
                    addedAddons.map((addon, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-2.5 font-semibold text-slate-700">{addon.id}</td>
                        <td className="px-4 py-2.5 font-semibold text-indigo-700"><span className="bg-indigo-50 px-2 py-0.5 rounded text-[10px]">{addon.type}</span></td>
                        <td className="px-4 py-2.5 text-slate-600">{addon.name}</td>
                        <td className="px-4 py-2.5 text-slate-600 font-semibold">Rp {addon.price.toLocaleString("id-ID")}</td>
                        <td className="px-4 py-2.5 text-indigo-600 font-medium">{addon.promo}</td>
                        <td className="px-4 py-2.5 text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg"
                            onClick={() => handleRemoveAddon(idx)}
                          >
                            <Trash2 size={12} />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Action Buttons Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <Button
            onClick={onClose}
            className="bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold px-6 py-2 shadow-xs"
          >
            BACK
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold px-6 py-2 flex items-center gap-2 shadow-xs"
          >
            {loading && <RefreshCw size={14} className="animate-spin" />}
            SUBMIT
          </Button>
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

// ─── Problem Codes Constant ───
const PROBLEM_CODES = [
  { id: "44", code: "353", name: "(INTERNET) Speed Internet Slow Problem" },
  { id: "24", code: "355", name: "(CATV) Smart Card Not Inserted" },
  { id: "21", code: "356", name: "(CATV) Remote control not functioning (All STB Type)" },
  { id: "28", code: "359", name: "(CATV) Weak/No Signal Some Channel" },
  { id: "46", code: "360", name: "(NETWORK) All Services are Down" },
  { id: "42", code: "362", name: "(INTERNET) Wi-fi Performance" },
  { id: "45", code: "364", name: "(INTERNET) Internet ON-OFF" },
  { id: "36", code: "365", name: "(INTERNET) Internet Offline" },
  { id: "35", code: "380", name: "(INTERNET) Cant Brows All Website" },
  { id: "38", code: "381", name: "(INTERNET) Some Website Issue" },
  { id: "22", code: "383", name: "(CATV) Smart Card Expired" },
  { id: "33", code: "384", name: "(CATV) Smart Card Suspended" },
  { id: "26", code: "385", name: "(CATV) Smart Card UpsideDown" },
  { id: "23", code: "386", name: "(CATV) Smart Card Mute" },
  { id: "32", code: "387", name: "(CATV) Smart Card Invalid/Not Paired" },
  { id: "19", code: "389", name: "(CATV) Freezing Some/All Channels" },
  { id: "30", code: "393", name: "(CATV) IPTV (STB) No Power" },
  { id: "34", code: "394", name: "(CATV) Apps Problem" },
  { id: "41", code: "402", name: "(INTERNET) ONT Red LOSS Indicator" },
  { id: "37", code: "432", name: "(INTERNET) Set-Up Wifi Password" },
  { id: "47", code: "434", name: "(NETWORK) Impact Maintenance" },
  { id: "43", code: "436", name: "(INTERNET) ONT No Power" },
  { id: "39", code: "437", name: "(INTERNET) Wi-Fi Problem" },
  { id: "40", code: "438", name: "(INTERNET) Registration Case (ONT PON Blinking)" },
  { id: "31", code: "439", name: "(CATV) Access Denied" },
  { id: "25", code: "440", name: "(CATV) Smart Card Problem" },
  { id: "27", code: "441", name: "(CATV) STB (IPTV) Problem" },
  { id: "20", code: "444", name: "(CATV) Picture Problem" },
  { id: "29", code: "445", name: "(CATV) Sound Problem" }
];

// ─── 4. Ticket Status Modal ───

export function TicketStatusModal({ 
  customer, 
  isOpen, 
  onClose,
  defaultTab = "check",
  initialTicketId
}: { 
  customer: Customer; 
  isOpen: boolean; 
  onClose: () => void;
  defaultTab?: "check" | "create";
  initialTicketId?: string;
}) {
  const [activeTab, setActiveTab] = useState<"check" | "create">("check");
  
  // Status check states
  const [selectedTicketId, setSelectedTicketId] = useState<string>("");
  const [manualTicketId, setManualTicketId] = useState<string>("");
  const [isManual, setIsManual] = useState(false);
  const [ticketOptions, setTicketOptions] = useState<Array<{
    id: string;
    date: string;
    ticketType: string;
    description: string;
    status: string;
    priority: string;
    expectedClose: string;
    rawLog: any;
  }>>([]);
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Ticket creation states
  const [desc, setDesc] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [problemCode, setProblemCode] = useState<string>("365"); // default 365
  const [createLoading, setCreateLoading] = useState(false);

  // Sync default tab when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab);
    }
  }, [isOpen, defaultTab]);

  const getStatusBadge = (statusName: string) => {
    const s = (statusName || "").toUpperCase();
    if (s === "RESOLVED" || s === "SUCCESS" || s === "COMPLETED" || s === "CLOSED") {
      return "bg-emerald-50 text-emerald-700 border-emerald-100";
    }
    if (s === "REJECTED" || s === "FAILED" || s === "REJECT" || s === "REJECTED_TICKET") {
      return "bg-rose-50 text-rose-700 border-rose-100";
    }
    if (s === "OPEN" || s === "PENDING" || s === "NEW" || s === "IN_PROGRESS" || s === "ASSIGNED") {
      return "bg-amber-50 text-amber-700 border-amber-100";
    }
    return "bg-blue-50 text-blue-700 border-blue-100";
  };

  const getProblemName = (code: string) => {
    const match = PROBLEM_CODES.find(p => p.code === code);
    return match ? match.name : `Kode ${code}`;
  };

  const fetchLogsAndTickets = async (autoSelectId?: string) => {
    setLoadingLogs(true);
    try {
      const res = await LinkNetService.getLogs({ customerId: customer.id, limit: 100 });
      const logs = res.data?.logs || [];
      
      const ticketLogs = logs.filter(
        (log: any) => log.event === "TROUBLE_TICKET_CREATED" && log.status === "SUCCESS"
      );
      
      const options: Array<{
        id: string;
        date: string;
        ticketType: string;
        description: string;
        status: string;
        priority: string;
        expectedClose: string;
        rawLog: any;
      }> = [];
      const seenIds = new Set<string>();

      ticketLogs.forEach((log: any) => {
        const ticketId = log.payload?.response?.id || log.payload?.response?.TicketID || log.payload?.id;
        if (ticketId && !seenIds.has(ticketId)) {
          seenIds.add(ticketId);
          const formattedDate = new Date(log.createdAt).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          });
          
          const responsePayload = log.payload?.response || {};
          const ticketType = responsePayload.ticketType || log.payload?.ticketType || "-";
          const description = responsePayload.description || log.payload?.description || "-";
          const ticketStatus = responsePayload.status || log.payload?.status || "OPEN";
          const ticketPriority = responsePayload.priority || log.payload?.priority || "Medium";
          
          let expectedClose = "-";
          const reqDate = responsePayload.requestedResolutionDate || log.payload?.requestedResolutionDate;
          if (reqDate) {
            expectedClose = new Date(reqDate).toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit"
            });
          }

          options.push({
            id: ticketId,
            date: formattedDate,
            ticketType,
            description,
            status: ticketStatus,
            priority: ticketPriority,
            expectedClose,
            rawLog: responsePayload
          });
        }
      });

      setTicketOptions(options);

      if (autoSelectId) {
        setIsManual(false);
        setSelectedTicketId(autoSelectId);
        fetchStatus(autoSelectId);
      } else if (options.length > 0) {
        setSelectedTicketId(options[0].id);
        fetchStatus(options[0].id);
      } else {
        setIsManual(true);
      }
    } catch (err) {
      console.error("Gagal mengambil log tiket:", err);
      setIsManual(true);
    } finally {
      setLoadingLogs(false);
    }
  };

  // Fetch logs and tickets when modal opens and activeTab is "check"
  useEffect(() => {
    if (isOpen && customer?.id && activeTab === "check") {
      fetchLogsAndTickets(initialTicketId);
    }
  }, [isOpen, customer?.id, activeTab, initialTicketId]);

  const fetchStatus = async (id: string) => {
    if (!id) return;
    setLoading(true);
    try {
      const res: any = await LinkNetService.getTicketStatus(id);
      setStatus(res?.data || {});
    } catch (err: any) {
      toast.error("Gagal ambil status tiket");
      setStatus(null);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSearch = () => {
    const trimmedId = manualTicketId.trim();
    if (!trimmedId) {
      return toast.error("Masukkan Ticket ID terlebih dahulu");
    }
    fetchStatus(trimmedId);
  };

  const handleCreateTicket = async () => {
    if (!desc) return toast.error("Isi deskripsi gangguan");
    setCreateLoading(true);
    try {
      const res: any = await LinkNetService.createTroubleTicket(customer.id, {
        description: desc,
        priority,
        severity: "Medium",
        ticketType: problemCode,
        status: "OPEN",
        name: customer.name,
        version: 1,
        requestedResolutionDate: new Date(Date.now() + 86400000).toISOString(),
        relatedEntity: [
          { id: customer.lnId || "", name: "account_id", role: "CustomerAccount", "@referredType": "CustomerAccount" },
          { id: "Mobile", name: "channel", role: "Channel", "@referredType": "Channel" }
        ]
      });
      
      const newTicketId = res?.data?.id;
      toast.success(`Tiket berhasil dibuat: ${newTicketId || ""}`);
      
      // Clear form
      setDesc("");
      setPriority("Medium");
      setProblemCode("365");

      // Switch to check tab and load status
      setActiveTab("check");
      if (newTicketId) {
        fetchLogsAndTickets(newTicketId);
      } else {
        fetchLogsAndTickets();
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal buat tiket");
    } finally {
      setCreateLoading(false);
    }
  };

  const showDetail = !!selectedTicketId || isManual;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Kelola Tiket Gangguan Link Net"
      description="Kelola pembuatan tiket gangguan dan periksa status penanganan secara real-time"
      icon={Activity}
      showFooter={false}
      size="6xl"
    >
      <div className="space-y-4 py-2">
        {/* Customer Header Detail Card */}
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <p className="font-bold text-slate-400 uppercase tracking-wider text-[9px]">Partner Cust Account</p>
            <p className="font-semibold text-slate-700 mt-0.5">{customer.customerId || "-"}</p>
          </div>
          <div>
            <p className="font-bold text-slate-400 uppercase tracking-wider text-[9px]">LN Cust Account</p>
            <p className="font-mono font-bold text-blue-600 mt-0.5">{customer.lnId || "-"}</p>
          </div>
          <div>
            <p className="font-bold text-slate-400 uppercase tracking-wider text-[9px]">Nama Pelanggan</p>
            <p className="font-semibold text-slate-700 mt-0.5">{customer.name || "-"}</p>
          </div>
          <div>
            <p className="font-bold text-slate-400 uppercase tracking-wider text-[9px]">Kontak & Alamat</p>
            <p className="font-semibold text-slate-700 mt-0.5 truncate" title={`${customer.phone || "-"} / ${customer.address || "-"}`}>
              {customer.phone || "-"} / {customer.address || "-"}
            </p>
          </div>
        </div>

        {/* Sleek Tab Selector */}
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button 
            type="button"
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${activeTab === 'check' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            onClick={() => {
              setActiveTab('check');
              setStatus(null);
              setSelectedTicketId("");
              setIsManual(false);
              fetchLogsAndTickets();
            }}
          >
            <Activity size={14} />
            Status & Histori Tiket
          </button>
          <button 
            type="button"
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${activeTab === 'create' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            onClick={() => setActiveTab('create')}
          >
            <AlertCircle size={14} />
            Buat Tiket Baru
          </button>
        </div>

        {activeTab === "check" ? (
          <div className="space-y-4">
            {loadingLogs ? (
              <div className="py-20 flex flex-col items-center justify-center gap-2">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-slate-500">Mengambil histori log tiket...</span>
              </div>
            ) : !loadingLogs && ticketOptions.length === 0 ? (
              <div className="py-8 flex flex-col items-center justify-center text-center space-y-4 max-w-md mx-auto">
                <div className="p-3 bg-slate-50 rounded-full text-slate-400">
                  <AlertCircle size={28} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-700">Tidak ada log tiket</h3>
                  <p className="text-xs text-slate-400">Belum ada tiket gangguan yang dibuat melalui sistem ini untuk pelanggan ini.</p>
                </div>
                
                <div className="w-full border-t border-slate-100 my-2" />
                
                <div className="w-full space-y-3">
                  <div className="space-y-1.5 text-left">
                    <Label className="text-[11px] font-bold text-slate-500 uppercase">Cari Ticket ID Manual</Label>
                    <Input
                      placeholder="Contoh: TT105-3-1234567"
                      value={manualTicketId}
                      onChange={(e) => setManualTicketId(e.target.value)}
                      className="rounded-xl bg-slate-50 border-slate-200"
                    />
                  </div>
                  <Button
                    onClick={handleManualSearch}
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold py-2 text-xs"
                  >
                    {loading ? "Mencari..." : "Cek Status Tiket"}
                  </Button>
                </div>
                
                {status && (
                  <div className="w-full border border-slate-100 rounded-2xl p-4 bg-slate-50/50 text-left space-y-3">
                    <div className="flex justify-between items-center">
                      <p className="text-xs font-mono font-bold text-slate-800">{manualTicketId}</p>
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(status.status)}`}>
                        {status.status || "UNKNOWN"}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 font-medium">
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Deskripsi</p>
                      <p className="mt-0.5 text-slate-700">{status.description || "-"}</p>
                    </div>
                    {status.note && status.note.length > 0 && (
                      <div className="text-xs space-y-1">
                        <p className="text-[9px] font-bold text-slate-400 uppercase">Catatan</p>
                        {status.note.map((n: any, idx: number) => (
                          <div key={idx} className="bg-white border border-slate-100 rounded-xl p-2 mt-1">
                            <p className="font-semibold text-slate-700 text-[10px]">{n.author} ({new Date(n.date).toLocaleString("id-ID")})</p>
                            <p className="text-slate-500 mt-0.5">{n.text}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className={showDetail ? "grid grid-cols-1 lg:grid-cols-12 gap-6" : "space-y-4"}>
                {/* Left Side: Ticket List Table */}
                <div className={showDetail ? "lg:col-span-7 space-y-4" : "space-y-4"}>
                  <div className="border border-slate-150 rounded-2xl overflow-hidden bg-white shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                            <th className="px-4 py-3 text-[10px]">No. Tiket</th>
                            <th className="px-4 py-3 text-[10px]">Tipe / Kode</th>
                            <th className="px-4 py-3 text-[10px]">Deskripsi</th>
                            <th className="px-4 py-3 text-[10px]">Status</th>
                            <th className="px-4 py-3 text-[10px]">Tgl Dibuat</th>
                            <th className="px-4 py-3 text-[10px] text-right">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {ticketOptions.map((opt) => {
                            const isSelected = selectedTicketId === opt.id;
                            return (
                              <tr 
                                key={opt.id} 
                                className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${isSelected ? 'bg-blue-50/40 hover:bg-blue-50/60' : ''}`}
                                onClick={() => {
                                  setIsManual(false);
                                  setSelectedTicketId(opt.id);
                                  fetchStatus(opt.id);
                                }}
                              >
                                <td className="px-4 py-3 font-bold text-slate-800 font-mono">{opt.id}</td>
                                <td className="px-4 py-3 text-slate-600 font-medium">{getProblemName(opt.ticketType)}</td>
                                <td className="px-4 py-3 text-slate-500 max-w-[120px] truncate" title={opt.description}>{opt.description}</td>
                                <td className="px-4 py-3">
                                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(opt.status)}`}>
                                    {opt.status}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-slate-400 font-medium whitespace-nowrap">{opt.date}</td>
                                <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className={`h-7 px-2.5 rounded-lg border-blue-200 text-blue-600 hover:bg-blue-50 font-bold text-[11px] gap-1 ${isSelected ? 'bg-blue-50 border-blue-300' : 'bg-white'}`}
                                    onClick={() => {
                                      setIsManual(false);
                                      setSelectedTicketId(opt.id);
                                      fetchStatus(opt.id);
                                    }}
                                  >
                                    <Activity size={12} />
                                    Detail
                                  </Button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Manual search entry button inside list */}
                  <div className="flex justify-between items-center pt-2">
                    <p className="text-[11px] text-slate-400 font-medium">Menampilkan {ticketOptions.length} tiket</p>
                    <button
                      type="button"
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1.5 transition-colors"
                      onClick={() => {
                        setIsManual(true);
                        setSelectedTicketId("");
                        setStatus(null);
                      }}
                    >
                      + Cari / Masukkan ID Tiket Manual
                    </button>
                  </div>
                </div>

                {/* Right Side: Ticket Status Details */}
                {showDetail && (
                  <div className="lg:col-span-5 space-y-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100 flex flex-col justify-between min-h-[350px]">
                    <div className="space-y-4">
                      {/* Detail Header */}
                      <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                        <div className="space-y-0.5">
                          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Detail Status Tiket</h3>
                          <p className="text-sm font-mono font-bold text-slate-800">
                            {isManual ? (manualTicketId || "ID Manual") : selectedTicketId}
                          </p>
                        </div>
                        <button
                          type="button"
                          className="p-1 rounded-lg text-slate-400 hover:text-slate-650 hover:bg-slate-100 transition-colors"
                          onClick={() => {
                            setSelectedTicketId("");
                            setIsManual(false);
                            setStatus(null);
                          }}
                        >
                          <X size={16} />
                        </button>
                      </div>

                      {/* Manual search inputs */}
                      {isManual && !status && (
                        <div className="space-y-3 pt-2">
                          <div className="space-y-1.5">
                            <Label className="text-[11px] font-bold text-slate-500 uppercase">Masukkan ID Tiket</Label>
                            <Input
                              placeholder="Contoh: TT105-3-1234567"
                              value={manualTicketId}
                              onChange={(e) => setManualTicketId(e.target.value)}
                              className="rounded-xl bg-white border-slate-200"
                            />
                          </div>
                          <Button
                            onClick={handleManualSearch}
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold py-2 text-xs"
                          >
                            {loading ? "Mencari..." : "Cek Status Tiket"}
                          </Button>
                        </div>
                      )}

                      {/* Real-time status display */}
                      {loading ? (
                        <div className="py-16 flex flex-col items-center justify-center gap-2">
                          <div className="w-6 h-6 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
                          <span className="text-[11px] text-slate-500">Mengambil status dari Link Net...</span>
                        </div>
                      ) : status ? (
                        <div className="space-y-4 animate-in fade-in duration-300">
                          {/* Status Grid */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                              <p className="text-[9px] font-bold text-slate-400 uppercase">Status Real-time</p>
                              <span className={`inline-flex px-2 py-0.5 mt-1 rounded-full text-[10px] font-bold border ${getStatusBadge(status.status)}`}>
                                {status.status || "UNKNOWN"}
                              </span>
                            </div>
                            <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                              <p className="text-[9px] font-bold text-slate-400 uppercase">Prioritas / Tipe</p>
                              <p className="text-xs font-bold text-slate-700 mt-1">
                                {status.priority || "Medium"} / {status.ticketType || "-"}
                              </p>
                            </div>
                          </div>

                          {/* Description */}
                          <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-sm space-y-1">
                            <p className="text-[9px] font-bold text-slate-400 uppercase">Deskripsi</p>
                            <p className="text-xs text-slate-600 leading-relaxed font-medium">{status.description || "-"}</p>
                          </div>

                          {/* Notes / Catatan Penanganan */}
                          {status.note && status.note.length > 0 ? (
                            <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-sm space-y-2">
                              <p className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1">
                                <Info size={11} className="text-slate-400" /> Catatan / Response Detail
                              </p>
                              <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                                {status.note.map((n: any, idx: number) => (
                                  <div key={idx} className="text-[11px] border-b border-slate-50 last:border-0 pb-1.5 last:pb-0 space-y-1">
                                    <p className="font-semibold text-slate-700 flex justify-between">
                                      <span>{n.author}</span>
                                      <span className="text-[9px] text-slate-400">{new Date(n.date).toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                                    </p>
                                    <p className="text-slate-500 leading-relaxed whitespace-pre-wrap">{n.text}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-sm text-center py-6 text-slate-400 text-xs">
                              Tidak ada catatan / respons dari sistem.
                            </div>
                          )}

                          {/* Collapsible Raw JSON */}
                          <div className="space-y-1.5">
                            <button
                              type="button"
                              className="text-[10px] font-bold text-slate-400 hover:text-slate-650 transition-colors flex items-center gap-1"
                              onClick={() => {
                                const el = document.getElementById("raw-json-pre");
                                if (el) el.classList.toggle("hidden");
                              }}
                            >
                              <FileText size={10} />
                              Toggle Raw JSON Response
                            </button>
                            <pre id="raw-json-pre" className="hidden p-3 bg-slate-900 text-emerald-400 rounded-xl text-[9px] overflow-auto max-h-32 font-mono">
                              {JSON.stringify(status, null, 2)}
                            </pre>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-12 text-slate-400 text-xs font-medium">
                          Pilih tiket dari tabel atau ketik ID tiket untuk melihat status real-time.
                        </div>
                      )}
                    </div>

                    {/* Footer / Refresh Button inside detail */}
                    {status && (
                      <div className="pt-2 border-t border-slate-150 flex justify-between items-center">
                        <p className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Clock size={10} />
                          Terakhir dicek: {new Date().toLocaleTimeString("id-ID")}
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold gap-1 rounded-xl bg-white shadow-sm"
                          onClick={() => fetchStatus(isManual ? manualTicketId : selectedTicketId)}
                          disabled={loading}
                        >
                          <RefreshCw size={11} className={loading ? "animate-spin text-blue-500" : "text-slate-500"} />
                          Segarkan Status
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4 max-w-xl mx-auto py-2">
            {/* Tipe Gangguan / Problem Code */}
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-slate-500">Kode Masalah / Tipe Gangguan</Label>
              <Select value={problemCode} onValueChange={setProblemCode}>
                <SelectTrigger className="rounded-xl bg-slate-50 border-slate-200">
                  <SelectValue placeholder="Pilih kode gangguan..." />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-100 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                  {PROBLEM_CODES.map((item) => (
                    <SelectItem key={item.code} value={item.code} className="cursor-pointer text-xs font-medium">
                      {item.code} - {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-slate-500">Prioritas</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="rounded-xl bg-slate-50 border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-100 rounded-xl shadow-lg">
                  <SelectItem value="High" className="cursor-pointer text-xs">High</SelectItem>
                  <SelectItem value="Medium" className="cursor-pointer text-xs">Medium</SelectItem>
                  <SelectItem value="Low" className="cursor-pointer text-xs">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase text-slate-500">Deskripsi Masalah</Label>
              <Input 
                placeholder="Misal: Internet mati total / Los merah" 
                value={desc} 
                onChange={e => setDesc(e.target.value)} 
                className="rounded-xl bg-slate-50 border-slate-200"
              />
            </div>
            <div className="pt-4 flex justify-end">
              <Button
                onClick={handleCreateTicket}
                disabled={createLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold px-6 py-2 flex items-center gap-2"
              >
                {createLoading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                Buka Tiket Baru
              </Button>
            </div>
          </div>
        )}
      </div>
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
