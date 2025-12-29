import {
    AreaChart as RechartsAreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart as RechartsBarChart,
    Bar,
    PieChart as RechartsPieChart,
    Pie,
    Cell,
    Legend
} from "recharts";

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

export function AreaChart({ data, xKey, yKey, color = "#3B82F6" }: { data: any[]; xKey: string; yKey: string; color?: string }) {
    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <RechartsAreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id={`color${yKey}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis
                        dataKey={xKey}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#64748B", fontSize: 12 }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#64748B", fontSize: 12 }}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: "#1E293B", borderRadius: "12px", border: "none", color: "#F8FAFC" }}
                        itemStyle={{ color: "#F8FAFC" }}
                        cursor={{ stroke: color, strokeWidth: 2 }}
                    />
                    <Area
                        type="monotone"
                        dataKey={yKey}
                        stroke={color}
                        strokeWidth={3}
                        fillOpacity={1}
                        fill={`url(#color${yKey})`}
                    />
                </RechartsAreaChart>
            </ResponsiveContainer>
        </div>
    );
}

export function BarChart({ data, xKey, yKeys }: { data: any[]; xKey: string; yKeys: string[] }) {
    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis
                        dataKey={xKey}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#64748B", fontSize: 12 }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#64748B", fontSize: 12 }}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: "#1E293B", borderRadius: "12px", border: "none", color: "#F8FAFC" }}
                        cursor={{ fill: "#F1F5F9" }}
                    />
                    <Legend wrapperStyle={{ paddingTop: "20px" }} />
                    {yKeys.map((key, index) => (
                        <Bar
                            key={key}
                            dataKey={key}
                            fill={COLORS[index % COLORS.length]}
                            radius={[6, 6, 0, 0]}
                            maxBarSize={50}
                        />
                    ))}
                </RechartsBarChart>
            </ResponsiveContainer>
        </div>
    );
}

export function PieChart({ data, dataKey, nameKey }: { data: any[]; dataKey: string; nameKey: string }) {
    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey={dataKey}
                        nameKey={nameKey}
                    >
                        {data.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{ backgroundColor: "#1E293B", borderRadius: "12px", border: "none", color: "#F8FAFC" }}
                    />
                    <Legend
                        layout="vertical"
                        verticalAlign="middle"
                        align="right"
                        iconType="circle"
                        wrapperStyle={{ fontSize: "12px", fontWeight: "600", color: "#475569" }}
                    />
                </RechartsPieChart>
            </ResponsiveContainer>
        </div>
    );
}
