'use client';

import { Printer } from 'lucide-react';

export default function InvoiceActions() {
  return (
    <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 print:hidden bg-gray-50 p-4 rounded-md border border-gray-200">
      <p className="text-xs sm:text-sm text-gray-600">Vue de la facture. Vous pouvez vérifier les informations avant d'imprimer.</p>
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
        <button
          onClick={() => window.close()}
          className="w-full sm:w-auto px-6 h-10 border border-gray-300 rounded-none text-xs uppercase tracking-wider hover:bg-gray-100 transition-colors"
        >
          Fermer l'onglet
        </button>
        <button
          onClick={() => window.print()}
          className="w-full sm:w-auto flex items-center justify-center px-6 h-10 bg-[#1A1A1A] hover:bg-[#1A1A1A]/90 text-white rounded-none text-xs uppercase tracking-wider transition-colors"
        >
          <Printer className="w-4 h-4 mr-2" />
          Imprimer
        </button>
      </div>
    </div>
  );
}
