import { Info } from "lucide-react";

export function CollectionTooltip() {
    return (
        <div className="relative inline-flex items-center group">
            <Info className="w-3.5 h-3.5 text-slate-400 cursor-help ml-1 group-hover:text-indigo-500 transition-colors" />
            <div className="
                absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50
                w-64 px-3 py-3 rounded-xl shadow-2xl
                bg-slate-900 text-white text-xs leading-relaxed
                opacity-0 group-hover:opacity-100
                translate-y-2 group-hover:translate-y-0
                transition-all duration-300 pointer-events-none
                whitespace-normal
                border border-slate-700
            ">
                <p className="font-bold text-white mb-1.5 flex items-center gap-1.5">
                    <span className="text-sm">📊</span> Collection Rate
                </p>
                <div className="bg-slate-800/80 p-2 rounded-lg mb-2 mt-1 font-mono text-[10px] text-slate-200 border border-slate-700/50">
                    (Total Lunas / Total Diterbitkan) × 100%
                </div>
                <p className="text-slate-400 mt-1 text-[10px]">
                    Semakin tinggi persentase, semakin baik kinerja penagihan.
                </p>
                {/* Arrow */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-slate-900" />
            </div>
        </div>
    );
}

export function CollectionBar({ rate }: { rate: number }) {
    const color =
        rate >= 80 ? "bg-emerald-500" :
        rate >= 60 ? "bg-amber-500" :
        "bg-rose-500";
    
    const textColor = 
        rate >= 80 ? "text-emerald-600" : 
        rate >= 60 ? "text-amber-600" : 
        "text-rose-600";

    return (
        <div className="flex items-center gap-3 w-full max-w-[130px]">
            <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden shadow-inner">
                <div
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${color}`}
                    style={{ width: `${Math.min(rate, 100)}%` }}
                />
            </div>
            <span className={`text-[12px] font-extrabold w-10 text-right tracking-tight ${textColor}`}>
                {rate}%
            </span>
        </div>
    );
}

export function RoleBadge({ role }: { role: string }) {
    const map: Record<string, { label: string; cls: string }> = {
        SUPERVISOR: { label: "Supervisor", cls: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200" },
        SALES: { label: "Sales", cls: "bg-blue-50 text-blue-700 border-blue-200" },
        ADMIN_UNIT: { label: "Admin Unit", cls: "bg-teal-50 text-teal-700 border-teal-200" },
    };
    const info = map[role] ?? { label: role, cls: "bg-slate-50 text-slate-600 border-slate-200" };
    
    return (
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${info.cls}`}>
            {info.label}
        </span>
    );
}
