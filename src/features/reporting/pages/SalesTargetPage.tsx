
import { useState, useEffect } from "react";
import {
    Target,
    Plus,
    Filter,
    MoreVertical,
    Edit2,
    Trash2,
    TrendingUp,
    Users
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { BaseTable } from "@/components/shared/BaseTable";
import { SalesTargetService, type SalesTarget, type ManagedSalesUser } from "@/services/sales-target.service";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export default function SalesTargetPage() {
    const [targets, setTargets] = useState<SalesTarget[]>([]);
    const [managedUsers, setManagedUsers] = useState<ManagedSalesUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedTarget, setSelectedTarget] = useState<SalesTarget | null>(null);

    // Form State
    const [formState, setFormState] = useState({
        userId: "",
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        targetCustomers: 10,
        targetRevenue: 0,
        notes: ""
    });

    // Filter State
    const [filters, setFilters] = useState({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        userId: "all"
    });

    const months = [
        { value: 1, label: "Januari" },
        { value: 2, label: "Februari" },
        { value: 3, label: "Maret" },
        { value: 4, label: "April" },
        { value: 5, label: "Mei" },
        { value: 6, label: "Juni" },
        { value: 7, label: "Juli" },
        { value: 8, label: "Agustus" },
        { value: 9, label: "September" },
        { value: 10, label: "Oktober" },
        { value: 11, label: "November" },
        { value: 12, label: "Desember" }
    ];

    const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [managedUsersData, targetsData] = await Promise.all([
                SalesTargetService.getManagedSales(),
                SalesTargetService.getAllTargets({
                    month: filters.month,
                    year: filters.year,
                    userId: filters.userId === "all" ? undefined : filters.userId
                })
            ]);
            setManagedUsers(managedUsersData || []);
            setTargets(targetsData || []);
        } catch (error) {
            console.error("Failed to fetch data:", error);
            toast.error("Gagal memuat data target sales");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [filters]);

    const handleCreateOrUpdate = async () => {
        try {
            if (!formState.userId) {
                toast.error("Silakan pilih sales user");
                return;
            }

            if (selectedTarget) {
                await SalesTargetService.updateTarget(selectedTarget.id, {
                    targetCustomers: formState.targetCustomers,
                    targetRevenue: formState.targetRevenue,
                    notes: formState.notes
                });
                toast.success("Target berhasil diperbarui");
            } else {
                await SalesTargetService.createTarget({
                    userId: formState.userId,
                    month: formState.month,
                    year: formState.year,
                    targetCustomers: formState.targetCustomers,
                    targetRevenue: formState.targetRevenue,
                    notes: formState.notes
                });
                toast.success("Target berhasil dibuat");
            }
            setIsDialogOpen(false);
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Gagal menyimpan target");
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Apakah Anda yakin ingin menghapus target ini?")) {
            try {
                await SalesTargetService.deleteTarget(id);
                toast.success("Target berhasil dihapus");
                fetchData();
            } catch (error) {
                toast.error("Gagal menghapus target");
            }
        }
    };

    const openAddDialog = () => {
        setSelectedTarget(null);
        setFormState({
            userId: "",
            month: filters.month,
            year: filters.year,
            targetCustomers: 10,
            targetRevenue: 0,
            notes: ""
        });
        setIsDialogOpen(true);
    };

    const openEditDialog = (target: SalesTarget) => {
        setSelectedTarget(target);
        setFormState({
            userId: target.userId,
            month: target.month,
            year: target.year,
            targetCustomers: target.targetCustomers,
            targetRevenue: target.targetRevenue || 0,
            notes: target.notes || ""
        });
        setIsDialogOpen(true);
    };

    const columns = [
        {
            header: "Sales",
            accessorKey: "user.name",
            cell: (item: SalesTarget) => (
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                        {item.user?.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                        <p className="font-bold text-slate-900">{item.user?.name}</p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-tighter">
                            {item.user?.unit?.name || item.user?.subUnit?.name || "No Unit"}
                        </p>
                    </div>
                </div>
            )
        },
        {
            header: "Periode",
            accessorKey: "period",
            cell: (item: SalesTarget) => (
                <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">
                    {months.find(m => m.value === item.month)?.label} {item.year}
                </Badge>
            )
        },
        {
            header: "Target Pelanggan",
            accessorKey: "targetCustomers",
            cell: (item: SalesTarget) => (
                <div className="flex items-center gap-2">
                    <span className="font-black text-blue-600 text-base">{item.targetCustomers}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">New Users</span>
                </div>
            )
        },
        {
            header: "Set By",
            accessorKey: "setter.name",
            cell: (item: SalesTarget) => (
                <div className="flex flex-col">
                    <span className="text-sm font-medium">{item.setter?.name || "System"}</span>
                    <span className="text-[10px] text-slate-400">
                        {item.createdAt ? format(new Date(item.createdAt), "dd MMM yyyy", { locale: id }) : "-"}
                    </span>
                </div>
            )
        },
        {
            header: "Opsi",
            accessorKey: "actions",
            cell: (item: SalesTarget) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical size={16} />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl">
                        <DropdownMenuItem onClick={() => openEditDialog(item)} className="cursor-pointer">
                            <Edit2 size={14} className="mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => handleDelete(item.id)}
                            className="cursor-pointer text-red-600 hover:text-red-600 hover:bg-red-50"
                        >
                            <Trash2 size={14} className="mr-2" /> Hapus
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    ];

    return (
        <div className="space-y-8 pb-10">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold text-[#101D42]">Manajemen Target Sales</h1>
                    <p className="text-sm text-slate-500 font-medium tracking-tight">Atur target bulanan untuk setiap sales representative di tim Anda</p>
                </div>
                <Button
                    onClick={openAddDialog}
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 rounded-2xl h-11 px-6 font-bold"
                >
                    <Plus size={18} className="mr-2" /> Set Target Baru
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatsCard
                    title="Total Sales Aktif"
                    value={managedUsers?.length || 0}
                    icon={<Users className="text-blue-500" />}
                    subtitle="Sales di bawah supervisi Anda"
                />
                <StatsCard
                    title="Target Bulan Ini"
                    value={targets?.filter(t => t.month === (new Date().getMonth() + 1)).length || 0}
                    icon={<Target className="text-amber-500" />}
                    subtitle="Sales dengan target yang sudah di-set"
                />
                <StatsCard
                    title="Avg. Target"
                    value={targets?.length > 0 ? Math.round(targets.reduce((acc, t) => acc + t.targetCustomers, 0) / targets.length) : 0}
                    icon={<TrendingUp className="text-emerald-500" />}
                    subtitle="Rata-rata target pelanggan per sales"
                />
            </div>

            <Card className="border-slate-100 shadow-xl shadow-slate-200/40 rounded-[2rem] overflow-hidden">
                <CardHeader className="bg-white border-b border-slate-50 px-8 py-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <Filter size={18} className="text-blue-600" /> Filter Target
                        </CardTitle>
                        <div className="flex flex-wrap items-center gap-3">
                            <Select
                                value={filters.userId}
                                onValueChange={(val) => setFilters(prev => ({ ...prev, userId: val }))}
                            >
                                <SelectTrigger className="w-[200px] h-10 rounded-xl bg-slate-50 border-none shadow-none text-xs font-bold ring-0 focus:ring-0">
                                    <SelectValue placeholder="Semua Sales" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="all">Semua Sales</SelectItem>
                                    {(managedUsers || []).map(user => (
                                        <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select
                                value={filters.month.toString()}
                                onValueChange={(val) => setFilters(prev => ({ ...prev, month: parseInt(val) }))}
                            >
                                <SelectTrigger className="w-[140px] h-10 rounded-xl bg-slate-50 border-none shadow-none text-xs font-bold ring-0 focus:ring-0">
                                    <SelectValue placeholder="Bulan" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    {months.map(m => (
                                        <SelectItem key={m.value} value={m.value.toString()}>{m.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select
                                value={filters.year.toString()}
                                onValueChange={(val) => setFilters(prev => ({ ...prev, year: parseInt(val) }))}
                            >
                                <SelectTrigger className="w-[100px] h-10 rounded-xl bg-slate-50 border-none shadow-none text-xs font-bold ring-0 focus:ring-0">
                                    <SelectValue placeholder="Tahun" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    {years.map(y => (
                                        <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <BaseTable
                        data={targets}
                        columns={columns}
                        rowKey={(item) => item.id}
                        loading={loading}
                    />
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[425px] rounded-[2rem]">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-[#101D42]">
                            {selectedTarget ? "Edit Target Sales" : "Set Target Sales Baru"}
                        </DialogTitle>
                        <DialogDescription className="text-xs font-medium text-slate-500">
                            {selectedTarget ? "Perbarui target performa bulanan untuk sales ini" : "Berikan target performa bulanan untuk sales representative Anda"}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                        {!selectedTarget && (
                            <div className="space-y-2">
                                <Label className="text-xs font-bold tracking-widest text-slate-400 uppercase">Pilih Sales</Label>
                                <Select
                                    value={formState.userId}
                                    onValueChange={(val) => setFormState(prev => ({ ...prev, userId: val }))}
                                >
                                    <SelectTrigger className="h-12 rounded-2xl bg-slate-50 border-none shadow-none ring-0 focus:ring-0">
                                        <SelectValue placeholder="Pilih sales representative" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-none shadow-xl">
                                        {(managedUsers || []).map(user => (
                                            <SelectItem key={user.id} value={user.id} className="rounded-xl py-3 px-4">
                                                <div className="flex flex-col">
                                                    <span className="font-bold">{user.name}</span>
                                                    <span className="text-[10px] text-slate-400 font-medium">
                                                        {user.unit?.name || user.subUnit?.name || "No Unit"}
                                                    </span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold tracking-widest text-slate-400 uppercase">Bulan</Label>
                                <Select
                                    disabled={!!selectedTarget}
                                    value={formState.month.toString()}
                                    onValueChange={(val) => setFormState(prev => ({ ...prev, month: parseInt(val) }))}
                                >
                                    <SelectTrigger className="h-12 rounded-2xl bg-slate-50 border-none shadow-none ring-0 focus:ring-0">
                                        <SelectValue placeholder="Bulan" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-none shadow-xl">
                                        {months.map(m => (
                                            <SelectItem key={m.value} value={m.value.toString()} className="rounded-xl">{m.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold tracking-widest text-slate-400 uppercase">Tahun</Label>
                                <Select
                                    disabled={!!selectedTarget}
                                    value={formState.year.toString()}
                                    onValueChange={(val) => setFormState(prev => ({ ...prev, year: parseInt(val) }))}
                                >
                                    <SelectTrigger className="h-12 rounded-2xl bg-slate-50 border-none shadow-none ring-0 focus:ring-0">
                                        <SelectValue placeholder="Tahun" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-none shadow-xl">
                                        {years.map(y => (
                                            <SelectItem key={y} value={y.toString()} className="rounded-xl">{y}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-bold tracking-widest text-slate-400 uppercase">Target Pelanggan Baru</Label>
                            <div className="relative">
                                <Input
                                    type="number"
                                    value={formState.targetCustomers}
                                    onChange={(e) => setFormState(prev => ({ ...prev, targetCustomers: parseInt(e.target.value) }))}
                                    className="h-12 rounded-2xl bg-slate-50 border-none shadow-none ring-0 focus:ring-0 font-bold"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 uppercase">User</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-bold tracking-widest text-slate-400 uppercase">Catatan (Optional)</Label>
                            <Input
                                value={formState.notes}
                                onChange={(e) => setFormState(prev => ({ ...prev, notes: e.target.value }))}
                                placeholder="Tambahkan pesan motivasi atau instruksi kerj"
                                className="h-12 rounded-2xl bg-slate-50 border-none shadow-none ring-0 focus:ring-0 text-sm"
                            />
                        </div>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0 mt-4">
                        <Button
                            variant="outline"
                            onClick={() => setIsDialogOpen(false)}
                            className="rounded-2xl h-11 border-slate-100 font-bold"
                        >
                            Batal
                        </Button>
                        <Button
                            onClick={handleCreateOrUpdate}
                            className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl h-11 px-8 font-bold"
                        >
                            {selectedTarget ? "Simpan Perubahan" : "Tetapkan Target"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function StatsCard({ title, value, icon, subtitle }: any) {
    return (
        <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2rem] bg-white overflow-hidden relative group hover:translate-y-[-2px] transition-all">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{title}</CardTitle>
                <div className="h-10 w-10 rounded-2xl bg-slate-50 flex items-center justify-center transition-colors group-hover:bg-blue-50">
                    {icon}
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-black text-[#101D42] tracking-tighter mb-1">{value}</div>
                <p className="text-[10px] text-slate-500 font-medium">{subtitle}</p>
            </CardContent>
        </Card>
    );
}
