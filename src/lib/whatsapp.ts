import { STORE_CONFIG } from '@/lib/config';
import { formatLKR } from '@/data/products';

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
}

export function generateWhatsAppOrderMessage({
  customer,
  items,
  subtotal,
  deliveryFee,
  total,
  orderNumber,
}: GenerateWhatsAppOrderParams): string {
  let message = `*NEW ${STORE_CONFIG.name.toUpperCase()} ORDER*\n`;
  if (orderNumber) {
    message += `*Order No:* ${orderNumber}\n`;
  }
  message += `\n*Order Items:*\n`;

  items.forEach((item, index) => {
    const sizeDisplay = item.sizeSystem && item.sizeSystem !== 'Custom' ? `${item.sizeSystem} ${item.size}` : `${item.size}`;
    message += `${index + 1}. *${item.name}*\n`;
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
  const cleanPhone = STORE_CONFIG.whatsappNumber.replace(/[^0-9]/g, '');
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
}
