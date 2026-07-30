import React from "react";
import { ArrowLeft, Edit2, User, FileText, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CustomerSupportService } from "@/services/customer-support.service";
import { toast } from "sonner";

interface ChatHeaderProps {
  activeSession: any;
  activeSessionId: string | null;
  selectSession: (id: string | null) => void;
  updateContactName: (sessionId: string, newName: string) => void;
  setIsDetailOpen: (open: boolean) => void;
  setIsInvoiceOpen: (open: boolean) => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  activeSession,
  activeSessionId,
  selectSession,
  updateContactName,
  setIsDetailOpen,
  setIsInvoiceOpen,
}) => {
  const [isCloseModalOpen, setIsCloseModalOpen] = React.useState(false);
  const [selectedCategory, setSelectedCategory] = React.useState("");
  const [customCategory, setCustomCategory] = React.useState("");
  const [resolution, setResolution] = React.useState("");
  const [isClosing, setIsClosing] = React.useState(false);

  const handleCloseSession = async () => {
    const finalCategory = selectedCategory === "Lainnya" ? customCategory : selectedCategory;
    if (!finalCategory.trim() || !resolution.trim()) {
      toast.error("Kategori masalah dan tindakan harus diisi");
      return;
    }
    
    if (!activeSessionId) return;

    setIsClosing(true);
    try {
      await CustomerSupportService.closeSession(activeSessionId, {
        problemCategory: finalCategory,
        resolution
      });
      toast.success("Sesi berhasil ditutup");
      setIsCloseModalOpen(false);
      selectSession(null); // Return to empty state
    } catch (err: any) {
      toast.error("Gagal menutup sesi", { description: err.message });
    } finally {
      setIsClosing(false);
    }
  };

  return (
    <>
      <div className="h-[72px] border-b border-slate-200 flex items-center justify-between px-3 md:px-6 bg-white shadow-sm z-10 gap-2">
      <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden text-slate-500 hover:text-slate-700 mr-1"
          onClick={() => selectSession(null)}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <Avatar className="h-10 w-10 shrink-0 border border-slate-100 shadow-sm">
          <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
            {(activeSession?.contactName || activeSession?.customer?.name || "P")
              .substring(0, 2)
              .toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0 pr-2">
          <h3 className="font-semibold text-slate-800 text-base leading-tight flex items-center gap-2">
            <span className="truncate">
              {activeSession?.contactName || activeSession?.customer?.name || "Pelanggan"}
            </span>
            <button 
              onClick={() => {
                const currentName = activeSession?.contactName || activeSession?.customer?.name || "";
                const newName = prompt("Masukkan nama kontak baru:", currentName);
                if (newName && newName.trim() !== "" && newName !== currentName && activeSessionId) {
                  updateContactName(activeSessionId, newName.trim());
                }
              }}
              className="text-slate-400 hover:text-blue-600 transition-colors"
              title="Ubah Nama Kontak"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          </h3>
          <div className="flex items-center text-xs text-slate-500 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5"></span>
            {activeSession?.phoneNumber}
          </div>
        </div>
      </div>
      
      {/* Header Actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="text-slate-600 hover:text-blue-600 h-8 px-3"
            disabled={!activeSession?.customer}
            onClick={() => setIsDetailOpen(true)}
            title="Detail Pelanggan"
          >
            <User className="w-4 h-4 mr-1.5" />
            Detail
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-slate-600 hover:text-blue-600 h-8 px-3"
            disabled={!activeSession?.customer}
            onClick={() => setIsInvoiceOpen(true)}
            title="Informasi Tagihan"
          >
            <FileText className="w-4 h-4 mr-1.5" />
            Tagihan
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            className="h-8 px-3 bg-red-600 hover:bg-red-700 text-white"
            onClick={() => setIsCloseModalOpen(true)}
            title="Selesaikan Percakapan"
          >
            Tutup Sesi
          </Button>
        </div>

        {/* Mobile Actions */}
        <div className="md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-slate-700">
                <MoreVertical className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem 
                disabled={!activeSession?.customer}
                onClick={() => setIsDetailOpen(true)}
                className="cursor-pointer"
              >
                <User className="w-4 h-4 mr-2 text-slate-500" />
                Detail Pelanggan
              </DropdownMenuItem>
              <DropdownMenuItem 
                disabled={!activeSession?.customer}
                onClick={() => setIsInvoiceOpen(true)}
                className="cursor-pointer"
              >
                <FileText className="w-4 h-4 mr-2 text-slate-500" />
                Informasi Tagihan
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setIsCloseModalOpen(true)}
                className="cursor-pointer text-red-600"
              >
                Tutup Sesi
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      </div>

      <Dialog open={isCloseModalOpen} onOpenChange={setIsCloseModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tutup Sesi Pelanggan</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Kategori Masalah / Kendala</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori masalah..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Jaringan Mati / Gangguan">Jaringan Mati / Gangguan</SelectItem>
                  <SelectItem value="Info Tagihan / Pembayaran">Info Tagihan / Pembayaran</SelectItem>
                  <SelectItem value="Pasang Baru / Registrasi">Pasang Baru / Registrasi</SelectItem>
                  <SelectItem value="Perubahan Paket">Perubahan Paket</SelectItem>
                  <SelectItem value="Lainnya">Lainnya...</SelectItem>
                </SelectContent>
              </Select>
              {selectedCategory === "Lainnya" && (
                <div className="pt-2">
                  <Input 
                    placeholder="Tuliskan kategori masalah..." 
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                  />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tindakan / Resolusi</label>
              <Textarea 
                placeholder="Jelaskan tindakan yang telah diambil..."
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsCloseModalOpen(false)} disabled={isClosing}>
              Batal
            </Button>
            <Button className="bg-red-600 hover:bg-red-700" onClick={handleCloseSession} disabled={isClosing}>
              {isClosing ? "Memproses..." : "Tutup Sesi"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
