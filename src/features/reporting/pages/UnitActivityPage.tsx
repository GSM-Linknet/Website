import { useState, useEffect } from "react";
import { ClipboardList, TrendingUp, Lightbulb, Box, AlertTriangle, MessageSquare, Clock, User, CheckCircle, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { reportService } from "@/services/reporting.service";
import { AuthService } from "@/services/auth.service";
import type { ActivityReportDetail } from "@/features/reporting/types/report.types";

export default function UnitActivityPage() {
    const user = AuthService.getUser();
    const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN_PUSAT';

    // Form State
    const [formData, setFormData] = useState({
        activity: "",
        summary: "",
        strategy: "",
        resources: "",
        issues: ""
    });
    const [submitLoading, setSubmitLoading] = useState(false);

    // List State
    const [reports, setReports] = useState<ActivityReportDetail[]>([]);
    const [listLoading, setListLoading] = useState(true);
    const [selectedReport, setSelectedReport] = useState<ActivityReportDetail | null>(null);
    const [feedback, setFeedback] = useState("");
    const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false);
    const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

    const fetchReports = async () => {
        setListLoading(true);
        try {
            const data = await reportService.getActivityReports();
            setReports(data || []);
        } catch (error) {
            console.error("Failed to fetch reports", error);
            toast.error("Gagal memuat daftar laporan");
        } finally {
            setListLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async () => {
        if (!formData.activity || !formData.summary) {
            toast.error("Aktivitas dan Kesimpulan harus diisi");
            return;
        }

        const toastId = toast.loading("Sedang mengirim laporan...");
        setSubmitLoading(true);
        try {
            await reportService.createActivityReport({
                activity: formData.activity,
                summary: formData.summary,
                strategy: formData.strategy,
                resources: formData.resources,
                issues: formData.issues
            });

            toast.success("Laporan KA Unit berhasil dikirim!", { id: toastId });

            setFormData({
                activity: "",
                summary: "",
                strategy: "",
                resources: "",
                issues: ""
            });

            // Refresh list and switch tab
            fetchReports();
            const tabList = document.querySelector('[data-value="history"]') as HTMLButtonElement;
            if (tabList) tabList.click();
        } catch (error: any) {
            console.error("Failed to submit report", error);
            toast.error(error.message || "Gagal mengirim laporan.", { id: toastId });
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleOpenDetail = (report: ActivityReportDetail) => {
        setSelectedReport(report);
        setIsDetailDialogOpen(true);
    };

    const handleOpenFeedback = (report: ActivityReportDetail) => {
        setSelectedReport(report);
        setFeedback(report.feedback || "");
        setIsFeedbackDialogOpen(true);
    };

    const handleSubmitFeedback = async () => {
        if (!selectedReport) return;

        const toastId = toast.loading("Mengirim feedback...");
        setSubmitLoading(true);
        try {
            await reportService.addActivityFeedback(selectedReport.id, feedback);
            toast.success("Feedback berhasil dikirim", { id: toastId });
            setIsFeedbackDialogOpen(false);
            fetchReports();
        } catch (error) {
            console.error("Failed to submit feedback", error);
            toast.error("Gagal mengirim feedback", { id: toastId });
        } finally {
            setSubmitLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'reviewed':
                return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">Selesai Review</Badge>;
            default:
                return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none">Menunggu Review</Badge>;
        }
    };

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold text-[#101D42]">Pelaporan KA Unit</h1>
                <p className="text-sm text-slate-500 font-medium">Manajemen aktivitas harian dan analisis strategis unit</p>
            </div>

            <Tabs defaultValue="form" className="w-full">
                <TabsList className="bg-slate-100/50 p-1 rounded-2xl mb-8">
                    <TabsTrigger value="form" className="rounded-xl px-8 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold">Buat Laporan</TabsTrigger>
                    <TabsTrigger value="history" className="rounded-xl px-8 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold" data-value="history">Riwayat Laporan</TabsTrigger>
                </TabsList>

                <TabsContent value="form">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Activity & Analysis */}
                        <Card className="border-slate-100 shadow-xl shadow-slate-200/40 rounded-[2rem]">
                            <CardHeader>
                                <CardTitle className="text-lg font-bold flex items-center gap-2">
                                    <ClipboardList size={18} className="text-blue-500" />
                                    Detail Aktivitas & Analisa
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="activity" className="text-slate-600 font-bold">1. Aktivitas Kerja</Label>
                                    <Textarea id="activity" placeholder="Tuliskan aktivitas unit hari ini..." className="rounded-xl h-24" value={formData.activity} onChange={handleChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="summary" className="text-slate-600 font-bold">2. Kesimpulan / Resume Analisa</Label>
                                    <Textarea id="summary" placeholder="Resume hasil analisa hari ini..." className="rounded-xl h-24" value={formData.summary} onChange={handleChange} />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Strategy & Resources */}
                        <Card className="border-slate-100 shadow-xl shadow-slate-200/40 rounded-[2rem]">
                            <CardHeader>
                                <CardTitle className="text-lg font-bold flex items-center gap-2">
                                    <Lightbulb size={18} className="text-amber-500" />
                                    Strategi & Kebutuhan
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="strategy" className="text-slate-600 font-bold flex items-center gap-2">
                                        <TrendingUp size={16} /> Strategi
                                    </Label>
                                    <Textarea id="strategy" placeholder="Rencana strategi ke depan..." className="rounded-xl h-20" value={formData.strategy} onChange={handleChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="resources" className="text-slate-600 font-bold flex items-center gap-2">
                                        <Box size={16} /> Kebutuhan Resource
                                    </Label>
                                    <Textarea id="resources" placeholder="Alat, material, atau SDM yang dibutuhkan..." className="rounded-xl h-20" value={formData.resources} onChange={handleChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="issues" className="text-rose-600 font-bold flex items-center gap-2">
                                        <AlertTriangle size={16} /> Kendala Lapangan
                                    </Label>
                                    <Textarea id="issues" placeholder="Hambatan atau masalah yang ditemui..." className="rounded-xl h-20 border-rose-100 focus:ring-rose-500/10 focus:border-rose-500" value={formData.issues} onChange={handleChange} />
                                </div>
                                <Button
                                    className="w-full bg-[#101D42] h-12 rounded-xl font-bold mt-2 text-white flex items-center justify-center gap-2"
                                    onClick={handleSubmit}
                                    disabled={submitLoading}
                                >
                                    {submitLoading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Mengirim Laporan...
                                        </>
                                    ) : "Submit Laporan KA Unit"}
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="history">
                    <div className="grid grid-cols-1 gap-4">
                        {listLoading ? (
                            <div className="text-center py-20 text-slate-400">Memuat laporan...</div>
                        ) : reports.length === 0 ? (
                            <Card className="border-dashed border-2 py-12 text-center text-slate-400 rounded-[2rem]">
                                <CardContent>Belum ada laporan yang diajukan</CardContent>
                            </Card>
                        ) : (
                            reports.map((report) => (
                                <Card key={report.id} className="border-slate-100 shadow-md hover:shadow-lg transition-shadow rounded-[1.5rem] cursor-pointer" onClick={() => handleOpenDetail(report)}>
                                    <CardContent className="p-6">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                                                    <ClipboardList size={24} />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-slate-800 line-clamp-1">{report.activity}</h3>
                                                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 font-medium">
                                                        <span className="flex items-center gap-1"><User size={12} /> {report.user?.name}</span>
                                                        <span className="flex items-center gap-1"><Clock size={12} /> {new Date(report.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 ml-auto md:ml-0">
                                                {getStatusBadge(report.status)}
                                                {isAdmin && report.status !== 'reviewed' && (
                                                    <Button variant="outline" size="sm" className="rounded-lg font-bold" onClick={(e) => { e.stopPropagation(); handleOpenFeedback(report); }}>
                                                        Beri Feedback
                                                    </Button>
                                                )}
                                                <ChevronRight className="text-slate-300" size={20} />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </TabsContent>
            </Tabs>

            {/* Detail Dialog */}
            <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-[2rem]">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">Detail Laporan KA Unit</DialogTitle>
                        <DialogDescription>Diajukan oleh {selectedReport?.user?.name} pada {selectedReport && new Date(selectedReport.createdAt).toLocaleString('id-ID')}</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        <section className="space-y-2">
                            <h4 className="font-bold text-slate-700 flex items-center gap-2"><ClipboardList size={18} className="text-blue-500" /> 1. Aktivitas Kerja</h4>
                            <div className="p-4 bg-slate-50 rounded-xl text-sm whitespace-pre-wrap">{selectedReport?.activity}</div>
                        </section>

                        <section className="space-y-2">
                            <h4 className="font-bold text-slate-700 flex items-center gap-2"><CheckCircle size={18} className="text-green-500" /> 2. Kesimpulan / Resume</h4>
                            <div className="p-4 bg-slate-50 rounded-xl text-sm whitespace-pre-wrap">{selectedReport?.summary}</div>
                        </section>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <section className="space-y-2">
                                <h4 className="font-bold text-slate-700">Strategi</h4>
                                <div className="p-4 bg-slate-50 rounded-xl text-sm whitespace-pre-wrap">{selectedReport?.strategy || '-'}</div>
                            </section>
                            <section className="space-y-2">
                                <h4 className="font-bold text-slate-700">Kebutuhan Resource</h4>
                                <div className="p-4 bg-slate-50 rounded-xl text-sm whitespace-pre-wrap">{selectedReport?.resources || '-'}</div>
                            </section>
                        </div>

                        <section className="space-y-2">
                            <h4 className="font-bold text-rose-600">Kendala Lapangan</h4>
                            <div className="p-4 bg-rose-50 rounded-xl text-sm whitespace-pre-wrap text-rose-700 border border-rose-100">{selectedReport?.issues || '-'}</div>
                        </section>

                        <hr className="border-slate-100" />

                        <section className="space-y-2">
                            <h4 className="font-bold text-[#101D42] flex items-center gap-2"><MessageSquare size={18} className="text-indigo-500" /> Feedback Admin</h4>
                            {selectedReport?.feedback ? (
                                <div className="p-4 bg-indigo-50 rounded-xl text-sm border border-indigo-100">
                                    <div className="font-bold text-indigo-700 text-xs mb-1">Feedback dari {selectedReport.reviewer?.name}:</div>
                                    <div className="text-indigo-800 whitespace-pre-wrap">{selectedReport.feedback}</div>
                                </div>
                            ) : (
                                <div className="p-8 text-center text-slate-400 text-sm italic border-2 border-dashed rounded-xl">
                                    Belum ada feedback
                                </div>
                            )}
                        </section>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)} className="rounded-xl font-bold">Tutup</Button>
                        {isAdmin && (
                            <Button onClick={() => { setIsDetailDialogOpen(false); handleOpenFeedback(selectedReport!); }} className="bg-[#101D42] rounded-xl font-bold text-white">Update Feedback</Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Feedback Dialog */}
            <Dialog open={isFeedbackDialogOpen} onOpenChange={setIsFeedbackDialogOpen}>
                <DialogContent className="rounded-[2rem]">
                    <DialogHeader>
                        <DialogTitle className="font-bold">Berikan Feedback Laporan</DialogTitle>
                        <DialogDescription>Laporan dari {selectedReport?.user?.name}</DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Textarea
                            placeholder="Tuliskan feedback di sini..."
                            className="min-h-[150px] rounded-xl"
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsFeedbackDialogOpen(false)} className="rounded-xl font-bold">Batal</Button>
                        <Button
                            onClick={handleSubmitFeedback}
                            disabled={submitLoading}
                            className="bg-[#101D42] rounded-xl font-bold text-white flex items-center gap-2"
                        >
                            {submitLoading && <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                            Kirim Feedback
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
