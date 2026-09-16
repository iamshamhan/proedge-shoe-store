export const STORE_CONFIG = {
  name: 'PROEDGE',
  tagline: 'Built for Your Next Step',
  whatsappNumber: '94771234567', // Sri Lanka format e.g. +94 77 123 4567
  defaultDeliveryFee: 500, // in LKR
  freeDeliveryThreshold: 30000, // in LKR
  currencySymbol: 'Rs.',
};

export function getDeliveryFee(subtotal: number): number {
  if (subtotal >= STORE_CONFIG.freeDeliveryThreshold) {
    return 0;
  }
  return STORE_CONFIG.defaultDeliveryFee;
}
