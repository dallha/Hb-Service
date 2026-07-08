"use client";

import { Menu, User } from "lucide-react";

/**
 * Composant DashboardHeader
 * 
 * Cet en-tête s'affiche en haut de la zone de contenu du Dashboard.
 * Il contient le titre de la page actuelle (passé en prop) ainsi que l'avatar de l'utilisateur.
 * Sur mobile, il inclut un bouton menu (actuellement caché si on utilise la navigation basse, mais utile si on repasse sur une sidebar).
 * 
 * @param title - Le titre de la page affichée
 */
export function DashboardHeader({ title }: { title?: string }) {
  return (
    <header className="flex justify-between items-center h-16 w-full mb-6">
      <div className="flex items-center gap-4">
        {/* On mobile, this button would toggle the sidebar */}
        <button className="md:hidden w-12 h-12 flex items-center justify-center rounded-full bg-surface-container-low text-primary">
          <Menu size={24} />
        </button>
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-primary font-bold">
          {title || "HB Service"}
        </h1>
      </div>
      <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center overflow-hidden text-white">
        <User size={20} />
      </div>
    </header>
  );
}
