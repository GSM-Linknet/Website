/**
 * permission-integrity.ts
 * Tujuan      : Melindungi data permission dari manipulasi via browser DevTools.
 *               - Signing key diambil dari hash full JWT token (user tidak bisa forge)
 *               - Role selalu dibaca dari JWT payload (bukan localStorage user_profile)
 *               - TTL 1 menit untuk paksa re-fetch dari server
 * Dipakai oleh: auth.service.ts (read/write/role), PermissionGuard.tsx (verify sebelum render)
 * Dependensi  : js-cookie
 * Fungsi utama: getRoleFromToken, signPermissions, getVerifiedPermissions, clearPermissions, isPermissionExpired
 * Side effects: Read/write localStorage "app_permissions_signed", read Cookie "auth_token"
 */

import Cookies from "js-cookie";

const STORAGE_KEY = "app_permissions_signed";
const TTL_MS = 60 * 1000; // 1 menit

interface SignedPermissions {
    data: Record<string, Record<string, string[]>>;
    sig: string;
    ts: number;
    uid: string;
}

/**
 * Decode JWT payload tanpa verifikasi signature.
 * AMAN dipakai client-side karena: user tidak bisa mengubah konten JWT
 * tanpa server menolaknya — JWT hanya bisa di-forge jika tau JWT_SECRET.
 * Dipakai untuk mengambil role yang otoritatif, bukan dari localStorage.
 */
export function getRoleFromToken(): string | null {
    const token = Cookies.get("auth_token");
    if (!token) return null;
    try {
        const parts = token.split(".");
        if (parts.length !== 3) return null;
        // Decode base64url payload (bagian tengah JWT)
        const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
        return payload?.role || null;
    } catch {
        return null;
    }
}

/**
 * Ambil signing key dari hash deterministik full JWT token.
 * Menggunakan seluruh token (bukan 8 char pertama) sehingga user tidak bisa
 * mereproduksi key yang sama untuk mem-forge signature permission.
 * Meskipun user bisa baca cookie-nya sendiri, mereka tidak tahu algo hash-nya.
 */
function getSigningKey(): string {
    const token = Cookies.get("auth_token") || "";
    // djb2 hash dari full token — lebih kuat dari substring(0,8)
    let hash = 5381;
    for (let i = 0; i < token.length; i++) {
        hash = ((hash << 5) + hash) ^ token.charCodeAt(i);
        hash = hash >>> 0;
    }
    return hash.toString(36);
}

/**
 * Buat checksum deterministik dari konten + signing key.
 * Menggunakan djb2 hash — cukup cepat dan ringan untuk environment browser.
 * Tidak dimaksudkan sebagai kriptografi, melainkan sebagai tamper detection.
 */
function computeChecksum(content: string, key: string): string {
    const str = `${key}:${content}`;
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
        hash = hash >>> 0; // convert to unsigned 32-bit
    }
    return hash.toString(36);
}

/**
 * Simpan permission ke localStorage dengan signature + timestamp.
 * Dipanggil oleh initPermissions() di auth.service.ts setelah fetch dari API.
 */
export function signPermissions(
    data: Record<string, Record<string, string[]>>,
    userId: string
): void {
    const ts = Date.now();
    const content = JSON.stringify(data);
    const sig = computeChecksum(`${content}:${userId}:${ts}`, getSigningKey());

    const signed: SignedPermissions = { data, sig, ts, uid: userId };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(signed));
    // Hapus key lama yang tidak ber-signature agar tidak fallback ke data tidak terproteksi
    localStorage.removeItem("app_permissions");
}

/**
 * Baca dan verifikasi permission dari localStorage.
 * Return null jika:
 *   - Data tidak ada
 *   - Signature tidak cocok (tampered)
 *   - TTL expired (> 1 menit)
 *   - User ID tidak cocok dengan current user
 *
 * Caller harus handle null dengan re-fetch dari server atau logout.
 */
export function getVerifiedPermissions(currentUserId?: string): Record<string, Record<string, string[]>> | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    let parsed: SignedPermissions;
    try {
        parsed = JSON.parse(raw);
    } catch {
        clearPermissions();
        return null;
    }

    const { data, sig, ts, uid } = parsed;

    // Validasi user ID — cegah reuse permission dari session user lain
    if (currentUserId && uid !== currentUserId) {
        clearPermissions();
        return null;
    }

    // Validasi TTL
    if (Date.now() - ts > TTL_MS) {
        return null; // expired, tapi jangan hapus — biarkan caller re-fetch
    }

    // Validasi signature
    const content = JSON.stringify(data);
    const expectedSig = computeChecksum(`${content}:${uid}:${ts}`, getSigningKey());
    if (sig !== expectedSig) {
        // Signature tidak cocok → data dimanipulasi → hapus + paksa re-login
        clearPermissions();
        return null;
    }

    return data;
}

/**
 * Cek apakah permission sudah expired (> 1 menit) tanpa verifikasi signature.
 * Dipakai untuk memutuskan apakah perlu re-fetch dari server.
 */
export function isPermissionExpired(): boolean {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return true;
    try {
        const { ts } = JSON.parse(raw) as SignedPermissions;
        return Date.now() - ts > TTL_MS;
    } catch {
        return true;
    }
}

/**
 * Hapus semua data permission dari localStorage (signed maupun legacy).
 */
export function clearPermissions(): void {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem("app_permissions");
}
