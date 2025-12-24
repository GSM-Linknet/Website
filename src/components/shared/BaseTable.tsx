import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface Column<T> {
    header: string;
    accessorKey: keyof T | string;
    cell?: (item: T) => React.ReactNode;
    className?: string;
}

interface BaseTableProps<T> {
    data: T[];
    columns: Column<T>[];
    rowKey: (item: T) => string;
    className?: string;
    onRowClick?: (item: T) => void;
    loading?: boolean;
}

/**
 * Premium BaseTable with horizontal scrolling support and refined aesthetics.
 */
export function BaseTable<T>({
    data,
    columns,
    rowKey,
    className,
    onRowClick,
    loading,
}: BaseTableProps<T>) {
    return (
        <div className={cn("rounded-3xl border border-slate-100 bg-white overflow-hidden shadow-sm", className)}>
            <ScrollArea className="w-full">
                <Table>
                    <TableHeader className="bg-slate-50/50">
                        <TableRow className="hover:bg-transparent border-slate-100">
                            {columns.map((column, idx) => (
                                <TableHead key={idx} className={cn("text-[10px] font-bold text-slate-400 uppercase tracking-widest py-4 h-auto", column.className)}>
                                    {column.header}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-32 text-center text-slate-400">
                                    Memuat data...
                                </TableCell>
                            </TableRow>
                        ) : data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-32 text-center text-slate-400">
                                    Data tidak ditemukan
                                </TableCell>
                            </TableRow>
                        ) : (
                            data.map((item) => (
                                <TableRow
                                    key={rowKey(item)}
                                    className={cn("border-slate-50 transition-colors", onRowClick && "cursor-pointer hover:bg-slate-50/30")}
                                    onClick={() => onRowClick?.(item)}
                                >
                                    {columns.map((column, idx) => (
                                        <TableCell key={idx} className={cn("py-4 text-sm text-slate-600 font-medium", column.className)}>
                                            {column.cell ? column.cell(item) : (item[column.accessorKey as keyof T] as React.ReactNode)}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
        </div>
    );
}
