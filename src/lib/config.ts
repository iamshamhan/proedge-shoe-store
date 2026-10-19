export const STORE_CONFIG = {
  name: 'Pro Edge',
  tagline: 'Built for Your Next Step',
  whatsappNumber: '94763871280', // Sri Lanka format +94 76 387 1280
  defaultDeliveryFee: 600, // in LKR
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
