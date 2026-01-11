import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, User, Lock } from "lucide-react";

interface ProfileInfoFormProps {
    name: string;
    email: string;
    updating: boolean;
    onNameChange: (value: string) => void;
    onSubmit: (e: React.FormEvent) => void;
}

export const ProfileInfoForm = ({
    name,
    email,
    updating,
    onNameChange,
    onSubmit,
}: ProfileInfoFormProps) => {
    return (
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-white">
                <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                        <div className="font-bold text-slate-800">Informasi Profil</div>
                        <div className="text-sm font-normal text-slate-500">
                            Perbarui foto dan nama profil Anda
                        </div>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
                <form onSubmit={onSubmit} className="space-y-6">
                    {/* Name Field */}
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-semibold text-slate-700">
                            Nama Lengkap
                        </Label>
                        <Input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => onNameChange(e.target.value)}
                            required
                            className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>

                    {/* Email Field (Read-only) */}
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-semibold text-slate-700">
                            Email
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            disabled
                            className="bg-slate-50 border-slate-200 cursor-not-allowed text-slate-500"
                        />
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                            <Lock className="h-3 w-3" />
                            Email tidak dapat diubah untuk keamanan akun
                        </p>
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button
                            type="submit"
                            disabled={updating}
                            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/30 px-6"
                        >
                            {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Simpan Perubahan
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};
