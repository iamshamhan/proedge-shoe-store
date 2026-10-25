import type { ProductVariant, SizeSystem } from '@/types/product';

export function resolveProductVariant(
  variants: ProductVariant[], colour: string, system: SizeSystem, value: string,
  fallbackSystem: SizeSystem = 'Custom',
): ProductVariant | null {
  return variants.find(variant => variant.colour === colour
    && (variant.sizeSystem ?? fallbackSystem) === system
    && String(variant.sizeValue || variant.size) === value) ?? null;
}
