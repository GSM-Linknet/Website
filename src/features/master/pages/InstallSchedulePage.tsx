import { Clock, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { InteractiveCalendar } from "@/components/shared/InteractiveCalendar";

export default function InstallSchedulePage() {
    // Mock data for schedules
    const schedules = [
        { id: "1", customer: "Bapak Hadi", address: "Jl. Merdeka No. 10", time: "09:00", status: "Confirmed", tech: "Ahmad" },
        { id: "2", customer: "Ibu Siti", address: "Gg. Kelinci II", time: "11:00", status: "Pending", tech: "Budi" },
        { id: "3", customer: "PT. Maju Jaya", address: "Kawasan Industri", time: "14:00", status: "Confirmed", tech: "Citra" },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-[#101D42]">Jadwal Pemasangan</h1>
                    <p className="text-sm text-slate-500">Master kalender jadwal instalasi pelanggan baru</p>
                </div>
                <div className="flex gap-2">
                    <Badge variant="outline" className="bg-white border-slate-200 text-slate-500 font-bold px-4 py-2 rounded-xl">
                        Desember 2025
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
                {/* Simplified Calendar View Placeholder */}
                {/* Interactive Calendar */}
                <div className="lg:col-span-5 flex flex-col gap-4">
                    <InteractiveCalendar
                        mode="single"
                        className="w-full h-full min-h-[500px] flex flex-col bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 p-6"
                        classNames={{
                            month: "space-y-4 w-full h-full flex flex-col",
                            table: "w-full border-collapse space-y-1 h-full flex-1",
                            head_row: "flex w-full justify-between",
                            head_cell: "text-slate-400 w-full font-bold text-sm uppercase tracking-wider py-4",
                            row: "flex w-full mt-2 justify-between flex-1",
                            cell: "h-full w-full text-center text-sm p-0 relative",
                            day: "h-full w-full p-2 font-normal aria-selected:opacity-100 rounded-xl hover:bg-slate-50 hover:text-blue-600 transition-all flex flex-col items-center justify-start gap-1",
                            day_today: "bg-blue-50/50 text-blue-700 font-bold border-2 border-blue-100",
                        }}
                    />
                </div>

                {/* Daily Agenda */}
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2 px-1">
                        <Clock size={18} className="text-blue-500" />
                        Agenda Hari Ini
                    </h3>
                    {schedules.map((item) => (
                        <Card key={item.id} className="border-none shadow-lg shadow-slate-200/40 rounded-2xl overflow-hidden hover:translate-x-1 transition-transform cursor-pointer group">
                            <div className={`h-1 w-full ${item.status === 'Confirmed' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                            <CardContent className="p-4 space-y-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-black text-[#101D42]">{item.customer}</p>
                                        <p className="text-[10px] font-bold text-blue-500 uppercase tracking-tighter">{item.tech}</p>
                                    </div>
                                    <Badge className={item.status === 'Confirmed' ? 'bg-emerald-500' : 'bg-amber-500'}>
                                        {item.status}
                                    </Badge>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                        <Clock size={12} /> {item.time} WIB
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                        <MapPin size={12} /> {item.address}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
