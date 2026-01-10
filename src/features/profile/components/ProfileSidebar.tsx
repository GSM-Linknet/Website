import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Shield, Calendar, Camera } from "lucide-react";
import type { UserProfile } from "@/services/profile.service";

interface ProfileSidebarProps {
    profile: UserProfile;
    photoUrl: string;
    onAvatarClick: () => void;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const roleColors: Record<string, string> = {
    SUPER_ADMIN: "bg-purple-100 text-purple-800 border-purple-200",
    ADMIN_PUSAT: "bg-blue-100 text-blue-800 border-blue-200",
    ADMIN_CABANG: "bg-green-100 text-green-800 border-green-200",
    ADMIN_UNIT: "bg-yellow-100 text-yellow-800 border-yellow-200",
    SUPERVISOR: "bg-orange-100 text-orange-800 border-orange-200",
    SALES: "bg-pink-100 text-pink-800 border-pink-200",
    TECHNICIAN: "bg-cyan-100 text-cyan-800 border-cyan-200",
};

const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
};

export const ProfileSidebar = ({
    profile,
    photoUrl,
    onAvatarClick,
    fileInputRef,
    onFileChange,
}: ProfileSidebarProps) => {
    const initials = profile.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2);

    return (
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm overflow-hidden">
            <div className="h-32 bg-gradient-to-br from-blue-500 to-blue-600" />
            <CardContent className="pt-0 pb-6">
                <div className="flex flex-col items-center -mt-16">
                    {/* Avatar with upload overlay */}
                    <div className="relative group">
                        <Avatar className="h-32 w-32 border-4 border-white shadow-xl ring-4 ring-blue-100">
                            <AvatarImage src={photoUrl} alt={profile.name} />
                            <AvatarFallback className="text-3xl font-bold bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                        <div
                            className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                            onClick={onAvatarClick}
                        >
                            <Camera className="h-8 w-8 text-white" />
                        </div>
                    </div>

                    {/* Hidden file input */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={onFileChange}
                        className="hidden"
                    />

                    <h2 className="mt-4 text-2xl font-bold text-slate-800">{profile.name}</h2>
                    <p className="text-slate-500 text-sm">{profile.email}</p>

                    <Badge
                        variant="outline"
                        className={`mt-3 px-4 py-1 font-semibold border-2 ${roleColors[profile.role] || "bg-slate-100 text-slate-800"
                            }`}
                    >
                        <Shield className="h-3 w-3 mr-1" />
                        {profile.role.replace(/_/g, " ")}
                    </Badge>

                    <Separator className="my-6 bg-slate-200" />

                    <div className="w-full space-y-3 text-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-slate-600 flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                Bergabung
                            </span>
                            <span className="font-medium text-slate-800">
                                {formatDate(profile.createdAt)}
                            </span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
