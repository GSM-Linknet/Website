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
  return (
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
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};
