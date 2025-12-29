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
import { Clock, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Data
const appointments = [
    {
        title: 'Install: Bapak Hadi',
        startDate: new Date(2025, 11, 29, 9, 0),
        endDate: new Date(2025, 11, 29, 11, 0),
        id: 1,
        location: 'Jl. Merdeka No. 10',
        tech: 'Ahmad'
    },
    {
        title: 'Survey: Ibu Siti',
        startDate: new Date(2025, 11, 29, 11, 0),
        endDate: new Date(2025, 11, 29, 12, 0),
        id: 2,
        location: 'Gg. Kelinci II',
        tech: 'Budi'
    },
    {
        title: 'Maintenance: PT. Maju Jaya',
        startDate: new Date(2025, 11, 29, 14, 0),
        endDate: new Date(2025, 11, 29, 16, 0),
        id: 3,
        location: 'Kawasan Industri',
        tech: 'Citra'
    },
];

// Custom Theme to match RDN Brand
const theme = createTheme({
    palette: {
        primary: {
            main: '#101D42', // Navy
        },
        secondary: {
            main: '#3B82F6', // Blue
        },
    },
    typography: {
        fontFamily: 'inherit', // Inherit from Tailwind
    },
    components: {
        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: '1.5rem',
                    boxShadow: 'none',
                    border: '1px solid #F1F5F9', // slate-100
                },
            },
        },
    },
});

export default function InstallSchedulePage() {
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
                {/* DevExpress Scheduler */}
                <div className="lg:col-span-5 flex flex-col gap-4">
                    <ThemeProvider theme={theme}>
                        <Paper className="shadow-xl shadow-slate-200/40">
                            <Scheduler data={appointments} locale="id-ID">
                                <ViewState defaultCurrentDate={new Date(2025, 11, 29)} />
                                <MonthView />
                                <WeekView startDayHour={8} endDayHour={18} />
                                <Toolbar />
                                <DateNavigator />
                                <TodayButton />
                                <ViewSwitcher />
                                <Appointments />
                            </Scheduler>
                        </Paper>
                    </ThemeProvider>
                </div>

                {/* Daily Agenda Side Panel */}
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2 px-1">
                        <Clock size={18} className="text-blue-500" />
                        Agenda Hari Ini
                    </h3>
                    {appointments.filter(apt => apt.startDate.getDate() === 29).map((item) => (
                        <Card key={item.id} className="border-none shadow-lg shadow-slate-200/40 rounded-2xl overflow-hidden hover:translate-x-1 transition-transform cursor-pointer group">
                            <div className={`h-1 w-full bg-blue-500`} />
                            <CardContent className="p-4 space-y-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-black text-[#101D42]">{item.title}</p>
                                        <p className="text-[10px] font-bold text-blue-500 uppercase tracking-tighter">{item.tech}</p>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                        <Clock size={12} /> {item.startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                        <MapPin size={12} /> {item.location}
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
