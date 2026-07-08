"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Users, 
  BarChart3, 
  Settings, 
  User, 
  Bell, 
  LogOut 
} from "lucide-react";

const navigation = [
  { name: "TABLEAU DE BORD", href: "#", icon: LayoutDashboard },
  { name: "COMMANDES", href: "#", icon: ShoppingCart },
  { name: "CATALOGUE", href: "#", icon: Package },
  { name: "CLIENTS", href: "#", icon: Users },
  { name: "STATISTIQUES", href: "#", icon: BarChart3 },
  { name: "PARAMÈTRES", href: "#", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-primary text-white h-16 z-40 flex items-center px-4 md:px-6 shadow-lg border-t border-white/10">
      
      {/* Brand (Hidden on very small screens, visible on md) */}
      <div className="hidden md:flex items-center gap-2 mr-8">
        <span className="font-bold text-lg tracking-tight">HB SERVICE</span>
      </div>

      {/* Nav Items (Scrollable horizontally on mobile) */}
      <div className="flex-1 flex items-center justify-start md:justify-center gap-1 overflow-x-auto no-scrollbar">
        {navigation.map((item) => {
          const isActive = item.name === "TABLEAU DE BORD";
          const IconComponent = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center px-3 py-1 rounded-lg transition-colors flex-shrink-0 ${
                isActive ? "bg-white/20" : "hover:bg-white/10"
              }`}
            >
              <IconComponent size={20} className="mb-0.5" />
              <span className={`text-[10px] ${isActive ? "font-bold" : "font-medium"}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>

      {/* User Actions (Right side) */}
      <div className="flex items-center gap-2 md:gap-4 ml-4 md:ml-8">
        <div className="hidden md:flex items-center gap-2 border-r border-white/20 pr-4">
          <div className="w-8 h-8 rounded-full border border-white/30 bg-primary-container flex items-center justify-center">
            <User size={16} />
          </div>
          <span className="text-xs font-bold">Admin</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Action Button (Hidden on mobile to save space, or keep small) */}
          <button className="hidden sm:flex bg-[#D0A21C] hover:bg-[#b88c14] text-white px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors items-center gap-1">
            <Bell size={16} />
          </button>
          <button className="bg-error-container/20 hover:bg-error text-white px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors flex items-center gap-1">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </nav>
  );
}
