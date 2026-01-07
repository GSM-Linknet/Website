import { useState, useMemo, useEffect } from "react";
import { Paper, ThemeProvider, createTheme } from '@mui/material';
import { ViewState } from '@devexpress/dx-react-scheduler';
import {
    Scheduler,
    MonthView,
    WeekView,
    Toolbar,
    DateNavigator,
    Appointments,
    TodayButton,
    ViewSwitcher,
} from '@devexpress/dx-react-scheduler-material-ui';
import { Clock, MapPin, Plus, Search, Building2, LayoutGrid, Trash2, Edit2, Calendar, User, Filter, X, RotateCcw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useSchedule } from "../../master/hooks/useSchedule";
import { useUnit } from "../../master/hooks/useUnit";
import { useSubUnit } from "../../master/hooks/useSubUnit";
import { ScheduleModal } from "../components/ScheduleModal";
import { DeleteConfirmationModal } from "@/components/shared/DeleteConfirmationModal";
import type { Schedule } from "@/services/master.service";

// Custom Theme to match RDN Brand
const theme = createTheme({
    palette: {
        primary: {
            main: '#101D42',
        },
        secondary: {
            main: '#3B82F6',
        },
        info: {
            main: '#0EA5E9',
        },
        success: {
            main: '#22C55E',
        },
        warning: {
            main: '#F59E0B',
        },
        error: {
            main: '#EF4444',
        },
    },
    typography: {
        fontFamily: 'inherit',
    },
    components: {
        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: '1.5rem',
                    boxShadow: 'none',
                    border: '1px solid #F1F5F9',
                },
            },
        },
    },
});

export default function InstallSchedulePage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [selectedUnitId, setSelectedUnitId] = useState<string>("all");
    const [selectedSubUnitId, setSelectedSubUnitId] = useState<string>("all");
    const [selectedStatus, setSelectedStatus] = useState<string>("all");

    // Modals
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [scheduleToDelete, setScheduleToDelete] = useState<Schedule | null>(null);

    // Filters
    const queryParams = useMemo(() => {
        const whereFilters = [];
        if (selectedUnitId !== "all") whereFilters.push(`unitId:${selectedUnitId}`);
        if (selectedSubUnitId !== "all") whereFilters.push(`subUnitId:${selectedSubUnitId}`);
        if (selectedStatus !== "all") whereFilters.push(`status:${selectedStatus}`);

        return {
            search: debouncedSearch ? `title:${debouncedSearch}` : undefined,
            where: whereFilters.length > 0 ? whereFilters.join('|') : undefined,
            paginate: false
        };
    }, [debouncedSearch, selectedUnitId, selectedSubUnitId, selectedStatus]);

    const {
        schedules,
        loading: isLoading,
        create,
        update,
        remove: deleteSchedule,
        isProcessing
    } = useSchedule(queryParams);

    const { data: units } = useUnit({ paginate: false });
    const { data: subUnits } = useSubUnit({
        paginate: false,
        unitId: selectedUnitId !== "all" ? selectedUnitId : undefined
    });

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Format appointments for DevExpress
    const appointments = useMemo(() => {
        return schedules.map(s => ({
            id: s.id,
            title: s.title,
            startDate: new Date(s.startTime),
            endDate: new Date(s.endTime),
            location: s.location || s.customer?.address || "-",
            tech: s.technician?.user?.name || "Belum Ditentukan",
            status: s.status,
            customerName: s.customer?.name || "Unknown",
            original: s
        }));
    }, [schedules]);

    const handleAdd = () => {
        setSelectedSchedule(null);
        setIsModalOpen(true);
    };

    const handleEdit = (schedule: any) => {
        setSelectedSchedule(schedule.original);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (schedule: any) => {
        setScheduleToDelete(schedule.original);
        setIsDeleteModalOpen(true);
    };

    const handleResetFilters = () => {
        setSearchQuery("");
        setDebouncedSearch("");
        setSelectedUnitId("all");
        setSelectedSubUnitId("all");
        setSelectedStatus("all");
    };

    const todayAgenda = useMemo(() => {
        const today = new Date().toDateString();
        return appointments.filter(apt => apt.startDate.toDateString() === today);
    }, [appointments]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#101D42]">Jadwal Pemasangan</h1>
                    <p className="text-sm text-slate-500 font-medium">Dashboard monitoring & manajemen jadwal instalasi teknisi</p>
                </div>
                <Button
                    onClick={handleAdd}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 py-5 shadow-lg shadow-blue-200/50 flex items-center gap-2 group transition-all"
                >
                    <Plus size={18} className="group-hover:rotate-90 transition-transform" />
                    Tambah Jadwal
                </Button>
            </div>

            <Card className="border-none shadow-xl shadow-slate-200/40 rounded-3xl overflow-hidden relative">
                {isLoading && (
                    <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] z-50 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                            <p className="text-sm font-bold text-blue-600 animate-pulse">Memuat Jadwal...</p>
                        </div>
                    </div>
                )}
                <CardContent className="p-6">
                    <div className="flex flex-wrap items-center gap-4 mb-8">
                        <div className="relative group w-full md:w-80">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                            <Input
                                placeholder="Cari jadwal, teknisi, pelanggan..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-11 pr-10 py-6 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-2 bg-slate-100/30 p-1.5 rounded-2xl border border-slate-100">
                                <Select value={selectedUnitId} onValueChange={(v) => { setSelectedUnitId(v); setSelectedSubUnitId("all"); }}>
                                    <SelectTrigger className="w-[140px] md:w-[180px] border-none bg-transparent hover:bg-white rounded-xl shadow-none focus:ring-0 transition-all font-bold text-slate-600 text-xs">
                                        <div className="flex items-center gap-2">
                                            <Building2 size={14} className="text-blue-500" />
                                            <SelectValue placeholder="Pilih Unit" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-slate-100">
                                        <SelectItem value="all" className="font-bold text-slate-600">Semua Unit</SelectItem>
                                        {units?.map((u: any) => (
                                            <SelectItem key={u.id} value={u.id} className="font-medium">{u.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <div className="w-px h-6 bg-slate-200" />

                                <Select value={selectedSubUnitId} onValueChange={setSelectedSubUnitId} disabled={selectedUnitId === "all"}>
                                    <SelectTrigger className="w-[140px] md:w-[180px] border-none bg-transparent hover:bg-white rounded-xl shadow-none focus:ring-0 transition-all font-bold text-slate-600 disabled:opacity-50 text-xs">
                                        <div className="flex items-center gap-2">
                                            <LayoutGrid size={14} className="text-blue-500" />
                                            <SelectValue placeholder="Sub-Unit" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-slate-100">
                                        <SelectItem value="all" className="font-bold text-slate-600">Semua Sub-Unit</SelectItem>
                                        {subUnits?.map((s: any) => (
                                            <SelectItem key={s.id} value={s.id} className="font-medium">{s.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <div className="w-px h-6 bg-slate-200" />

                                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                    <SelectTrigger className="w-[140px] md:w-[160px] border-none bg-transparent hover:bg-white rounded-xl shadow-none focus:ring-0 transition-all font-bold text-slate-600 text-xs">
                                        <div className="flex items-center gap-2">
                                            <Filter size={14} className="text-blue-500" />
                                            <SelectValue placeholder="Status" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-slate-100">
                                        <SelectItem value="all" className="font-bold text-slate-600">Semua Status</SelectItem>
                                        <SelectItem value="scheduled" className="font-medium">Scheduled</SelectItem>
                                        <SelectItem value="in_progress" className="font-medium">In Progress</SelectItem>
                                        <SelectItem value="completed" className="font-medium">Completed</SelectItem>
                                        <SelectItem value="cancelled" className="font-medium">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {(selectedUnitId !== "all" || selectedSubUnitId !== "all" || selectedStatus !== "all" || searchQuery !== "") && (
                                <Button
                                    variant="ghost"
                                    onClick={handleResetFilters}
                                    className="rounded-xl px-4 py-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all gap-2 text-xs font-bold"
                                >
                                    <RotateCcw size={14} />
                                    Reset
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
                        <div className="lg:col-span-5">
                            <ThemeProvider theme={theme}>
                                <Paper className="overflow-hidden">
                                    <Scheduler data={appointments} locale="id-ID">
                                        <ViewState defaultCurrentDate={new Date()} />
                                        <MonthView />
                                        <WeekView startDayHour={7} endDayHour={20} />
                                        <Toolbar />
                                        <DateNavigator />
                                        <TodayButton />
                                        <ViewSwitcher />
                                        <Appointments
                                            appointmentComponent={(props) => (
                                                <Appointments.Appointment
                                                    {...props}
                                                    onClick={() => handleEdit(props.data)}
                                                    className="cursor-pointer hover:opacity-80 rounded-xl"
                                                />
                                            )}
                                        />
                                    </Scheduler>
                                </Paper>
                            </ThemeProvider>
                        </div>

                        <div className="lg:col-span-2 space-y-6">
                            <div className="flex items-center justify-between px-1">
                                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center">
                                        <Clock size={16} className="text-blue-600" />
                                    </div>
                                    Agenda Hari Ini
                                </h3>
                                <Badge variant="secondary" className="bg-blue-50 text-blue-600 border-none font-bold">
                                    {todayAgenda.length} Jadwal
                                </Badge>
                            </div>

                            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                {todayAgenda.length === 0 ? (
                                    <div className="py-12 flex flex-col items-center justify-center bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-100">
                                        <Calendar className="text-slate-200 mb-2" size={40} />
                                        <p className="text-xs font-bold text-slate-400">Tidak ada agenda hari ini</p>
                                    </div>
                                ) : (
                                    todayAgenda.map((item) => (
                                        <Card key={item.id} className="border-none shadow-md shadow-slate-200/30 rounded-2xl overflow-hidden hover:shadow-xl hover:translate-x-1 transition-all cursor-pointer group">
                                            <div className={`h-1.5 w-full ${item.status === 'completed' ? 'bg-green-500' :
                                                item.status === 'cancelled' ? 'bg-red-500' :
                                                    item.status === 'in_progress' ? 'bg-amber-500' : 'bg-blue-500'
                                                }`} />
                                            <CardContent className="p-4 space-y-3">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="font-bold text-[#101D42] line-clamp-1">{item.title}</p>
                                                        <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mt-0.5">{item.tech}</p>
                                                    </div>
                                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50" onClick={(e) => { e.stopPropagation(); handleEdit(item); }}>
                                                            <Edit2 size={12} />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50" onClick={(e) => { e.stopPropagation(); handleDeleteClick(item); }}>
                                                            <Trash2 size={12} />
                                                        </Button>
                                                    </div>
                                                </div>
                                                <div className="space-y-2 border-t border-slate-50 pt-3">
                                                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                                                        <Clock size={14} className="text-slate-400" /> {item.startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                                                        <MapPin size={14} className="text-slate-400" /> {item.location}
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between pt-1">
                                                    <div className="flex items-center gap-1.5 overflow-hidden">
                                                        <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                                                            <User size={10} className="text-slate-500" />
                                                        </div>
                                                        <span className="text-[10px] font-bold text-slate-500 truncate">{item.customerName}</span>
                                                    </div>
                                                    <Badge className={`text-[9px] px-2 py-0 h-4 rounded-full font-black uppercase ${item.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                        item.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                            item.status === 'in_progress' ? 'bg-amber-100 text-amber-700' : 'bg-blue-50 text-blue-600'
                                                        }`}>
                                                        {item.status}
                                                    </Badge>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <ScheduleModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={selectedSchedule ? (data) => update(selectedSchedule.id, data) : create}
                isLoading={isProcessing}
                initialData={selectedSchedule}
            />

            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={async () => {
                    if (scheduleToDelete) {
                        await deleteSchedule(scheduleToDelete.id);
                        setIsDeleteModalOpen(false);
                    }
                }}
                isLoading={isProcessing}
                title="Hapus Jadwal"
                description={`Apakah Anda yakin ingin menghapus jadwal "${scheduleToDelete?.title}"? Tindakan ini tidak dapat dibatalkan.`}
            />
        </div>
    );
}
