import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { BasePagination } from "./BasePagination";
import { Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect, useMemo } from "react";

export interface Column<T> {
  id?: string;
  header: React.ReactNode;
  headerString?: string;
  accessorKey: keyof T | string;
  cell?: (item: T, meta?: any) => React.ReactNode;
  className?: string;
  hideable?: boolean;
}

interface BaseTableProps<T> {
  data: T[];
  columns: Column<T>[];
  rowKey: (item: T) => string;
  className?: string;
  onRowClick?: (item: T) => void;
  loading?: boolean;
  // Pagination props
  page?: number;
  totalPages?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
  limit?: number;
  onLimitChange?: (limit: number) => void;
  meta?: any;
  footer?: React.ReactNode;
  // Column Visibility props
  tableId?: string;
  showColumnToggle?: boolean;
}

/**
 * Premium BaseTable dengan dukungan scroll horizontal, estetika halus, visibilitas kolom, dan paginasi.
 * 
 * @param tableId - ID unik untuk menyimpan visibilitas kolom di localStorage
 * @param showColumnToggle - Menampilkan tombol kustomisasi kolom (default: true)
 */
export function BaseTable<T>({
  data,
  columns,
  rowKey,
  className,
  onRowClick,
  loading,
  page,
  totalPages,
  totalItems,
  onPageChange,
  limit,
  onLimitChange,
  meta,
  footer,
  tableId,
  showColumnToggle = true,
}: BaseTableProps<T>) {
  // State untuk visibilitas kolom
  const [visibleColumnKeys, setVisibleColumnKeys] = useState<string[]>(() => {
    // Inisialisasi dengan semua kunci kolom
    return columns.map((col) => (col.id || col.accessorKey) as string);
  });

  // Load dari localStorage saat mount jika tableId tersedia
  useEffect(() => {
    if (tableId) {
      const saved = localStorage.getItem(`table_cols_${tableId}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            // Pastikan hanya memuat kolom yang memang ada di definisi saat ini
            const validKeys = columns.map((col) => (col.id || col.accessorKey) as string);
            const filtered = parsed.filter(key => validKeys.includes(key));
            setVisibleColumnKeys(filtered);
          }
        } catch (e) {
          console.error("Gagal memuat visibilitas kolom:", e);
        }
      }
    }
  }, [tableId, columns]);

  // Simpan ke localStorage saat berubah
  useEffect(() => {
    if (tableId) {
      localStorage.setItem(`table_cols_${tableId}`, JSON.stringify(visibleColumnKeys));
    }
  }, [visibleColumnKeys, tableId]);

  // Kolom yang difilter untuk dirender
  const filteredColumns = useMemo(() => {
    return columns.filter((col) => {
      const key = (col.id || col.accessorKey) as string;
      return visibleColumnKeys.includes(key);
    });
  }, [columns, visibleColumnKeys]);

  const toggleColumn = (key: string) => {
    setVisibleColumnKeys((prev) =>
      prev.includes(key)
        ? prev.filter((k) => k !== key)
        : [...prev, key]
    );
  };

  const showPagination =
    page !== undefined &&
    totalPages !== undefined &&
    onPageChange !== undefined &&
    totalItems !== undefined;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Table Header / Actions */}
      {showColumnToggle && (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-2 rounded-2xl border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-[#101D42]">
                <Settings2 className="size-4" />
                <span className="font-semibold text-xs">Atur Kolom</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-xl border-slate-100">
              <DropdownMenuLabel className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 py-1.5">
                Tampilkan Kolom
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-50" />
              <div className="max-h-64 overflow-y-auto">
                {columns.map((column) => {
                  const key = (column.id || column.accessorKey) as string;
                  const isVisible = visibleColumnKeys.includes(key);
                  const isHideable = column.hideable !== false;
                  
                  if (!isHideable && !isVisible) return null; // Safety check

                  return (
                    <DropdownMenuCheckboxItem
                      key={key}
                      checked={isVisible}
                      onCheckedChange={() => toggleColumn(key)}
                      disabled={!isHideable}
                      className="rounded-lg text-sm text-slate-600 focus:bg-slate-50 focus:text-[#101D42] data-[state=checked]:font-semibold"
                    >
                      {column.headerString || (typeof column.header === 'string' ? column.header : key)}
                    </DropdownMenuCheckboxItem>
                  );
                })}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      <div className="rounded-3xl border border-slate-100 bg-white overflow-hidden shadow-sm">
        <ScrollArea className="w-full">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent border-slate-100">
                {filteredColumns.map((column, idx) => (
                  <TableHead
                    key={idx}
                    className={cn(
                      "text-[10px] font-bold text-slate-400 uppercase tracking-widest py-4 h-auto",
                      column.className,
                    )}
                  >
                    {column.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={filteredColumns.length}
                    className="h-32 text-center text-slate-400"
                  >
                    Memuat data...
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={filteredColumns.length}
                    className="h-32 text-center text-slate-400"
                  >
                    Data tidak ditemukan
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item) => (
                  <TableRow
                    key={rowKey(item)}
                    className={cn(
                      "border-slate-50 transition-colors",
                      onRowClick && "cursor-pointer hover:bg-slate-50/30",
                    )}
                    onClick={() => onRowClick?.(item)}
                  >
                    {filteredColumns.map((column, idx) => (
                      <TableCell
                        key={idx}
                        className={cn(
                          "py-4 text-sm text-slate-600 font-medium",
                          column.className,
                        )}
                      >
                        {column.cell
                          ? column.cell(item, meta)
                          : (item[
                            column.accessorKey as keyof T
                          ] as React.ReactNode)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
            {footer && <TableFooter>{footer}</TableFooter>}
          </Table>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {/* Pagination Controls */}
      {showPagination && !loading && data.length > 0 && (
        <BasePagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalItems}
          onPageChange={onPageChange}
          limit={limit}
          onLimitChange={onLimitChange}
        />
      )}
    </div>
  );
}
