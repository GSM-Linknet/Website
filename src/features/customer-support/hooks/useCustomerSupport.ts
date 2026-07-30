import { useState, useEffect, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { CustomerSupportService } from "@/services/customer-support.service";
import type { ChatSession, ChatMessage } from "@/services/customer-support.service";
import { AuthService } from "@/services/auth.service";
import { toast } from "sonner";

export const useCustomerSupport = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  const fetchSessions = useCallback(async () => {
    try {
      const res = await CustomerSupportService.getSessions();
      setSessions(res.data || []);
    } catch (err) {
      console.error("Failed to fetch sessions", err);
    }
  }, []);

  const fetchMessages = useCallback(async (sessionId: string) => {
    setIsLoading(true);
    try {
      const res = await CustomerSupportService.getMessages(sessionId);
      setMessages(res.data || []);
      // Mark as read
      await CustomerSupportService.markAsRead(sessionId);
      setSessions((prev) =>
        prev.map((s) => (s.id === sessionId ? { ...s, unreadCount: 0 } : s))
      );
    } catch (err) {
      console.error("Failed to fetch messages", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const selectSession = useCallback((sessionId: string | null) => {
    setActiveSessionId(sessionId);
    if (sessionId) {
      fetchMessages(sessionId);
    }
  }, [fetchMessages]);

  const sendMessage = useCallback(async (content: string, mediaUrl?: string, messageType?: string) => {
    if (!activeSessionId) return;
    setIsSending(true);
    try {
      await CustomerSupportService.replyMessage(activeSessionId, {
        content,
        messageType: messageType || (mediaUrl ? "image" : "text"),
        mediaUrl,
      });
      // The socket event will append the message to the list as well, 
      // but we can optionally append it optimistically here if needed.
    } catch (err: any) {
      toast.error("Gagal Mengirim", {
        description: err.response?.data?.message || err.message,
      });
    } finally {
      setIsSending(false);
    }
  }, [activeSessionId]);

  const updateContactName = useCallback(async (sessionId: string, contactName: string) => {
    try {
      await CustomerSupportService.updateContactName(sessionId, contactName);
      toast.success("Nama kontak berhasil diperbarui");
      // UI akan otomatis terupdate via socket event 'session_updated'
    } catch (err: any) {
      toast.error("Gagal Memperbarui Nama", {
        description: err.response?.data?.message || err.message,
      });
    }
  }, []);

  useEffect(() => {
    fetchSessions();

    const baseURL = import.meta.env.VITE_API_BASE_URL || "/api";
    // We assume socket path is /api/socket.io based on the backend implementation
    // We connect to the host of VITE_API_BASE_URL
    let socketHost = baseURL.replace(/\/api\/?$/, "");
    if (!socketHost || socketHost.startsWith("/")) {
      socketHost = window.location.origin;
    }

    const socket = io(socketHost, {
      path: "/api/socket.io",
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("[CustomerSupport] Socket connected:", socket.id);
      const user = AuthService.getUser();
      if (user) {
        socket.emit("authenticate", { userId: user.id });
      }
    });

    socket.on("new_message", (msg: ChatMessage) => {
      // Append if it belongs to active session
      setMessages((prev) => {
        if (prev.length > 0 && prev[0].sessionId === msg.sessionId) {
          // Avoid duplicate inserts
          if (!prev.find((m) => m.id === msg.id)) {
            return [...prev, msg];
          }
        }
        return prev;
      });
    });

    socket.on("session_updated", (session: ChatSession) => {
      setSessions((prev) => {
        if (session.status === 'CLOSED') {
          return prev.filter((s) => s.id !== session.id);
        }

        const exists = prev.find((s) => s.id === session.id);
        if (exists) {
          // If this session is currently active, reset its unread count automatically
          let updatedSession = { ...session };
          
          return prev.map((s) => (s.id === session.id ? updatedSession : s)).sort((a, b) => 
            new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
          );
        } else {
          return [session, ...prev].sort((a, b) => 
            new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
          );
        }
      });
      
      // If we are looking at this session, auto mark as read when new message arrives
      if (session.unreadCount > 0) {
        setSessions((currentSessions) => {
           // We need a ref to access latest state, but we can just use the updater function safely
           // Actually, we must compare with the latest activeSessionId
           return currentSessions;
        });
      }
    });

    socket.on("message_status_updated", (data: { messageId: string, status: string, sessionId: string }) => {
      // Update read receipts
      setMessages((prev) =>
        prev.map((m) =>
          m.messageId === data.messageId ? { ...m, status: data.status } : m
        )
      );
    });

    return () => {
      socket.disconnect();
    };
  }, [fetchSessions]);
  
  // Use a second effect to handle auto-read when activeSessionId changes or gets new messages
  useEffect(() => {
    if (activeSessionId) {
      const activeSess = sessions.find(s => s.id === activeSessionId);
      if (activeSess && activeSess.unreadCount > 0) {
        CustomerSupportService.markAsRead(activeSessionId).then(() => {
           setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, unreadCount: 0 } : s));
        });
      }
    }
  }, [sessions, activeSessionId]);

  return {
    sessions,
    activeSessionId,
    messages,
    isLoading,
    isSending,
    selectSession,
    sendMessage,
    updateContactName,
  };
};
