import type {Locale} from '@/i18n/routing';

// WhatsApp-first ordering. The confirmation page (/[locale]/order/[orderNumber])
// builds a wa.me deep link from the persisted order + the boutique number stored
// in SiteSetting('whatsappNumber'). No webhook, no endpoint.
//
// NOTE: skeleton — the full bilingual message is filled in when checkout is built.

export type WaOrderSummary = {
  orderNumber: string;
  recipientName: string;
  deliveryDate: Date | string;
  deliveryTimeSlot?: string | null;
  total: number;
  currency?: string;
  items: {name: string; quantity: number}[];
  addOns?: {name: string; quantity: number}[];
  giftNote?: string | null;
};

/** Build the human-readable WhatsApp order message. TODO: full bilingual copy. */
export function buildWhatsAppMessage(order: WaOrderSummary, locale: Locale = 'ar'): string {
  const lines: string[] = [];
  if (locale === 'ar') {
    lines.push(`مرحباً ريماسيا 🌸 أمنيتي رقم: ${order.orderNumber}`);
    lines.push(`المستلم: ${order.recipientName}`);
  } else {
    lines.push(`Hello Remasia 🌸 My wish #: ${order.orderNumber}`);
    lines.push(`Recipient: ${order.recipientName}`);
  }
  for (const it of order.items) lines.push(`• ${it.name} × ${it.quantity}`);
  // TODO: add-ons, delivery date/time, gift note, total, chosen method.
  return lines.join('\n');
}

/** Construct a https://wa.me/<number>?text=<encoded> link. */
export function buildWaLink(whatsappNumber: string, message: string): string {
  const number = whatsappNumber.replace(/[^\d]/g, '');
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
