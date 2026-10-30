
import { formatLKR } from '@/lib/currency';


export interface CustomerOrderDetails {
  fullName: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  address: string;
  city: string;
  postalCode?: string;
  notes?: string;
}

export interface OrderCartItem {
  name: string;
  sku?: string | null;
  size: number | string;
  sizeSystem?: string;
  color: string;
  quantity: number;
  price: number;
}

export interface GenerateWhatsAppOrderParams {
  customer: CustomerOrderDetails;
  items: OrderCartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  orderNumber?: string;
  storePhone?: string; // dynamically fetched from store settings
}

export function generateWhatsAppOrderMessage({
  customer,
  items,
  subtotal,
  deliveryFee,
  total,
  orderNumber,
}: GenerateWhatsAppOrderParams): string {
  let message = `*NEW PROEDGE ORDER*\n`;
  if (orderNumber) {
    message += `*Order No:* ${orderNumber}\n`;
  }
  message += `\n*Order Items:*\n`;

  items.forEach((item, index) => {
    const sizeDisplay = item.sizeSystem && item.sizeSystem !== 'Custom' ? `${item.sizeSystem} ${item.size}` : `${item.size}`;
    const skuDisplay = item.sku ? ` [${item.sku}]` : '';
    message += `${index + 1}. *${item.name}*${skuDisplay}\n`;
    message += `   Size: ${sizeDisplay}\n`;
    message += `   Colour: ${item.color}\n`;
    message += `   Quantity: ${item.quantity}\n`;
    message += `   Price: ${formatLKR(item.price * item.quantity)}\n\n`;
  });

  message += `------------------------------\n`;
  message += `*Subtotal:* ${formatLKR(subtotal)}\n`;
  message += `*Delivery Fee:* ${deliveryFee === 0 ? 'FREE' : formatLKR(deliveryFee)}\n`;
  message += `*Total Amount:* ${formatLKR(total)}\n`;
  message += `------------------------------\n\n`;

  message += `*Customer Details:*\n`;
  message += `Name: ${customer.fullName}\n`;
  message += `Phone: ${customer.phone}\n`;
  if (customer.whatsapp) {
    message += `WhatsApp: ${customer.whatsapp}\n`;
  }
  if (customer.email) {
    message += `Email: ${customer.email}\n`;
  }
  message += `Address: ${customer.address}\n`;
  message += `City: ${customer.city}\n`;
  if (customer.postalCode) {
    message += `Postal Code: ${customer.postalCode}\n`;
  }

  if (customer.notes && customer.notes.trim()) {
    message += `\n*Order Notes:*\n${customer.notes.trim()}\n`;
  }

  return message;
}

export function generateWhatsAppOrderLink(params: GenerateWhatsAppOrderParams): string {
  const text = generateWhatsAppOrderMessage(params);
  const encodedText = encodeURIComponent(text);
  // Default to a fallback number if storePhone is missing or invalid
  const rawPhone = params.storePhone ?? '';
  if (!rawPhone.trim()) return '';
  let cleanPhone = rawPhone.replace(/[^0-9]/g, '');
  // if no country code is found and it's a Sri Lankan local format (e.g. 077), prefix +94
  if (cleanPhone.length === 10 && cleanPhone.startsWith('0')) {
    cleanPhone = '94' + cleanPhone.substring(1);
  } else if (cleanPhone.length === 9) {
    cleanPhone = '94' + cleanPhone;
  }
  
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
}

export function formatWhatsAppChatUrl(phone?: string, text?: string): string {
  const rawPhone = phone ?? '';
  if (!rawPhone.trim()) return '';
  let clean = rawPhone.replace(/[^0-9]/g, '');

  if (clean.length === 10 && clean.startsWith('0')) {
    clean = '94' + clean.substring(1);
  } else if (clean.length === 9) {
    clean = '94' + clean;
  }

  const encodedText = encodeURIComponent(text || 'Hello PROEDGE team! I have an inquiry.');
  return `https://wa.me/${clean}?text=${encodedText}`;
}
