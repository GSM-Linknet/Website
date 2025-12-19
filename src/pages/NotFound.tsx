import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <h1 className="text-6xl font-bold text-slate-200">404</h1>
            <div className="text-center space-y-2">
                <h2 className="text-xl font-bold text-slate-800 tracking-tight">Halaman Tidak Ditemukan</h2>
                <p className="text-slate-500">Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan.</p>
            </div>
            <Button asChild className="bg-[#101D42] hover:bg-[#101D42]/90">
                <Link to="/">Kembali ke Dashboard</Link>
            </Button>
        </div>
    );
}
