import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { DEFAULT_PAGE_SIZE } from '../constants/report.constants';
import type { PaginatedData } from '../types/report.types';
import { BaseTable, type Column as BaseColumn } from '@/components/shared/BaseTable';

interface Column<T> {
    key: string;
    header: string;
    sortable?: boolean;
    render?: (value: any, row: T) => React.ReactNode;
    width?: string;
}

interface ReportDataTableProps<T> {
    data: T[] | PaginatedData<T>;
    columns: Column<T>[];
    searchable?: boolean;
    searchPlaceholder?: string;
    emptyMessage?: string;
    loading?: boolean;
    // Server-side pagination props
    serverSide?: boolean;
    totalItems?: number;
    page?: number;
    limit?: number;
    onPageChange?: (page: number) => void;
    onPageSizeChange?: (size: number) => void;
}

export function ReportDataTable<T extends Record<string, any>>({
    data,
    columns,
    searchable = true,
    searchPlaceholder = 'Cari...',
    loading = false,
    serverSide = false,
    totalItems: externalTotalItems,
    page: externalPage,
    limit: externalLimit,
    onPageChange,
    onPageSizeChange,
}: ReportDataTableProps<T>) {
    // Extract items and meta
    const { items, meta } = useMemo(() => {
        if (Array.isArray(data)) return { items: data, meta: undefined };
        if (data && typeof data === 'object' && 'items' in data) {
            const items = (data as any).items;
            const meta = (data as any).meta || {
                page: (data as any).page,
                limit: (data as any).limit,
                totalItems: (data as any).totalItems,
                totalPages: (data as any).totalPages,
            };
            
            // Only return meta if at least totalItems is present
            return { 
                items, 
                meta: meta.totalItems !== undefined ? meta : undefined 
            };
        }
        return { items: [], meta: undefined };
    }, [data]);


    const [searchTerm, setSearchTerm] = useState('');
    
    // Internal pagination state (used only if not serverSide)
    const [internalPage, setInternalPage] = useState(1);
    const [internalLimit, setInternalLimit] = useState(DEFAULT_PAGE_SIZE);

    // Sync with external state or use internal
    const currentPage = serverSide ? (externalPage ?? 1) : internalPage;
    const pageSize = serverSide ? (externalLimit ?? DEFAULT_PAGE_SIZE) : internalLimit;

    // Filter data based on search term (only for client-side)
    const filteredData = useMemo(() => {
        if (serverSide || !searchTerm) return items;

        return items.filter((row: T) =>
            Object.values(row).some((value) =>
                String(value).toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
    }, [items, searchTerm, serverSide]);

    // For now, client-side sorting is disabled to match BaseTable's current feature set
    const displayData = useMemo(() => {
        if (serverSide) return items;
        const startIndex = (currentPage - 1) * pageSize;
        return filteredData.slice(startIndex, startIndex + pageSize);
    }, [items, filteredData, currentPage, pageSize, serverSide]);

    // Calculate totals
    const totalCount = serverSide 
        ? (externalTotalItems ?? meta?.totalItems ?? items.length)
        : filteredData.length;
    
    const totalPages = Math.ceil(totalCount / pageSize);

    const handlePageChange = (pageNum: number) => {
        const newPage = Math.max(1, Math.min(pageNum, totalPages));
        if (serverSide && onPageChange) {
            onPageChange(newPage);
        } else {
            setInternalPage(newPage);
        }
    };

    const handleLimitChange = (size: number) => {
        if (serverSide && onPageSizeChange) {
            onPageSizeChange(size);
        } else {
            setInternalLimit(size);
            setInternalPage(1);
        }
    };

    // Map columns to BaseTable format
    const baseColumns: BaseColumn<T>[] = columns.map(col => ({
        header: col.header,
        accessorKey: col.key,
        className: col.width ? `w-[${col.width}]` : undefined,
        cell: (item: T) => col.render ? col.render(item[col.key], item) : item[col.key]
    }));

    return (
        <div className="space-y-4">
            {/* Search Input (Keep it here since BaseTable doesn't have it) */}
            {searchable && (
                <div className="relative max-w-sm mb-2">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder={searchPlaceholder}
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            handlePageChange(1);
                        }}
                        className="w-full pl-11 pr-4 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 transition-all text-sm font-medium outline-none"
                    />
                </div>
            )}

            {/* Base Table Implementation */}
            <BaseTable
                data={displayData}
                columns={baseColumns}
                rowKey={(item: T) => item.id || Math.random().toString()}
                loading={loading}
                page={currentPage}
                totalPages={totalPages}
                totalItems={totalCount}
                onPageChange={handlePageChange}
                limit={pageSize}
                onLimitChange={handleLimitChange}
            />
        </div>
    );
}
