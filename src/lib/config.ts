export const STORE_CONFIG = {
  name: 'PROEDGE',
  tagline: 'Built for Your Next Step',
  whatsappNumber: '94771234567', // Sri Lanka format e.g. +94 77 123 4567
  defaultDeliveryFee: 500, // in LKR
  freeDeliveryThreshold: 30000, // in LKR
  currencySymbol: 'Rs.',
};

export function getDeliveryFee(
  subtotal: number,
  settings?: {
    freeDeliveryEnabled?: boolean;
    freeDeliveryThreshold?: number;
    defaultDeliveryFee?: number;
  },
): number {
  const isEnabled = settings?.freeDeliveryEnabled ?? true;
  const threshold = settings?.freeDeliveryThreshold ?? STORE_CONFIG.freeDeliveryThreshold;
  const defaultFee = settings?.defaultDeliveryFee ?? STORE_CONFIG.defaultDeliveryFee;

  if (isEnabled && subtotal >= threshold) {
    return 0;
  }
  return defaultFee;
}
