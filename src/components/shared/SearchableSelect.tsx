import * as React from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Option {
    id: string;
    name: string;
    [key: string]: any;
}

interface SearchableSelectProps {
    options: Option[];
    value?: string | null;
    onValueChange: (value: string) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    emptyMessage?: string;
    className?: string;
    disabled?: boolean;
}

export function SearchableSelect({
    options,
    value,
    onValueChange,
    placeholder = "Pilih item...",
    searchPlaceholder = "Cari...",
    emptyMessage = "Tidak ada hasil ditemukan.",
    className,
    disabled = false,
}: SearchableSelectProps) {
    const [open, setOpen] = React.useState(false);
    const [search, setSearch] = React.useState("");
    const containerRef = React.useRef<HTMLDivElement>(null);

    const selectedOption = options.find((opt) => opt.id === value);

    const filteredOptions = options.filter((opt) =>
        opt.name.toLowerCase().includes(search.toLowerCase())
    );

    // Close when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className={cn("relative w-full", className)} ref={containerRef}>
            <Button
                type="button"
                variant="outline"
                role="combobox"
                aria-expanded={open}
                disabled={disabled}
                onClick={() => setOpen(!open)}
                className={cn(
                    "w-full h-11 justify-between rounded-xl border-slate-200 bg-white font-medium text-slate-700 hover:bg-slate-50 transition-all",
                    !value && "text-slate-400 font-normal"
                )}
            >
                <span className="truncate">
                    {selectedOption ? selectedOption.name : placeholder}
                </span>
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>

            {open && (
                <div className="absolute z-50 mt-2 w-full min-w-[200px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-center border-b border-slate-100 px-3 py-2">
                        <Search className="mr-2 h-4 w-4 shrink-0 text-slate-400" />
                        <Input
                            placeholder={searchPlaceholder}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-9 w-full border-none bg-transparent p-0 text-sm focus-visible:ring-0 shadow-none placeholder:text-slate-400"
                            autoFocus
                        />
                        {search && (
                            <X
                                className="ml-2 h-4 w-4 shrink-0 cursor-pointer text-slate-400 hover:text-slate-600"
                                onClick={() => setSearch("")}
                            />
                        )}
                    </div>

                    <ScrollArea className="max-h-60 overflow-y-auto">
                        <div className="p-1">
                            {filteredOptions.length === 0 ? (
                                <div className="py-6 text-center text-sm text-slate-500">
                                    {emptyMessage}
                                </div>
                            ) : (
                                filteredOptions.map((option) => {
                                    const isSelected = value === option.id;
                                    return (
                                        <div
                                            key={option.id}
                                            onClick={() => {
                                                onValueChange(option.id);
                                                setOpen(false);
                                                setSearch("");
                                            }}
                                            className={cn(
                                                "relative flex w-full cursor-pointer select-none items-center rounded-xl px-3 py-2.5 text-sm outline-none transition-colors",
                                                isSelected
                                                    ? "bg-blue-50 text-blue-700 font-bold"
                                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                            )}
                                        >
                                            <div className="flex flex-1 items-center gap-2 truncate">
                                                {option.name}
                                                {option.role && (
                                                    <span className="text-[10px] font-bold uppercase py-0.5 px-1.5 rounded-full bg-slate-100 text-slate-500">
                                                        {option.role}
                                                    </span>
                                                )}
                                            </div>
                                            {isSelected && (
                                                <Check className="h-4 w-4 shrink-0 text-blue-600" strokeWidth={3} />
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </ScrollArea>
                </div>
            )}
        </div>
    );
}
