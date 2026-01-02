import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SearchInputProps {
    onSearch: (value: string) => void;
    placeholder?: string;
    className?: string;
    defaultValue?: string;
    debounceMs?: number;
}

export function SearchInput({
    onSearch,
    placeholder = "Cari data...",
    className,
    defaultValue = "",
    debounceMs = 500,
}: SearchInputProps) {
    const [value, setValue] = useState(defaultValue);
    const onSearchRef = useRef(onSearch);

    // Sync ref when onSearch changes
    useEffect(() => {
        onSearchRef.current = onSearch;
    }, [onSearch]);

    useEffect(() => {
        const timer = setTimeout(() => {
            onSearchRef.current(value);
        }, debounceMs);

        return () => clearTimeout(timer);
    }, [value, debounceMs]);

    return (
        <div className={cn("relative w-full max-w-sm", className)}>
            <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <Input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={placeholder}
                className="pl-10 h-11 bg-white border-slate-200 rounded-xl focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-700 placeholder:text-slate-400"
            />
        </div>
    );
}
