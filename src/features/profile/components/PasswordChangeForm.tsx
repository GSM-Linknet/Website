import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Lock } from "lucide-react";

interface PasswordChangeFormProps {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
    changingPassword: boolean;
    onCurrentPasswordChange: (value: string) => void;
    onNewPasswordChange: (value: string) => void;
    onConfirmPasswordChange: (value: string) => void;
    onSubmit: (e: React.FormEvent) => void;
}

export const PasswordChangeForm = ({
    currentPassword,
    newPassword,
    confirmPassword,
    changingPassword,
    onCurrentPasswordChange,
    onNewPasswordChange,
    onConfirmPasswordChange,
    onSubmit,
}: PasswordChangeFormProps) => {
    return (
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-white">
                <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="h-10 w-10 rounded-xl bg-red-100 flex items-center justify-center">
                        <Lock className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                        <div className="font-bold text-slate-800">Keamanan Akun</div>
                        <div className="text-sm font-normal text-slate-500">
                            Perbarui password untuk keamanan akun Anda
                        </div>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
                <form onSubmit={onSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <Label htmlFor="currentPassword" className="text-sm font-semibold text-slate-700">
                            Password Saat Ini
                        </Label>
                        <Input
                            id="currentPassword"
                            type="password"
                            value={currentPassword}
                            onChange={(e) => onCurrentPasswordChange(e.target.value)}
                            required
                            className="border-slate-300 focus:border-red-500 focus:ring-red-500"
                            placeholder="Masukkan password saat ini"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="newPassword" className="text-sm font-semibold text-slate-700">
                            Password Baru
                        </Label>
                        <Input
                            id="newPassword"
                            type="password"
                            value={newPassword}
                            onChange={(e) => onNewPasswordChange(e.target.value)}
                            required
                            minLength={6}
                            className="border-slate-300 focus:border-red-500 focus:ring-red-500"
                            placeholder="Minimal 6 karakter"
                        />
                        <p className="text-xs text-slate-500">Password harus minimal 6 karakter</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-sm font-semibold text-slate-700">
                            Konfirmasi Password Baru
                        </Label>
                        <Input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => onConfirmPasswordChange(e.target.value)}
                            required
                            className="border-slate-300 focus:border-red-500 focus:ring-red-500"
                            placeholder="Ketik ulang password baru"
                        />
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button
                            type="submit"
                            disabled={changingPassword}
                            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg shadow-red-500/30 px-6"
                        >
                            {changingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Ubah Password
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};
