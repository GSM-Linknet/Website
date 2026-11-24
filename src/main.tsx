/**
 * src/main.tsx
 * Tujuan      : Entry point utama aplikasi React SPA GSM Dashboard.
 * Dipakai oleh: index.html (Vite bundler entry point).
 * Dependensi  : react, react-dom/client, App.tsx, index.css.
 * Fungsi utama: Mounting React root ke DOM (#root), listener otomatis chunk error (vite:preloadError).
 * Side effects: Manipulasi DOM root, registrasi global window event listener, sessionStorage I/O, auto hard-reload browser.
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Menangani chunk load error saat ada deploy baru di server
window.addEventListener('vite:preloadError', () => {
  const reloadKey = 'app_preload_error_reload';
  const hasReloaded = sessionStorage.getItem(reloadKey);

  if (!hasReloaded) {
    sessionStorage.setItem(reloadKey, 'true');
    window.location.reload(); // Reload otomatis untuk ambil versi bundle terbaru
  } else {
    sessionStorage.removeItem(reloadKey);
  }
});

// Bersihkan flag jika aplikasi berhasil memuat halaman secara normal
window.addEventListener('load', () => {
  sessionStorage.removeItem('app_preload_error_reload');
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

