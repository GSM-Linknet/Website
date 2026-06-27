import { useEffect } from "react";
import { io } from "socket.io-client";
import { AuthService } from "@/services/auth.service";

/**
 * Hook ini bertugas menjaga koneksi socket tetap hidup selama pengguna 
 * membuka aplikasi (Login). Hal ini memungkinkan backend mendeteksi status
 * Online/Offline dari agen CS secara akurat di seluruh aplikasi, bukan hanya
 * saat membuka halaman Customer Support.
 */
export const useGlobalSocket = () => {
  useEffect(() => {
    // Only connect if user is logged in
    const user = AuthService.getUser();
    if (!user) return;

    const baseURL = import.meta.env.VITE_API_BASE_URL || "/api";
    let socketHost = baseURL.replace(/\/api\/?$/, "");
    if (!socketHost || socketHost.startsWith("/")) {
      socketHost = window.location.origin;
    }

    const socket = io(socketHost, {
      path: "/api/socket.io",
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      console.log("[Global] Socket connected for user presence tracking:", socket.id);
      socket.emit("authenticate", { userId: user.id });
    });

    return () => {
      socket.disconnect();
    };
  }, []);
};
