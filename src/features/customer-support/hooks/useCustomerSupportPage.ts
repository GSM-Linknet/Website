import { useState, useRef, useEffect, useMemo } from "react";
import { useCustomerSupport } from "./useCustomerSupport";
import { CustomerSupportService } from "@/services/customer-support.service";
import { toast } from "sonner";

export const useCustomerSupportPage = () => {
  const customerSupport = useCustomerSupport();
  const {
    sessions,
    activeSessionId,
    messages,
    isLoading,
    isSending,
    selectSession,
    sendMessage,
    updateContactName,
  } = customerSupport;

  const [inputMessage, setInputMessage] = useState("");
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    const scrollToBottom = () => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    };
    
    // Scroll immediately after render
    scrollToBottom();
    
    // Also scroll after a slight delay to ensure layout is complete
    const timeoutId = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timeoutId);
  }, [messages, isLoading]);

  const handleSend = () => {
    if (!inputMessage.trim()) return;
    sendMessage(inputMessage);
    setInputMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      toast.error("Ukuran file terlalu besar (Maks. 15MB)");
      return;
    }

    try {
      setIsUploading(true);
      const res = await CustomerSupportService.uploadFile(file);
      const fileUrl = (res as any).data?.url || (res as any).url;
      if (fileUrl) {
        let msgType = "document";
        if (file.type.startsWith("image/")) msgType = "image";
        else if (file.type.startsWith("video/")) msgType = "video";
        else if (file.type.startsWith("audio/")) msgType = "audio";

        // Automatically send the file as a message
        sendMessage(`Mengirim file: ${file.name}`, fileUrl, msgType);
      } else {
        toast.error("Gagal mendapatkan URL file");
      }
    } catch (err) {
      console.error("Upload error", err);
      toast.error("Gagal mengunggah file");
    } finally {
      setIsUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const activeSession = sessions.find((s) => s.id === activeSessionId);

  const filteredSessions = useMemo(() => {
    if (!searchQuery.trim()) return sessions;
    const query = searchQuery.toLowerCase();
    return sessions.filter(
      (s) =>
        s.customer?.name?.toLowerCase().includes(query) ||
        s.phoneNumber.includes(query)
    );
  }, [sessions, searchQuery]);

  return {
    sessions,
    activeSessionId,
    messages,
    isLoading,
    isSending,
    selectSession,
    sendMessage,
    updateContactName,

    inputMessage,
    setInputMessage,
    isDetailOpen,
    setIsDetailOpen,
    isInvoiceOpen,
    setIsInvoiceOpen,
    searchQuery,
    setSearchQuery,
    isUploading,
    selectedImage,
    setSelectedImage,

    scrollRef,
    fileInputRef,

    handleSend,
    handleKeyPress,
    handleFileSelect,
    activeSession,
    filteredSessions,
  };
};
