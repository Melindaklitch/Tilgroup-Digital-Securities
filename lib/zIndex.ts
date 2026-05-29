// lib/zIndex.ts

// ============================================
// TYPES
// ============================================

export type ZIndexLayer = 
  | 'MODAL'
  | 'TOAST'
  | 'DROPDOWN'
  | 'HEADER'
  | 'DRAWER'
  | 'OVERLAY'
  | 'POPOVER'
  | 'TOOLTIP'
  | 'BASE';

// ============================================
// Z-INDEX CONSTANTS
// ============================================

export const Z_INDEX: Record<ZIndexLayer, number> = {
  MODAL: 9999,
  TOAST: 9998,
  POPOVER: 1050,
  OVERLAY: 1040,
  DROPDOWN: 1000,
  HEADER: 100,
  DRAWER: 50,
  TOOLTIP: 40,
  BASE: 1,
} as const;

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get z-index value by layer name
 * @param layer - Z-index layer name
 * @returns Z-index number
 */
export function getZIndex(layer: ZIndexLayer): number {
  return Z_INDEX[layer];
}

/**
 * Get z-index for modal (with optional offset)
 * @param offset - Additional offset (default: 0)
 * @returns Z-index number
 */
export function getModalZIndex(offset: number = 0): number {
  return Z_INDEX.MODAL + offset;
}

/**
 * Get z-index for toast (with optional offset)
 * @param offset - Additional offset (default: 0)
 * @returns Z-index number
 */
export function getToastZIndex(offset: number = 0): number {
  return Z_INDEX.TOAST + offset;
}

/**
 * Get highest z-index used
 * @returns Highest z-index value
 */
export function getHighestZIndex(): number {
  return Math.max(...Object.values(Z_INDEX));
}

/**
 * Check if a z-index value is in use
 * @param value - Z-index value to check
 * @returns Boolean indicating if value is reserved
 */
export function isReservedZIndex(value: number): boolean {
  return Object.values(Z_INDEX).includes(value);
}

// ============================================
// CSS VARIABLE HELPERS
// ============================================

/**
 * Get z-index as CSS custom property string
 * @param layer - Z-index layer name
 * @returns CSS variable string
 */
export function getZIndexCssVar(layer: ZIndexLayer): string {
  return `var(--z-${layer.toLowerCase()}, ${Z_INDEX[layer]})`;
}

/**
 * Generate CSS custom properties for all z-index layers
 * @returns CSS string with all z-index variables
 */
export function generateZIndexCssVars(): string {
  return Object.entries(Z_INDEX)
    .map(([key, value]) => `  --z-${key.toLowerCase()}: ${value};`)
    .join('\n');
}

// ============================================
// EXPORTS
// ============================================

export default Z_INDEX;
