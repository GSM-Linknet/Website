import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BasePaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    totalItems: number;
    limit?: number;
    onLimitChange?: (limit: number) => void;
    className?: string;
}

export function BasePagination({
    currentPage,
    totalPages,
    onPageChange,
    totalItems,
    limit = 10,
    onLimitChange,
    className,
}: BasePaginationProps) {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;

        let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let end = Math.min(totalPages, start + maxVisible - 1);

        if (end - start + 1 < maxVisible) {
            start = Math.max(1, end - maxVisible + 1);
        }

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        return pages;
    };

    const startItem = (currentPage - 1) * limit + 1;
    const endItem = Math.min(currentPage * limit, totalItems);

    return (
        <div className={cn("flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-4", className)}>
            {/* Search Info */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 font-medium order-2 sm:order-1">
                <div>
                    Menampilkan <span className="text-[#101D42] font-bold">{startItem}-{endItem}</span> dari <span className="text-[#101D42] font-bold">{totalItems}</span> data
                </div>
                
                {onLimitChange && (
                    <div className="flex items-center gap-2 border-l border-slate-200 pl-4 ml-0 sm:ml-2">
                        <span>Tampilkan:</span>
                        <select
                            value={limit}
                            onChange={(e) => onLimitChange(Number(e.target.value))}
                            className="bg-transparent font-bold text-[#101D42] focus:outline-none cursor-pointer"
                        >
                            {[10, 25, 50, 100].map(val => (
                                <option key={val} value={val}>{val}</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-1 order-1 sm:order-2">
                {/* First Page */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onPageChange(1)}
                    disabled={currentPage === 1}
                    className="h-8 w-8 rounded-lg text-slate-400 hover:text-[#101D42] hover:bg-slate-100 disabled:opacity-30"
                >
                    <ChevronsLeft size={16} />
                </Button>

                {/* Prev Page */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="h-8 w-8 rounded-lg text-slate-400 hover:text-[#101D42] hover:bg-slate-100 disabled:opacity-30"
                >
                    <ChevronLeft size={16} />
                </Button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1 px-1">
                    {getPageNumbers().map((pageNum) => (
                        <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "ghost"}
                            onClick={() => onPageChange(pageNum)}
                            className={cn(
                                "h-8 w-8 rounded-lg text-xs font-bold transition-all",
                                currentPage === pageNum
                                    ? "bg-[#101D42] text-white shadow-lg shadow-blue-900/20"
                                    : "text-slate-500 hover:text-[#101D42] hover:bg-slate-100"
                            )}
                        >
                            {pageNum}
                        </Button>
                    ))}
                </div>

                {/* Next Page */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="h-8 w-8 rounded-lg text-slate-400 hover:text-[#101D42] hover:bg-slate-100 disabled:opacity-30"
                >
                    <ChevronRight size={16} />
                </Button>

                {/* Last Page */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onPageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className="h-8 w-8 rounded-lg text-slate-400 hover:text-[#101D42] hover:bg-slate-100 disabled:opacity-30"
                >
                    <ChevronsRight size={16} />
                </Button>
            </div>
        </div>
    );
}
