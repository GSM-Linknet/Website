import React from "react";
import { format, isSameDay, isToday, isYesterday } from "date-fns";
import { id } from "date-fns/locale";
import { Check, CheckCheck, Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessageListProps {
  messages: any[];
  isLoading: boolean;
  scrollRef: React.Ref<HTMLDivElement>;
  setSelectedImage: (url: string | null) => void;
}

export const ChatMessageList: React.FC<ChatMessageListProps> = ({
  messages,
  isLoading,
  scrollRef,
  setSelectedImage,
}) => {
  const getDateLabel = (date: Date) => {
    if (isToday(date)) return "Hari ini";
    if (isYesterday(date)) return "Kemarin";
    return format(date, "dd MMMM yyyy", { locale: id });
  };

  return (
    <div
      className="flex-1 overflow-y-auto p-6 space-y-6"
      ref={scrollRef}
      style={{
         // Subtle pattern background for a premium feel
         backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 0)',
         backgroundSize: '24px 24px',
         backgroundColor: '#F8FAFC'
      }}
    >
      {isLoading ? (
        <div className="flex justify-center items-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : (
        <>
          {messages.length === 0 && (
            <div className="flex justify-center mt-2 mb-6">
              <span className="text-xs bg-white/80 backdrop-blur-sm px-4 py-1.5 rounded-full text-slate-500 font-medium shadow-sm border border-slate-200">
                Histori Percakapan Dimulai
              </span>
            </div>
          )}

          {messages.map((msg, index) => {
            const isAgent = msg.sender === "AGENT";
            const currentMsgDate = new Date(msg.createdAt);
            const prevMsg = index > 0 ? messages[index - 1] : null;
            const prevMsgDate = prevMsg ? new Date(prevMsg.createdAt) : null;
            
            const showDateSeparator = !prevMsgDate || !isSameDay(currentMsgDate, prevMsgDate);

            return (
              <React.Fragment key={msg.id || index}>
                {showDateSeparator && (
                  <div className="flex justify-center my-4">
                    <span className="text-xs bg-white/80 backdrop-blur-sm px-4 py-1.5 rounded-full text-slate-500 font-medium shadow-sm border border-slate-200">
                      {getDateLabel(currentMsgDate)}
                    </span>
                  </div>
                )}
                <div
                  className={cn(
                    "flex w-full",
                    isAgent ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "relative px-4 py-3 max-w-[75%] shadow-sm flex flex-col",
                      isAgent
                        ? "bg-blue-600 text-white rounded-[20px] rounded-br-sm"
                        : "bg-white text-slate-800 rounded-[20px] rounded-bl-sm border border-slate-100"
                    )}
                  >
                  {/* Render Media */}
                  {msg.mediaUrl && (
                    <div className="mb-2 rounded-xl overflow-hidden bg-black/5 flex items-center justify-center min-w-[200px]">
                      {msg.messageType === "image" ? (
                        <img
                          src={msg.mediaUrl}
                          alt="Media"
                          onClick={() => setSelectedImage(msg.mediaUrl)}
                          className="max-w-[280px] max-h-[280px] object-cover cursor-pointer hover:opacity-95 transition-opacity"
                        />
                      ) : (
                        <a
                          href={msg.mediaUrl}
                          target="_blank"
                          rel="noreferrer"
                          className={cn(
                            "flex items-center gap-3 p-4 w-full text-sm hover:underline",
                            isAgent ? "text-white" : "text-blue-600"
                          )}
                        >
                          <div className={cn("p-2 rounded-full", isAgent ? "bg-white/20" : "bg-blue-50")}>
                             <Paperclip className="w-5 h-5" />
                          </div>
                          <span className="font-medium truncate max-w-[200px]">
                            {msg.content || "Lihat Dokumen"}
                          </span>
                        </a>
                      )}
                    </div>
                  )}

                  {/* Render Text */}
                  {msg.content && msg.messageType !== "document" && (
                    <p className="text-[15px] whitespace-pre-wrap leading-relaxed">
                      {msg.content}
                    </p>
                  )}

                  {/* Metadata (Time & Read Receipt) */}
                  <div
                    className={cn(
                      "flex items-center justify-end gap-1.5 mt-2",
                      isAgent ? "text-blue-100" : "text-slate-400"
                    )}
                  >
                    <span className="text-[10px] font-medium tracking-wide">
                      {format(new Date(msg.createdAt), "HH:mm")}
                    </span>
                    {isAgent && (
                      <span className="ml-0.5">
                        {msg.status === "READ" ? (
                          <CheckCheck className="w-4 h-4 text-emerald-300" />
                        ) : msg.status === "DELIVERED" ? (
                          <CheckCheck className="w-4 h-4" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                      </span>
                    )}
                  </div>
                </div>
                </div>
              </React.Fragment>
            );
          })}
        </>
      )}
    </div>
  );
};
