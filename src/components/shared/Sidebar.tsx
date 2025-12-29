import { ChevronDown, ChevronRight, Wallet, Eye, EyeOff } from "lucide-react";
import { NavLink, Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { NAVIGATION_ITEMS } from "@/constants/navigation";
import { useSidebar } from "@/providers/sidebar-provider";
import { useDisclosure } from "@/hooks/use-disclosure";
import { useState } from "react";
import { AuthService, type PermissionResource } from "@/services/auth.service";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const Sidebar = () => {
  const { isCollapsed, toggleCollapse } = useSidebar();
  const { isOpen: showSaldo, onToggle: toggleSaldo } = useDisclosure(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const user = AuthService.getUser();

  const toggleExpand = (title: string) => {
    if (isCollapsed) {
      toggleCollapse();
      if (!expandedItems.includes(title)) {
        setExpandedItems((prev) => [...prev, title]);
      }
    } else {
      setExpandedItems((prev) =>
        prev.includes(title)
          ? prev.filter((i) => i !== title)
          : [...prev, title],
      );
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

  // Filter items based on permissions
  const filteredItems = NAVIGATION_ITEMS.map(item => {
    // If it has sub-items, filter them first
    if (item.items) {
      const permittedSubItems = item.items.filter(subItem =>
        !subItem.resource || AuthService.hasPermission(user?.role || "USER", subItem.resource as PermissionResource, "view")
      );

      return {
        ...item,
        items: permittedSubItems
      };
    }

    // If it's a direct link, check its permission
    const isPermitted = !item.resource || AuthService.hasPermission(user?.role || "USER", item.resource as PermissionResource, "view");
    return isPermitted ? item : null;
  }).filter((item): item is typeof NAVIGATION_ITEMS[0] => {
    if (!item) return false;

    // If it has sub-items, only show if at least one sub-item is permitted
    if (item.items) {
      return item.items.length > 0;
    }

    return true;
  });

  return (
    <TooltipProvider delayDuration={0}>
      <div
        className={cn(
          "bg-brand-blue h-screen flex flex-col text-slate-300 overflow-y-auto overflow-x-hidden shrink-0 transition-all duration-300 custom-scrollbar",
          isCollapsed ? "w-20" : "w-64",
        )}
      >
        {/* Brand */}
        <Link
          to="/"
          className={cn(
            "p-6 flex items-center transition-all duration-300",
            isCollapsed ? "justify-center" : "space-x-3",
          )}
        >
          <div className="w-8 h-8 shrink-0 flex items-center justify-center">
            <img
              src="/logo.svg"
              alt="GSM"
              className="w-8 h-8"
              onError={(e) =>
                (e.currentTarget.src = "https://placehold.co/32x32?text=G")
              }
            />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col animate-in fade-in slide-in-from-left-2 duration-300">
              <span className="font-bold text-white text-xl leading-none">
                GSM
              </span>
              <span className="text-[10px] text-slate-400 whitespace-nowrap">
                PT. GAF SOLUSINDO MEDIA
              </span>
            </div>
          )}
        </Link>

        {/* Saldo Widget */}
        {!isCollapsed && (
          <div className="px-4 mb-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="bg-blue-600/20 rounded-2xl p-4 relative overflow-hidden group border border-blue-500/10">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Available Balance
                </span>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    toggleSaldo();
                  }}
                  className="p-1 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"
                >
                  {showSaldo ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-lg font-bold text-white tracking-tight font-mono">
                    {showSaldo ? "Rp 12.450.000" : "Rp ••••••••"}
                  </span>
                </div>
                <div className="bg-blue-500/30 p-2 rounded-xl">
                  <Wallet size={20} className="text-blue-400" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex-1 px-3 space-y-1">
          {!isCollapsed && (
            <p className="text-[10px] font-bold text-slate-500 px-3 mb-2 uppercase tracking-widest">
              Main Menu
            </p>
          )}

          {filteredItems.map((item) => (
            <div key={item.title}>
              {item.items ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => toggleExpand(item.title)}
                      className={cn(
                        "w-full flex items-center px-3 py-2.5 rounded-xl text-sm transition-all duration-200",
                        "hover:bg-white/5 hover:text-white group relative",
                        expandedItems.includes(item.title) && !isCollapsed
                          ? "text-white"
                          : "text-slate-400",
                        isCollapsed ? "justify-center" : "justify-between",
                      )}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={cn(
                            "p-1.5 rounded-lg transition-colors",
                            expandedItems.includes(item.title) && !isCollapsed
                              ? "bg-blue-500/20 text-blue-400"
                              : "bg-transparent group-hover:text-blue-400",
                          )}
                        >
                          <item.icon size={20} />
                        </div>
                        {!isCollapsed && (
                          <span className="font-medium animate-in fade-in slide-in-from-left-2 duration-300">
                            {item.title}
                          </span>
                        )}
                      </div>
                      {!isCollapsed && (
                        <div className="text-slate-500">
                          {expandedItems.includes(item.title) ? (
                            <ChevronDown size={14} />
                          ) : (
                            <ChevronRight size={14} />
                          )}
                        </div>
                      )}
                    </button>
                  </TooltipTrigger>
                  {isCollapsed && (
                    <TooltipContent side="right">{item.title}</TooltipContent>
                  )}
                </Tooltip>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <NavLink
                      to={item.href || "#"}
                      className={({ isActive }) =>
                        cn(
                          "w-full flex items-center px-3 py-2.5 rounded-xl text-sm transition-all duration-200 group relative",
                          isCollapsed ? "justify-center" : "space-x-3",
                          isActive
                            ? "bg-blue-600 text-white"
                            : "text-slate-400 hover:bg-white/5 hover:text-white hover:translate-x-1",
                        )
                      }
                    >
                      <div
                        className={cn(
                          "p-1.5 rounded-lg transition-colors",
                          "group-hover:text-blue-400",
                        )}
                      >
                        <item.icon size={20} />
                      </div>
                      {!isCollapsed && (
                        <span className="font-medium animate-in fade-in slide-in-from-left-2 duration-300">
                          {item.title}
                        </span>
                      )}
                    </NavLink>
                  </TooltipTrigger>
                  {isCollapsed && (
                    <TooltipContent side="right">{item.title}</TooltipContent>
                  )}
                </Tooltip>
              )}

              {item.items && expandedItems.includes(item.title) && (
                <div className="ml-6 mr-2 mt-1 space-y-1 border-l border-white/5 animate-in fade-in slide-in-from-top-1 duration-300">
                  {item.items.map((subItem) => (
                    <NavLink
                      key={subItem.title}
                      to={subItem.href}
                      className={({ isActive }) =>
                        cn(
                          "block pl-6 pr-3 py-2 text-[12px] transition-all relative",
                          isActive
                            ? "text-blue-400 font-bold before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-4 before:bg-blue-500 before:rounded-r-full"
                            : "text-slate-500 hover:text-slate-200 hover:pl-7",
                        )
                      }
                    >
                      {subItem.title}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer User */}
        <div className="p-3 mt-auto">
          <div
            className={cn(
              "bg-white/5 rounded-2xl transition-all duration-300 flex items-center border border-white/5",
              isCollapsed ? "p-2 justify-center" : "p-3 space-x-3",
            )}
          >
            <div className="w-8 h-8 shrink-0 rounded-full bg-blue-500 flex items-center justify-center font-bold text-xs text-white">
              {user ? getInitials(user.name) : "U"}
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0 animate-in fade-in slide-in-from-left-2 duration-300">
                <p className="text-xs font-bold text-white truncate">
                  {user?.name || "User"}
                </p>
                <p className="text-[10px] text-slate-500 truncate uppercase tracking-tighter">
                  {user ? formatRole(user.role) : "Guest"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};
