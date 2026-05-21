/**
 * @file Navbar.tsx
 * @description Modern Navbar component displaying user profile info, sidebar controls, and real-time notification lists.
 * @used_by Layout.tsx (global layout wrapper)
 * @dependencies
 * - AppNotificationService (API: /app-notification/find-all, /app-notification/read)
 * - socketService (WS: listening for 'notification' events)
 * - AuthService (Auth token & user profile retrieval)
 * - useSidebar (Sidebar collapse/mobile toggle state)
 * @public_functions
 * - Navbar (React Functional Component)
 * @side_effects
 * - Fetches user notifications on mount or when the user ID changes (HTTP GET)
 * - Listens to real-time notification socket events
 * - Modifies notification read status (HTTP PATCH)
 */

import {
    Bell,
    Menu,
    ChevronDown,
    PanelLeftClose,
    PanelLeftOpen,
    User as UserIcon,
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
import { useState, useEffect } from "react";
import { AppNotificationService, type AppNotification } from "@/services/app-notification.service";
import { socketService } from "@/services/socket.service";
import moment from "moment";

/**
 * Modern Navbar with refined UI and layout controls.
 */
export const Navbar = () => {
    const navigate = useNavigate();
    const { isCollapsed, toggleCollapse, toggleMobile } = useSidebar();
    const user = AuthService.getUser();
    const userId = user?.id;
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (!userId) return;
        
        const fetchNotifications = async () => {
            try {
                const res = await AppNotificationService.getNotifications({ limit: 10 });
                const items = res.data?.items || [];
                setNotifications(items);
                setUnreadCount(items.filter((n: AppNotification) => !n.isRead).length);
            } catch (error) {
                console.error("Failed to fetch notifications:", error);
            }
        };

        fetchNotifications();

        const handleNewNotification = (data: AppNotification) => {
            setNotifications(prev => [data, ...prev].slice(0, 10));
            setUnreadCount(prev => prev + 1);
        };

        socketService.on("notification", handleNewNotification);
        return () => {
            socketService.off("notification", handleNewNotification);
        };
    }, [userId]);

    const handleLogout = async () => {
        await AuthService.logout();
    };

    const handleMarkAsRead = async (id: string, link?: string) => {
        try {
            await AppNotificationService.markAsRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
            if (link) {
                navigate(link);
            }
        } catch (error) {
            console.error("Failed to mark as read:", error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await AppNotificationService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error("Failed to mark all as read:", error);
        }
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


            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
                {/* Notification Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="relative text-slate-500 hover:bg-slate-100 rounded-xl cursor-pointer">
                            <Bell size={20} />
                            {unreadCount > 0 && (
                                <span className="absolute top-2.5 right-2.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-white">
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                </span>
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80 rounded-2xl p-0 shadow-xl border-slate-100">
                        <div className="flex items-center justify-between p-4 border-b border-slate-50">
                            <DropdownMenuLabel className="font-bold text-slate-800 p-0">Notifikasi</DropdownMenuLabel>
                            {unreadCount > 0 && (
                                <button 
                                    onClick={handleMarkAllAsRead}
                                    className="text-xs text-blue-600 font-medium hover:text-blue-800 transition-colors"
                                >
                                    Tandai semua dibaca
                                </button>
                            )}
                        </div>
                        <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                            {notifications.length === 0 ? (
                                <div className="p-4 text-center text-sm text-slate-500">
                                    Belum ada notifikasi
                                </div>
                            ) : (
                                <div className="flex flex-col">
                                    {notifications.map((notif, index) => (
                                        <div 
                                            key={notif.id || index} 
                                            onClick={() => notif.id && handleMarkAsRead(notif.id, notif.link)}
                                            className={`p-4 border-b border-slate-50 last:border-0 cursor-pointer transition-colors hover:bg-slate-50 ${!notif.isRead ? 'bg-blue-50/30' : ''}`}
                                        >
                                            <div className="flex justify-between items-start mb-1">
                                                <h5 className={`text-sm ${!notif.isRead ? 'font-bold text-slate-800' : 'font-medium text-slate-600'}`}>
                                                    {notif.title}
                                                </h5>
                                                <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">
                                                    {moment(notif.createdAt).fromNow()}
                                                </span>
                                            </div>
                                            {notif.message && (
                                                <p className="text-xs text-slate-500 line-clamp-2">
                                                    {notif.message}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>

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
                                <AvatarImage src={user?.profile || user?.avatar} />
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
