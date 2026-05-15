# Memori - Perubahan Besar

## 2026-05-15
### Fitur: Reset Saldo Virtual (Super Admin)
- Menambahkan fitur reset saldo untuk bucket Revenue, Allocation, dan Holding Commission.
- Menambahkan `ResetBalanceModal` component untuk konfirmasi penyesuaian saldo.
- Memperbarui `SaldoPage` dan `useSaldoPage` hook untuk mendukung aksi reset.
- Memperbarui `FinanceService` untuk integrasi dengan endpoint `/keuangan/central-balance/reset`.

## 2026-05-01
### Fitur: Pemilihan & Tampilan Metode Pembayaran di Customer Invoice Dialog
- Menambahkan dialog pemilihan metode pembayaran (Cash vs Xendit) sebelum memproses pembayaran invoice.
- Menambahkan tampilan rincian pembayaran (Metode & Sistem) untuk tagihan yang sudah lunas (paid).
- Menambahkan badge "Sistem Xendit" untuk pembayaran otomatis via Xendit.
- Memperbarui backend `getInvoicesByCustomer` di `invoice.service.ts` untuk menyertakan data `payments`.
- File yang berubah:
    - `Website/src/features/customers/components/CustomerInvoiceDialog.tsx`
    - `Server/src/core/invoice/invoice.service.ts`
