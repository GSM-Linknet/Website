import { useState, useEffect, useMemo, useCallback } from "react";
import { CustomerSupportService } from "@/services/customer-support.service";
import type { CsShift } from "@/services/customer-support.service";
import { UserService } from "@/services/user.service";
import type { User } from "@/services/auth.service";
import { toast } from "sonner";
import { Trash2, Plus, Clock, CalendarDays, SignalHigh, SignalLow, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchableSelect } from "@/components/shared/SearchableSelect";
import { Dialog, DialogContent } from "@/components/ui/dialog";
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

// Custom Theme to match RDN Brand
const theme = createTheme({
    palette: {
        primary: { main: '#101D42' },
        secondary: { main: '#3B82F6' },
        info: { main: '#0EA5E9' },
        success: { main: '#22C55E' },
        warning: { main: '#F59E0B' },
        error: { main: '#EF4444' },
    },
    typography: { fontFamily: 'inherit' },
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

export default function CsShiftPage() {
  const [shifts, setShifts] = useState<CsShift[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  // New shift form state
  const [newUserId, setNewUserId] = useState<string>("");
  const [newDate, setNewDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [newStartTime, setNewStartTime] = useState<string>("08:00");
  const [newEndTime, setNewEndTime] = useState<string>("17:00");

  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedShift, setSelectedShift] = useState<CsShift | null>(null);
  
  const [isEditingAgent, setIsEditingAgent] = useState(false);
  const [editUserId, setEditUserId] = useState("");

  const appointments = useMemo(() => {
    return shifts.map(s => {
      const startDate = new Date(`${s.date}T${s.startTime}`);
      const endDate = new Date(`${s.date}T${s.endTime}`);
      return {
        id: s.id,
        title: `${s.user?.name || "Agen CS"} (${s.startTime}-${s.endTime})`,
        startDate,
        endDate,
        user: s.user,
        original: s
      };
    });
  }, [shifts]);

  const searchUsers = useCallback(async (searchStr: string = "") => {
    setIsSearchingUsers(true);
    try {
      const query: any = { where: 'role:ADMIN_PUSAT', limit: 20 };
      if (searchStr) {
        query.search = `name:${searchStr}`;
      }
      const res = await UserService.findAll(query);
      const userList = (res as any).data?.data?.items || (res as any).data?.items || [];
      setUsers(userList);
    } catch (err: any) {
      console.error("Gagal mencari user:", err);
    } finally {
      setIsSearchingUsers(false);
    }
  }, []);

  const loadData = async () => {
    try {
      const shiftsRes = await CustomerSupportService.getShifts();
      
      const shiftsData = (shiftsRes as any).data?.data || (shiftsRes as any).data?.items || (shiftsRes as any).data || [];
      setShifts(Array.isArray(shiftsData) ? shiftsData : []);
      
      // Load initial users
      await searchUsers("");
    } catch (err: any) {
      toast.error("Gagal memuat data", { description: err.message });
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async () => {
    if (!newUserId) return toast.error("Pilih agen CS terlebih dahulu");
    if (!newDate) return toast.error("Pilih tanggal terlebih dahulu");
    try {
      await CustomerSupportService.createShift({
        userId: newUserId,
        date: newDate,
        startTime: newStartTime,
        endTime: newEndTime
      });
      toast.success("Jadwal Shift berhasil ditambahkan");
      loadData();
      setNewUserId("");
    } catch (err: any) {
      toast.error("Gagal menambahkan shift", { description: err.message });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Hapus jadwal shift ini?")) return;
    try {
      await CustomerSupportService.deleteShift(id);
      toast.success("Jadwal Shift berhasil dihapus");
      loadData();
    } catch (err: any) {
      toast.error("Gagal menghapus shift", { description: err.message });
    }
  };

  const handleChangeAgent = async () => {
    if (!selectedShift) return;
    if (!editUserId) return toast.error("Pilih agen terlebih dahulu");
    try {
      await CustomerSupportService.updateShift(selectedShift.id, { userId: editUserId });
      toast.success("Agen berhasil diganti");
      setIsEditingAgent(false);
      setSelectedShift(null);
      loadData();
    } catch (err: any) {
      toast.error("Gagal mengganti agen", { description: err.message });
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-[#101D42] mb-2 flex items-center gap-2">
            <CalendarDays className="text-blue-600" size={28} /> Jadwal Shift CS
          </h1>
          <p className="text-slate-500 font-medium">Atur jam kerja agen Customer Support. Notifikasi WA saat pesan masuk di luar jam kerja (offline) akan dikirim sesuai jadwal ini.</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-end gap-5">
        <div className="flex-1 min-w-[250px]">
          <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Pilih Agen CS</label>
          <SearchableSelect
            options={users}
            value={newUserId}
            onValueChange={setNewUserId}
            onSearch={searchUsers}
            isLoading={isSearchingUsers}
            placeholder="-- Pilih Agen --"
            searchPlaceholder="Cari nama agen..."
          />
        </div>
        
        <div className="w-full md:w-44">
          <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Tanggal</label>
          <input 
            type="date"
            value={newDate} 
            onChange={(e) => setNewDate(e.target.value)}
            className="w-full h-11 px-4 border border-slate-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-slate-700"
          />
        </div>

        <div className="w-full md:w-32">
          <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Jam Masuk</label>
          <input 
            type="time" 
            value={newStartTime} 
            onChange={e => setNewStartTime(e.target.value)}
            className="w-full h-11 px-4 border border-slate-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-slate-700" 
          />
        </div>

        <div className="w-full md:w-32">
          <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Jam Keluar</label>
          <input 
            type="time" 
            value={newEndTime} 
            onChange={e => setNewEndTime(e.target.value)}
            className="w-full h-11 px-4 border border-slate-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-slate-700" 
          />
        </div>

        <Button 
          onClick={handleCreate} 
          className="h-11 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-200/50 transition-all w-full md:w-auto mt-2 md:mt-0"
        >
          <Plus size={18} className="mr-2" />
          Tambah Jadwal
        </Button>
      </div>

      {/* Shift List with Calendar View */}
      <div className="w-full">
        <ThemeProvider theme={theme}>
          <Paper className="overflow-hidden h-[600px] flex flex-col">
            <Scheduler data={appointments} locale="id-ID">
              <ViewState 
                currentDate={selectedDate} 
                onCurrentDateChange={(date) => setSelectedDate(new Date(date))} 
              />
              <MonthView />
              <WeekView startDayHour={6} endDayHour={22} />
              <Toolbar />
              <DateNavigator />
              <TodayButton />
              <ViewSwitcher />
              <Appointments
                appointmentComponent={(props) => (
                  <Appointments.Appointment
                    {...props}
                    onClick={() => {
                      setSelectedShift(props.data.original);
                      setEditUserId(props.data.original.userId);
                      setIsEditingAgent(false);
                    }}
                    className="cursor-pointer hover:opacity-80 rounded-lg text-xs"
                  />
                )}
              />
            </Scheduler>
          </Paper>
        </ThemeProvider>
      </div>

      <Dialog open={!!selectedShift} onOpenChange={(open) => {
        if (!open) {
          setSelectedShift(null);
          setIsEditingAgent(false);
        }
      }}>
        <DialogContent className="sm:max-w-[425px] rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
          {selectedShift && (
            <div className="flex flex-col">
              <div className="bg-slate-50 px-6 py-5 border-b border-slate-100 flex items-start justify-between relative">
                <div className="pr-8">
                  <h2 className="text-xl font-bold text-[#101D42] mb-1">Detail Jadwal Shift</h2>
                  <p className="text-sm font-medium text-slate-500">
                    {new Date(selectedShift.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>
              
              <div className="p-6 space-y-6 bg-white">
                {isEditingAgent ? (
                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">Pilih Agen Baru</label>
                    <SearchableSelect
                      options={users}
                      value={editUserId}
                      onValueChange={setEditUserId}
                      onSearch={searchUsers}
                      isLoading={isSearchingUsers}
                      placeholder="-- Pilih Agen --"
                      searchPlaceholder="Cari nama agen..."
                    />
                    <div className="flex gap-2 justify-end pt-2">
                      <Button variant="ghost" size="sm" onClick={() => setIsEditingAgent(false)} className="rounded-xl">Batal</Button>
                      <Button size="sm" onClick={handleChangeAgent} className="rounded-xl bg-blue-600 hover:bg-blue-700">Simpan Perubahan</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100/50">
                    <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
                      {(selectedShift.user?.name || "U").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-[#101D42]">{selectedShift.user?.name || "Unknown"}</div>
                      <div className="text-xs font-bold text-indigo-500 uppercase tracking-wider mt-0.5">{selectedShift.user?.role || "Agen CS"}</div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Waktu</p>
                    <div className="flex items-center gap-2 text-[#101D42] font-semibold">
                      <Clock size={16} className="text-blue-500" />
                      {selectedShift.startTime} - {selectedShift.endTime}
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Status</p>
                    <div className="flex items-center">
                      <div className={`px-2.5 py-1 rounded-md text-[10px] font-bold flex items-center gap-1.5 ${
                        selectedShift.isActive 
                          ? "bg-emerald-100 text-emerald-700" 
                          : "bg-slate-200 text-slate-600"
                      }`}>
                        {selectedShift.isActive ? <><SignalHigh size={12} /> AKTIF</> : <><SignalLow size={12} /> NONAKTIF</>}
                      </div>
                    </div>
                  </div>
                </div>

                {!isEditingAgent && (
                  <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                    <Button 
                      variant="outline" 
                      className="flex-1 h-12 rounded-xl border-2 font-bold text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                      onClick={() => setIsEditingAgent(true)}
                    >
                      <UserIcon size={16} className="mr-2" />
                      Ganti Agen
                    </Button>
                    <Button 
                      variant="destructive" 
                      className="flex-1 h-12 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 font-bold border-0 shadow-none"
                      onClick={() => {
                        setSelectedShift(null);
                        handleDelete(selectedShift.id);
                      }}
                    >
                      <Trash2 size={16} className="mr-2" />
                      Hapus
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
