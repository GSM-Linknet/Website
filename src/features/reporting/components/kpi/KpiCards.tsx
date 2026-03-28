export function KpiSummaryCard({
    label,
    value,
    icon: Icon,
    color,
    sub,
}: {
    label: string;
    value: string | number;
    icon: any;
    color: string; // Tailwind border color class e.g. "border-indigo-200"
    sub?: string;
}) {
    // Generate an accent background dynamically from the border color
    const bgAccent = color.replace('border-', 'bg-');
    const textAccent = color.replace('border-', 'text-');

    return (
        <div className={`relative overflow-hidden rounded-2xl p-5 border ${color} bg-white shadow-sm hover:shadow-md transition-all duration-300 group`}>
            <div className="flex items-start justify-between relative z-10">
                <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 group-hover:text-slate-500 transition-colors">{label}</p>
                    <p className="text-2xl font-black text-slate-800 tracking-tight">{value}</p>
                    {sub && <p className="text-[10px] font-medium text-slate-400 mt-2">{sub}</p>}
                </div>
                <div className={`p-2.5 rounded-xl bg-slate-50 group-hover:${bgAccent} group-hover:bg-opacity-20 transition-all duration-300 transform group-hover:scale-110`}>
                    <Icon className={`w-5 h-5 text-slate-500 group-hover:${textAccent} transition-colors duration-300`} />
                </div>
            </div>
            {/* Subtle bottom accent line */}
            <div className={`absolute bottom-0 left-0 right-0 h-1 opacity-20 ${bgAccent} transition-opacity duration-300 group-hover:opacity-60`} />
        </div>
    );
}
