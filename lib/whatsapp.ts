import type {Locale} from '@/i18n/routing';
import {formatPrice} from '@/lib/utils';

// WhatsApp-first ordering. The confirmation page builds a wa.me deep link from
// the persisted order + the boutique number in SiteSetting('whatsappNumber').
// No webhook, no endpoint.

export type WaOrder = {
  orderNumber: string;
  recipientName: string;
  recipientPhone?: string | null;
  senderName?: string | null;
  giftNote?: string | null;
  deliveryDate: string; // ISO
  deliveryTimeSlot?: string | null;
  area?: string | null;
  addressLine?: string | null;
  total: number;
  currency: string;
  paymentMethod: string;
  items: {nameEn: string; nameAr: string; quantity: number}[];
  addOns: {nameEn: string; nameAr: string; quantity: number}[];
};

const SLOT: Record<string, {en: string; ar: string}> = {
  MORNING: {en: 'Morning', ar: 'صباحاً'},
  AFTERNOON: {en: 'Afternoon', ar: 'ظهراً'},
  EVENING: {en: 'Evening', ar: 'مساءً'}
};
const METHOD: Record<string, {en: string; ar: string}> = {
  WHATSAPP: {en: 'WhatsApp', ar: 'واتساب'},
  BANK_TRANSFER: {en: 'Bank transfer', ar: 'تحويل بنكي'},
  CASH_ON_DELIVERY: {en: 'Cash on delivery', ar: 'الدفع عند الاستلام'},
  ONLINE_PLACEHOLDER: {en: 'Online (soon)', ar: 'أونلاين (قريباً)'}
};

/** Build the human-readable WhatsApp order message in the customer's locale. */
export function buildWhatsAppMessage(order: WaOrder, locale: Locale): string {
  const ar = locale === 'ar';
  const name = (en: string, arName: string) => (ar ? arName : en);
  const date = order.deliveryDate.slice(0, 10);
  const slot = order.deliveryTimeSlot ? SLOT[order.deliveryTimeSlot]?.[locale] ?? '' : '';
  const method = METHOD[order.paymentMethod]?.[locale] ?? order.paymentMethod;
  const L: string[] = [];

  if (ar) {
    L.push(`مرحباً ريماسيا 🌸`);
    L.push(`أمنية رقم: ${order.orderNumber}`);
    L.push('');
    L.push('🌷 الباقات:');
    for (const it of order.items) L.push(`• ${it.nameAr} × ${it.quantity}`);
    if (order.addOns.length) {
      L.push('🎀 إضافات:');
      for (const a of order.addOns) L.push(`• ${a.nameAr} × ${a.quantity}`);
    }
    if (order.giftNote) L.push(`💌 بطاقة الإهداء: ${order.giftNote}`);
    L.push('');
    L.push(`👰 المستلم: ${order.recipientName}${order.recipientPhone ? ` (${order.recipientPhone})` : ''}`);
    if (order.addressLine) L.push(`📍 العنوان: ${order.addressLine}${order.area ? `، ${order.area}` : ''}`);
    L.push(`🗓️ التوصيل: ${date}${slot ? ` — ${slot}` : ''}`);
    L.push(`💳 طريقة الطلب: ${method}`);
    L.push(`💰 الإجمالي: ${formatPrice(order.total, locale, order.currency)}`);
  } else {
    L.push(`Hello Remasia 🌸`);
    L.push(`Wish #: ${order.orderNumber}`);
    L.push('');
    L.push('🌷 Bouquets:');
    for (const it of order.items) L.push(`• ${it.nameEn} × ${it.quantity}`);
    if (order.addOns.length) {
      L.push('🎀 Add-ons:');
      for (const a of order.addOns) L.push(`• ${a.nameEn} × ${a.quantity}`);
    }
    if (order.giftNote) L.push(`💌 Gift note: ${order.giftNote}`);
    L.push('');
    L.push(`👰 Recipient: ${order.recipientName}${order.recipientPhone ? ` (${order.recipientPhone})` : ''}`);
    if (order.addressLine) L.push(`📍 Address: ${order.addressLine}${order.area ? `, ${order.area}` : ''}`);
    L.push(`🗓️ Delivery: ${date}${slot ? ` — ${slot}` : ''}`);
    L.push(`💳 Method: ${method}`);
    L.push(`💰 Total: ${formatPrice(order.total, locale, order.currency)}`);
  }
  return L.join('\n');
}

/** Construct a https://wa.me/<number>?text=<encoded> link. */
export function buildWaLink(whatsappNumber: string, message: string): string {
  const number = whatsappNumber.replace(/[^\d]/g, '');
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
