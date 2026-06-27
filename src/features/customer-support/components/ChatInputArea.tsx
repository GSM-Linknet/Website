import React, { useRef, useEffect } from "react";
import {  Paperclip, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatInputAreaProps {
  inputMessage: string;
  setInputMessage: (msg: string) => void;
  isSending: boolean;
  isUploading: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleSend: () => void;
  handleKeyPress: (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ChatInputArea: React.FC<ChatInputAreaProps> = ({
  inputMessage,
  setInputMessage,
  isSending,
  isUploading,
  fileInputRef,
  handleSend,
  handleKeyPress,
  handleFileSelect,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize logic when value is cleared (e.g., after sending)
  useEffect(() => {
    if (textareaRef.current && inputMessage === "") {
      textareaRef.current.style.height = "auto";
    }
  }, [inputMessage]);
  return (
    <div className="p-2 md:p-4 bg-white border-t border-slate-200 z-10">
      <div className="max-w-4xl mx-auto flex items-end gap-2 md:gap-3">
        {inputMessage.trim() === "" && (
          <div className="flex shrink-0 pb-0.5 md:pb-1">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileSelect}
              accept="image/*,video/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="rounded-full hover:bg-slate-100 h-10 w-10 md:h-11 md:w-11 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {isUploading ? <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /> : <Paperclip className="w-5 h-5 md:w-5 md:h-5" />}
            </Button>
          </div>
        )}
        
        <div className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-300 transition-all shadow-sm">
          <textarea
            ref={textareaRef}
            rows={1}
            className="w-full border-0 bg-transparent shadow-none focus-visible:ring-0 px-4 py-3 md:px-5 md:py-3.5 text-[14px] md:text-[15px] resize-none outline-none min-h-[44px] md:min-h-[50px] max-h-[120px] md:max-h-[150px] overflow-y-auto block leading-relaxed"
            placeholder="Ketik pesan..."
            value={inputMessage}
            onChange={(e) => {
              setInputMessage(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = `${e.target.scrollHeight}px`;
            }}
            onKeyDown={handleKeyPress}
            disabled={isSending}
            style={{ height: "auto" }}
          />
        </div>
        
        <Button
          onClick={handleSend}
          disabled={!inputMessage.trim() || isSending}
          className="rounded-full shrink-0 h-[44px] w-[44px] md:h-[50px] md:w-[50px] bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 transition-all hover:scale-105 active:scale-95"
        >
          {isSending ? (
            <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Send className="w-[18px] h-[18px] md:w-5 md:h-5 ml-0.5 md:ml-1" />
          )}
        </Button>
      </div>
    </div>
  );
};
