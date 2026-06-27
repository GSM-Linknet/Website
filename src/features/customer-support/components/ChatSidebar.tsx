import React from "react";
import { Search, MessageCircle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

interface ChatSidebarProps {
  activeSessionId: string | null;
  totalSessions: number;
  filteredSessions: any[];
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  selectSession: (id: string | null) => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  activeSessionId,
  totalSessions,
  filteredSessions,
  searchQuery,
  setSearchQuery,
  selectSession,
}) => {
  return (
    <div className={cn(
      "w-full md:w-1/3 md:min-w-[320px] md:max-w-[400px] border-r flex-col bg-[#F8FAFC] transition-all",
      activeSessionId ? "hidden md:flex" : "flex"
    )}>
      {/* Sidebar Header */}
      <div className="p-4 bg-white border-b border-slate-100">
        <h2 className="font-semibold text-slate-800 flex items-center mb-4">
          <MessageCircle className="w-5 h-5 mr-2 text-blue-600" />
          Pesan Aktif ({totalSessions})
        </h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Cari nama atau nomor..."
            className="pl-9 bg-slate-50 border-slate-200 focus-visible:ring-blue-500/20 text-sm h-10 rounded-xl transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-1.5">
        {filteredSessions.map((session) => {
            const isActive = activeSessionId === session.id;
            return (
              <div
                key={session.id}
                onClick={() => selectSession(session.id)}
                className={cn(
                  "flex items-center gap-3 p-3 pr-4 rounded-xl cursor-pointer transition-all duration-200 border",
                  isActive
                    ? "bg-blue-50 border-blue-200 shadow-[0_2px_10px_-4px_rgba(59,130,246,0.3)]"
                    : "hover:bg-white bg-transparent border-transparent hover:border-slate-200 hover:shadow-sm"
                )}
              >
                <div className="relative shrink-0">
                  <Avatar className="h-11 w-11 border border-slate-200/50 shadow-sm">
                    <AvatarFallback
                      className={cn(
                        "font-medium text-sm",
                        isActive
                          ? "bg-blue-600 text-white"
                          : "bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600"
                      )}
                    >
                      {session.customer?.name
                        ? session.customer.name.substring(0, 2).toUpperCase()
                        : "WA"}
                    </AvatarFallback>
                  </Avatar>
                  {/* Status dot */}
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5 gap-2">
                    <span className="font-semibold text-slate-800 truncate text-sm flex-1 min-w-0">
                      {session.contactName || session.customer?.name || session.phoneNumber}
                    </span>
                    <span
                      className={cn(
                        "text-[11px] font-medium whitespace-nowrap shrink-0",
                        session.unreadCount > 0
                          ? "text-blue-600"
                          : "text-slate-400"
                      )}
                    >
                      {format(new Date(session.lastMessageAt), "HH:mm")}
                    </span>
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <p
                      className={cn(
                        "text-xs truncate flex-1 min-w-0",
                        session.unreadCount > 0
                          ? "text-slate-700 font-medium"
                          : "text-slate-500"
                      )}
                    >
                      {session.lastMessagePreview || "Tidak ada pesan"}
                    </p>
                    {session.unreadCount > 0 && (
                      <div className="bg-blue-600 text-white text-[10px] font-bold h-5 min-w-[20px] px-1 rounded-full flex items-center justify-center shrink-0 shadow-sm">
                        {session.unreadCount}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {filteredSessions.length === 0 && (
            <div className="text-center p-8 text-slate-400">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <MessageCircle className="w-6 h-6 text-slate-300" />
              </div>
              <p className="text-sm">Tidak ada percakapan ditemukan.</p>
            </div>
          )}
        </div>
    </div>
  );
};
