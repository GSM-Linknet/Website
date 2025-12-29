import { Construction } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function ComingSoonPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
            <div className="p-6 bg-blue-50 rounded-full animate-pulse">
                <Construction size={48} className="text-blue-600" />
            </div>

            <div className="space-y-2 max-w-md">
                <h1 className="text-2xl font-bold text-[#101D42]">Fitur Segera Hadir</h1>
                <p className="text-slate-500">
                    Modul ini sedang dalam tahap pengembangan. Nantikan pembaruan selanjutnya untuk akses fitur ini.
                </p>
            </div>

            <Button asChild className="bg-[#101D42] hover:bg-[#101D42]/90 rounded-xl font-bold">
                <Link to="/">Kembali ke Dashboard</Link>
            </Button>
        </div>
    );
}
