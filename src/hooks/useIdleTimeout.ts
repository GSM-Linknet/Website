/**
 * useIdleTimeout.ts
 * Tujuan      : Hook untuk memantau aktivitas pengguna (mouse, keyboard, scroll, klik, touch).
 *               Jika pengguna tidak melakukan aktivitas apapun dalam jangka waktu tertentu (idle),
 *               sistem akan otomatis melakukan logout demi keamanan akun.
 *               Sebaliknya, jika pengguna aktif menggunakan aplikasi, sesi tetap berjalan normal.
 * Dipakai oleh: Layout.tsx (membungkus seluruh protected pages)
 * Dependensi  : AuthService, sonner (toast)
 * Fungsi utama: useIdleTimeout
 * Side effects: Mendaftarkan event listener pada window, memantau interval inaktivitas,
 *               menghapus sesi dan redirect ke halaman login saat batas waktu idle terlewati.
 */

import { useEffect, useRef, useCallback } from "react";
import { AuthService } from "@/services/auth.service";
import { toast } from "sonner";

// Standar inaktivitas timeout: 15 menit (dalam milidetik)
const DEFAULT_IDLE_TIMEOUT_MS = 15 * 60 * 1000;
// Throttle update aktivitas agar tidak boros performa CPU (tiap 5 detik)
const ACTIVITY_THROTTLE_MS = 5 * 1000;
const STORAGE_KEY = "app_last_active_time";

export const useIdleTimeout = (timeoutMs: number = DEFAULT_IDLE_TIMEOUT_MS) => {
  const lastActiveRef = useRef<number>(Date.now());
  const lastRecordedRef = useRef<number>(Date.now());

  // Handle logout saat waktu idle tercapai
  const handleIdleLogout = useCallback(async () => {
    const user = AuthService.getUser();
    if (!user) return; // Tidak perlu logout jika belum login

    console.warn("[Session Security] Pengguna tidak aktif selama batas waktu. Melakukan logout otomatis.");
    toast.error("Sesi Anda telah berakhir karena tidak ada aktivitas. Silakan login kembali.", {
      duration: 5000,
    });

    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }

    await AuthService.logout();
  }, []);

  // Update timestamp aktivitas pengguna
  const recordActivity = useCallback(() => {
    const now = Date.now();
    lastActiveRef.current = now;

    // Throttle penulisan ke localStorage
    if (now - lastRecordedRef.current > ACTIVITY_THROTTLE_MS) {
      lastRecordedRef.current = now;
      try {
        localStorage.setItem(STORAGE_KEY, now.toString());
      } catch {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    const user = AuthService.getUser();
    if (!user) return;

    // Inisialisasi waktu aktivitas awal
    const now = Date.now();
    lastActiveRef.current = now;
    try {
      localStorage.setItem(STORAGE_KEY, now.toString());
    } catch {
      // ignore
    }

    // Event listener yang mencakup interaksi pengguna
    const events = ["mousedown", "mousemove", "keydown", "scroll", "touchstart", "click"];

    const handleEvent = () => {
      recordActivity();
    };

    events.forEach((event) => {
      window.addEventListener(event, handleEvent, { passive: true });
    });

    // Pengecekan berkala tiap 10 detik
    const checkInterval = setInterval(() => {
      // Cek timestamp lintas tab dari localStorage jika ada
      let latestActive = lastActiveRef.current;
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = parseInt(stored, 10);
          if (!isNaN(parsed) && parsed > latestActive) {
            latestActive = parsed;
            lastActiveRef.current = parsed;
          }
        }
      } catch {
        // ignore
      }

      const elapsed = Date.now() - latestActive;
      if (elapsed >= timeoutMs) {
        clearInterval(checkInterval);
        handleIdleLogout();
      }
    }, 10 * 1000);

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleEvent);
      });
      clearInterval(checkInterval);
    };
  }, [timeoutMs, recordActivity, handleIdleLogout]);
};

export default useIdleTimeout;
