import { useState } from "react";
import { MessageCircle, Download, ExternalLink, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { CustomerDetailModal } from "@/features/customers/components/CustomerDetailModal";
import { CustomerInvoiceDialog } from "@/features/customers/components/CustomerInvoiceDialog";

import { useCustomerSupportPage } from "../hooks/useCustomerSupportPage";
import { ChatSidebar } from "../components/ChatSidebar";
import { ChatHeader } from "../components/ChatHeader";
import { ChatMessageList } from "../components/ChatMessageList";
import { ChatInputArea } from "../components/ChatInputArea";
import { CsDailyReportModal } from "../components/CsDailyReportModal";

const CustomerSupportPage = () => {
  const isFullScreen = window.location.pathname.includes('/fullscreen');
  const [isDailyReportOpen, setIsDailyReportOpen] = useState(false);

  const {
    sessions,
    activeSessionId,
    messages,
    isLoading,
    isSending,
    selectSession,
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
  } = useCustomerSupportPage();

  return (
    <div className={cn(
      "flex flex-col",
      isFullScreen ? "h-screen bg-white" : "h-[calc(100vh-100px)] gap-4"
    )}>
      {!isFullScreen && (
        <div className="flex justify-end gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 text-slate-600 hover:text-blue-600 hover:border-blue-200 transition-colors"
            onClick={() => setIsDailyReportOpen(true)}
          >
            <FileText className="w-4 h-4" />
            Laporan Harian
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 text-slate-600 hover:text-blue-600 hover:border-blue-200 transition-colors"
            onClick={() => window.open('/customer-support/fullscreen', '_blank')}
          >
            <ExternalLink className="w-4 h-4" />
            Buka di Tab Baru
          </Button>
        </div>
      )}
      {/* Main Container */}
      <div className={cn(
        "flex flex-1 overflow-hidden bg-white shadow-sm ring-1 ring-slate-900/5",
        isFullScreen ? "border-0 rounded-none" : "border border-slate-200 rounded-2xl"
      )}>
        
        {/* Sidebar: Chat List */}
        <ChatSidebar
          activeSessionId={activeSessionId}
          totalSessions={sessions.length}
          filteredSessions={filteredSessions}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectSession={selectSession}
        />

        {/* Main Area: Chat Window */}
        <div className={cn(
          "flex-1 flex-col bg-[#F8FAFC] relative transition-all",
          !activeSessionId ? "hidden md:flex" : "flex"
        )}>
          {activeSessionId ? (
            <>
              <ChatHeader
                activeSession={activeSession}
                activeSessionId={activeSessionId}
                selectSession={selectSession}
                updateContactName={updateContactName}
                setIsDetailOpen={setIsDetailOpen}
                setIsInvoiceOpen={setIsInvoiceOpen}
              />

              <ChatMessageList
                messages={messages}
                isLoading={isLoading}
                scrollRef={scrollRef}
                setSelectedImage={setSelectedImage}
              />

              <ChatInputArea
                inputMessage={inputMessage}
                setInputMessage={setInputMessage}
                isSending={isSending}
                isUploading={isUploading}
                fileInputRef={fileInputRef}
                handleSend={handleSend}
                handleKeyPress={handleKeyPress}
                handleFileSelect={handleFileSelect}
              />
            </>
          ) : (
            // Empty State
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#F8FAFC]">
              <div className="relative mb-6 group">
                <div className="absolute inset-0 bg-blue-100 rounded-full scale-150 blur-3xl opacity-50 transition-opacity group-hover:opacity-70"></div>
                <div className="w-28 h-28 bg-white text-blue-600 rounded-full flex items-center justify-center shadow-xl border border-blue-50 relative z-10 transition-transform hover:scale-105 duration-300">
                  <MessageCircle className="w-12 h-12" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-3 tracking-tight">
                Pusat Bantuan WhatsApp
              </h3>
              <p className="text-slate-500 text-center max-w-sm leading-relaxed text-[15px]">
                Pilih percakapan dari panel di sebelah kiri untuk mulai membaca dan membalas pesan dari pelanggan Anda.
              </p>
            </div>
          )}
        </div>
      </div>

      <CustomerDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        customer={activeSession?.customer as any}
      />
      
      <CustomerInvoiceDialog
        open={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
        customer={activeSession?.customer as any}
      />

      {/* Image Lightbox */}
      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="max-w-4xl bg-transparent border-none shadow-none p-0 flex flex-col items-center justify-center">
          <DialogTitle className="sr-only">View Image</DialogTitle>
          {selectedImage && (
            <div className="relative group max-w-full max-h-screen p-4 flex justify-center items-center">
              <img src={selectedImage} alt="Preview" className="max-h-[85vh] max-w-full object-contain rounded-lg shadow-2xl" />
              <a 
                href={selectedImage} 
                download 
                target="_blank"
                rel="noreferrer"
                className="absolute top-8 right-8 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2"
                title="Download Image"
              >
                <Download size={24} />
              </a>
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* Daily Report Modal */}
      <CsDailyReportModal 
        isOpen={isDailyReportOpen} 
        onClose={() => setIsDailyReportOpen(false)} 
      />
    </div>
  );
};

export default CustomerSupportPage;
