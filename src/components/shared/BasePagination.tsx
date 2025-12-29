import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BasePaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    totalItems: number;
    limit?: number;
    className?: string;
}

export function BasePagination({
    currentPage,
    totalPages,
    onPageChange,
    totalItems,
    limit = 10,
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
            <div className="text-sm text-slate-500 font-medium order-2 sm:order-1">
                Menampilkan <span className="text-[#101D42] font-bold">{startItem}-{endItem}</span> dari <span className="text-[#101D42] font-bold">{totalItems}</span> data
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
