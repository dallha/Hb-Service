'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import type { SiteSettingsMap } from '@/lib/settings';
import { useChat } from 'ai/react';
import ReactMarkdown from 'react-markdown';
import { useCartStore } from '@/lib/store';

const SUGGESTIONS = [
  'Quels sont vos parfums les plus populaires ?',
  'Avez-vous des parfums boisés pour homme ?',
  'Quelle est votre collection Signature ?',
  'Comment sont fabriqués vos soins naturels ?',
];

export default function ConseillerVirtuel({ settings = {} }: { settings?: SiteSettingsMap }) {
  const [open, setOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { items } = useCartStore();

  const { messages, input, handleInputChange, handleSubmit, append, isLoading, error } = useChat({
    api: '/api/chat',
    body: {
      cartItems: items.map(item => ({
        name: item.productName || (item as any).name,
        size: item.variantSize || (item as any).size,
        quantity: item.quantity,
        price: item.price
      }))
    },
    initialMessages: [
      {
        id: '1',
        role: 'assistant',
        content: '👋 Bienvenue chez **HB Service** ! Je suis votre conseiller virtuel. Posez-moi toutes vos questions sur nos parfums, soins naturels, ou les collections.',
      }
    ]
  });

  const pathname = usePathname();
  if (pathname?.includes('/admin')) return null;

  const phoneNumber = settings.whatsapp_number || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '221778757474';
  const defaultMessage = encodeURIComponent("Bonjour HB Service ! Je viens de discuter avec le conseiller virtuel et j'aimerais un renseignement complémentaire.");
  const whatsappHref = `https://wa.me/${phoneNumber}?text=${defaultMessage}`;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  const handleSuggestionClick = (text: string) => {
    append({ role: 'user', content: text });
  };

  return (
    <>
      {/* Bouton flottant */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-amber-600 to-amber-800 text-white shadow-xl transition-all hover:scale-110 hover:shadow-2xl active:scale-95"
        aria-label={open ? 'Fermer le conseiller' : 'Ouvrir le conseiller virtuel'}
      >
        {open ? (
          <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current" aria-hidden="true">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current" aria-hidden="true">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z" />
            <circle cx="12" cy="11" r="1.5" />
            <circle cx="7.5" cy="11" r="1.5" />
            <circle cx="16.5" cy="11" r="1.5" />
          </svg>
        )}
      </button>

      {/* Fenêtre de chat */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-amber-200/30 dark:border-amber-800/30 overflow-hidden"
          >
            {/* En-tête */}
            <div className="flex items-center gap-3 bg-gradient-to-r from-amber-700 to-amber-900 px-5 py-4 text-white">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-lg">
                🧴
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">Conseiller HB Service</p>
                <p className="text-xs text-amber-200/70">Parfums & Soins Naturels</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/70 transition hover:bg-white/20 hover:text-white"
                aria-label="Fermer"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div className="flex h-[400px] flex-col overflow-y-auto p-4 space-y-4">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed prose prose-sm dark:prose-invert prose-p:my-1 prose-ul:my-1 ${
                      msg.role === 'user'
                        ? 'bg-amber-700 text-white rounded-br-md prose-p:text-white prose-strong:text-white'
                        : 'bg-amber-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-md border border-amber-200/20 dark:border-amber-800/20'
                    }`}
                  >
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                </div>
              ))}

              {error && (
                <div className="flex justify-center mt-2 mb-2">
                  <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs px-3 py-2 rounded-lg border border-red-200 dark:border-red-800/50 max-w-[80%] text-center">
                    Oups, une erreur de connexion est survenue. Vérifiez la clé API ou réessayez.
                  </div>
                </div>
              )}

              {isLoading && (
                <div className="flex justify-start mb-4">
                  <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-amber-50 dark:bg-slate-800 px-4 py-3 text-sm text-slate-500 dark:text-slate-400 border border-amber-200/20 dark:border-amber-800/20">
                    <span className="inline-flex gap-1">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-amber-500" style={{ animationDelay: '0ms' }} />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-amber-500" style={{ animationDelay: '150ms' }} />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-amber-500" style={{ animationDelay: '300ms' }} />
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions */}
            {messages.length === 1 && (
              <div className="flex flex-wrap gap-2 px-4 pb-2">
                {SUGGESTIONS.map((suggestion, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="rounded-full border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-slate-800 px-3 py-1.5 text-xs text-amber-800 dark:text-amber-300 transition hover:border-amber-500 hover:bg-amber-100 dark:hover:bg-amber-900/30"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            {/* Lien WhatsApp direct */}
            <div className="px-4 pb-1">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366]/10 border border-[#25D366]/20 px-4 py-2.5 text-xs text-[#25D366] font-medium transition hover:bg-[#25D366]/20"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                <span>Contacter sur WhatsApp</span>
              </a>
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="border-t border-amber-200/20 dark:border-amber-800/20 p-4">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Posez votre question..."
                  disabled={isLoading}
                  className="flex-1 rounded-xl border border-amber-200/30 dark:border-amber-800/30 bg-amber-50/50 dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-700 text-white transition hover:bg-amber-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Envoyer"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
