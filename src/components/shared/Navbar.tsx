import {
    Bell,
    Menu,
    Search,
    ChevronDown,
    PanelLeftClose,
    PanelLeftOpen,
    User as UserIcon,
    Settings as SettingsIcon,
    LogOut
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/providers/sidebar-provider";
import { AuthService } from "@/services/auth.service";
import { useNavigate } from "react-router-dom";

/**
 * Modern Navbar with refined UI and layout controls.
 */
export const Navbar = () => {
    const navigate = useNavigate();
    const { isCollapsed, toggleCollapse, toggleMobile } = useSidebar();
    const user = AuthService.getUser();

    const handleLogout = async () => {
        await AuthService.logout();
    };

    const getInitials = (name: string) => {
        if (!name) return "U";
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .substring(0, 2);
    };

    const formatRole = (role: string) => {
        return role.replace(/_/g, " ");
    };

    return (
        <header className="h-16 bg-white/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-10 transition-all duration-300">
            <div className="flex items-center space-x-3">
                {/* Desktop Collapse Toggle */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleCollapse}
                    className="hidden lg:flex text-brand-blue-sidebar hover:bg-slate-100 rounded-xl"
                >
                    {isCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
                </Button>

                {/* Mobile Menu Toggle */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden text-slate-500"
                    onClick={toggleMobile}
                >
                    <Menu size={20} />
                </Button>

                {/* Refined Search Input */}
                <div className="hidden md:flex items-center text-slate-400 bg-slate-100/50 hover:bg-slate-100 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/10 rounded-2xl px-4 py-2 w-72 transition-all duration-200 group">
                    <Search size={18} className="mr-2 group-focus-within:text-blue-500" />
                    <input
                        type="text"
                        placeholder="Cari transaksi atau pelanggan..."
                        className="bg-transparent border-none outline-none text-sm w-full text-slate-600 placeholder:text-slate-400"
                    />
                </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
                {/* Notification Bell with pulse effect */}
                <Button variant="ghost" size="icon" className="relative text-slate-500 hover:bg-slate-100 rounded-xl">
                    <Bell size={20} />
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white animate-pulse"></span>
                </Button>

                {/* User Profile Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex items-center space-x-3 hover:bg-slate-100 p-1 rounded-2xl transition-all duration-200 outline-none group cursor-pointer">
                            <div className="text-right hidden sm:block pl-2">
                                <p className="text-sm font-bold text-slate-800 leading-none">
                                    {user?.name || "User"}
                                </p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                    {user ? formatRole(user.role) : "Guest"}
                                </p>
                            </div>
                            <Avatar className="h-10 w-10 border-2 border-white shadow-sm transition-transform duration-200 group-hover:scale-105">
                                <AvatarImage src={user?.avatar} />
                                <AvatarFallback className="bg-blue-500 text-white">
                                    {user ? getInitials(user.name) : "U"}
                                </AvatarFallback>
                            </Avatar>
                            <ChevronDown size={14} className="text-slate-400 mr-1" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-xl border-slate-100">
                        <DropdownMenuLabel className="font-bold text-slate-800">Akun Saya</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-slate-50" />
                        <DropdownMenuItem
                            className="rounded-xl cursor-pointer flex items-center gap-2"
                            onClick={() => navigate("/profile")}
                        >
                            <UserIcon size={16} className="text-slate-400" />
                            Profil
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="rounded-xl cursor-pointer flex items-center gap-2"
                            onClick={() => navigate("/settings/permissions")}
                        >
                            <SettingsIcon size={16} className="text-slate-400" />
                            Pengaturan
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-slate-50" />
                        <DropdownMenuItem
                            className="text-red-600 rounded-xl cursor-pointer font-medium hover:bg-red-50 focus:bg-red-50 focus:text-red-600 flex items-center gap-2"
                            onClick={handleLogout}
                        >
                            <LogOut size={16} />
                            Keluar
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
};
