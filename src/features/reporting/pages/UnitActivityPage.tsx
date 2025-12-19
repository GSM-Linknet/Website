import { ClipboardList, TrendingUp, Lightbulb, Box, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function UnitActivityPage() {
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
                            <Label className="text-slate-600 font-bold">1. Aktivitas Kerja</Label>
                            <Textarea placeholder="Tuliskan aktivitas unit hari ini..." className="rounded-xl h-24" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-600 font-bold">2. Kesimpulan / Resume Analisa</Label>
                            <Textarea placeholder="Resume hasil analisa hari ini..." className="rounded-xl h-24" />
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
                            <Label className="text-slate-600 font-bold flex items-center gap-2">
                                <TrendingUp size={16} /> Strategi
                            </Label>
                            <Textarea placeholder="Rencana strategi ke depan..." className="rounded-xl h-20" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-600 font-bold flex items-center gap-2">
                                <Box size={16} /> Kebutuhan Resource
                            </Label>
                            <Textarea placeholder="Alat, material, atau SDM yang dibutuhkan..." className="rounded-xl h-20" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-rose-600 font-bold flex items-center gap-2">
                                <AlertTriangle size={16} /> Kendala Lapangan
                            </Label>
                            <Textarea placeholder="Hambatan atau masalah yang ditemui..." className="rounded-xl h-20 border-rose-100 focus:ring-rose-500/10 focus:border-rose-500" />
                        </div>
                        <Button className="w-full bg-[#101D42] h-12 rounded-xl font-bold mt-2 text-white">
                            Submit Laporan KA Unit
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
