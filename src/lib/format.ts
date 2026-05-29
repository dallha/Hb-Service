/**
 * Format a number as FCFA with space grouping
 * e.g. 35000 → "35 000 FCFA"
 */
export function formatPrice(price: number): string {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' FCFA';
}

/**
 * Generate a WhatsApp link with pre-filled message
 */
export function getWhatsAppLink(message: string): string {
  const phone = '221770000000';
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
