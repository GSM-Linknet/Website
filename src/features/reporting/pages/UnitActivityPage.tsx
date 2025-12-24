import { useState } from "react";
import { ClipboardList, TrendingUp, Lightbulb, Box, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ReportingService } from "@/services/reporting.service";
import { AuthService } from "@/services/auth.service";

export default function UnitActivityPage() {
    const [formData, setFormData] = useState({
        activity: "",
        summary: "",
        strategy: "",
        resources: "",
        issues: ""
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const user = AuthService.getUser();
            const notes = JSON.stringify(formData);

            // Assuming this maps to Sales Report for now as a catch-all report
            // Or maybe this should go to a different endpoint? 
            // Given the task, I'll use createSalesReport.
            await ReportingService.createSalesReport({
                userId: user?.id,
                period: "daily",
                startDate: new Date().toISOString(),
                endDate: new Date().toISOString(),
                totalSales: 0,
                totalRevenue: 0,
                notes: notes
            });
            alert("Laporan KA Unit berhasil dikirim!");
            setFormData({
                activity: "",
                summary: "",
                strategy: "",
                resources: "",
                issues: ""
            });
        } catch (error) {
            console.error("Failed to submit report", error);
            alert("Gagal mengirim laporan.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold text-[#101D42]">Pelaporan KA Unit</h1>
                <p className="text-sm text-slate-500 font-medium">Form aktivitas harian dan analisis strategis unit</p>
            </div>

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
                            className="w-full bg-[#101D42] h-12 rounded-xl font-bold mt-2 text-white"
                            onClick={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? "Submitting..." : "Submit Laporan KA Unit"}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
