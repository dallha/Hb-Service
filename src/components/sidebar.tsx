"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { name: "Pilotage", href: "#", icon: "dashboard" },
  { name: "Espace Échanges", href: "#", icon: "forum" },
  { name: "Daara / Halaqāt", href: "#", icon: "menu_book" },
  { name: "Pôle Scolarité", href: "#", icon: "school" },
  { name: "Groupe Scolaire Français", href: "#", icon: "history_edu" },
  { name: "Vie Scolaire", href: "#", icon: "group" },
  { name: "Comptabilité", href: "#", icon: "payments" },
  { name: "RAF", href: "#", icon: "account_balance" },
  { name: "Ressources Humaines", href: "#", icon: "badge" },
  { name: "Admin", href: "#", icon: "settings" },
  { name: "Gestion des Accès", href: "#", icon: "lock_person" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-y-0 left-0 z-50 flex flex-col w-[280px] bg-surface-sidebar shadow-md rounded-r-xl h-full overflow-hidden border-r border-outline-soft">
      {/* Header Profile Section */}
      <div className="p-6 bg-surface-sidebar border-b border-outline-soft flex flex-col items-start gap-4">
        <div className="w-16 h-16 rounded-full ring-2 ring-primary/20 ring-offset-2 overflow-hidden bg-primary-container flex items-center justify-center text-white font-bold text-xl">
          <span className="material-symbols-outlined text-4xl">account_circle</span>
        </div>
        <div>
          <h2 className="font-title-md text-title-md text-primary font-extrabold">mrniass</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">Super Admin</p>
          <p className="mt-1 font-label-caps text-[10px] text-primary bg-surface-container px-2 py-0.5 rounded-full inline-block">Institut Al Mouyassar</p>
        </div>
      </div>

      {/* Scrollable Navigation Items */}
      <div className="flex-1 overflow-y-auto py-4">
        <ul className="flex flex-col">
          {navigation.map((item) => {
            // Pour l'instant on simule l'état actif sur le premier élément "Pilotage"
            const isActive = item.name === "Pilotage";
            
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-4 rounded-lg px-4 py-3 mx-4 my-1 transition-all duration-200 ${
                    isActive
                      ? "bg-primary text-on-primary shadow-lg shadow-primary/20 scale-[0.98] font-semibold"
                      : "text-on-surface-variant hover:bg-surface-container-high"
                  }`}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{
                      fontSize: "28px",
                      fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                    }}
                  >
                    {item.icon}
                  </span>
                  <span className="font-body-lg text-body-lg">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Footer Section */}
      <div className="p-4 border-t border-outline-soft flex flex-col gap-2 bg-surface-sidebar">
        <button className="w-full flex items-center justify-center gap-3 bg-[#D0A21C] text-white py-3 px-4 rounded-lg font-title-md text-title-md hover:brightness-110 active:scale-95 transition-all shadow-md">
          <span className="material-symbols-outlined" style={{ fontSize: "28px" }}>event_available</span>
          Configurer l'Année
        </button>
        <button className="w-full flex items-center justify-center gap-3 bg-surface-container text-error py-3 px-4 rounded-lg font-title-md text-title-md hover:bg-error-container active:scale-95 transition-all">
          <span className="material-symbols-outlined" style={{ fontSize: "28px" }}>logout</span>
          Déconnexion
        </button>
      </div>
    </nav>
  );
}
