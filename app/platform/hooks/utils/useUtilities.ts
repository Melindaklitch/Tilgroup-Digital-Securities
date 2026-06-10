import { useState, useEffect, useCallback } from 'react';

// ============================================
// TYPES & INTERFACES
// ============================================

export interface Purchase {
  id?: string;
  user_id?: string;
  asset_name: string;
  asset_key?: string;
  asset_name_key?: string;
  total_usd: number;
  quantity?: number;
  price_usd?: number;
  created_at: string;
  payment_token?: string;
  tx_signature?: string;
  [key: string]: any;
}

export interface AssetValue {
  value: number;
  change: number;
  displayValue: string;
  changeFormatted: string;
  isPositive: boolean;
}

export interface ROIRates {
  [key: string]: number;
}

export interface AssetNameMapping {
  [key: string]: string;
}

// ============================================
// CONSTANTS
// ============================================

// Annual ROI rates by asset type (as decimals)
export const MARINE_ROI_RATES: ROIRates = {
  portConcessions: 0.07,      // 7% annual
  dockingFees: 0.05,          // 5% annual
  containerHandling: 0.08,    // 8% annual
  logisticsInfrastructure: 0.09, // 9% annual
  straitPassageRights: 0.10,  // 10% annual
  tilTerminalx: 0.11,         // 11% annual
};

// Default ROI rate for unknown assets
export const DEFAULT_ROI_RATE = 0.07;

// Asset name key mappings (legacy to new)
export const ASSET_NAME_MAPPINGS: AssetNameMapping = {
  'PresaleAssets.tilTerminalx.name': 'assets.tilTerminalx.name',
  'PresaleAssets.portConcessions.name': 'assets.portConcessions.name',
  'PresaleAssets.dockingFees.name': 'assets.dockingFees.name',
  'PresaleAssets.containerHandling.name': 'assets.containerHandling.name',
  'PresaleAssets.logisticsInfrastructure.name': 'assets.logisticsInfrastructure.name',
  'PresaleAssets.straitPassageRights.name': 'assets.straitPassageRights.name',
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Extract asset type from various name formats
 */
export function extractAssetType(assetName: string): string {
  if (!assetName) return 'unknown';
  
  // Remove common prefixes
  let cleaned = assetName
    .replace(/^assets\./, '')
    .replace(/^PresaleAssets\./, '')
    .replace(/\.name$/, '');
  
  // Check if it matches any known asset type
  const knownTypes = Object.keys(MARINE_ROI_RATES);
  if (knownTypes.includes(cleaned)) {
    return cleaned;
  }
  
  // Try to find by partial match
  for (const type of knownTypes) {
    if (cleaned.includes(type) || type.includes(cleaned)) {
      return type;
    }
  }
  
  return 'portConcessions'; // Default fallback
}

/**
 * Get ROI rate for an asset type
 */
export function getROIRate(assetType: string): number {
  return MARINE_ROI_RATES[assetType] || DEFAULT_ROI_RATE;
}

/**
 * Calculate time difference in years between two dates
 */
export function calculateYearsDifference(startDate: Date, endDate: Date = new Date()): number {
  const diffMs = endDate.getTime() - startDate.getTime();
  return diffMs / (1000 * 60 * 60 * 24 * 365.25);
}

/**
 * Format currency value
 */
export function formatCurrency(value: number, options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options,
  }).format(value);
}

/**
 * Format percentage change
 */
export function formatPercentageChange(change: number): string {
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(2)}%`;
}

/**
 * Get color class for percentage change
 */
export function getChangeColorClass(change: number): string {
  if (change > 0) return 'text-green-400';
  if (change < 0) return 'text-red-400';
  return 'text-gray-400';
}

/**
 * Get icon for percentage change
 */
export function getChangeIcon(change: number): 'trending-up' | 'trending-down' | 'minus' {
  if (change > 0) return 'trending-up';
  if (change < 0) return 'trending-down';
  return 'minus';
}

// ============================================
// MAIN HOOK
// ============================================

export function useUtilities() {

  /**
   * Translate asset name with legacy key mapping support
   * @param assetKey - The asset key to translate
   * @returns Translated asset name
   */
 
  const translateAssetName = (assetKey: string): string => {
  if (!assetKey) return '';
  
  // Apply legacy mapping if needed
  const actualKey = ASSET_NAME_MAPPINGS[assetKey] || assetKey;
  
  // Hardcoded asset names
  const nameMap: Record<string, string> = {
    'assets.portConcessions.name': 'Port Concession Rights',
    'assets.dockingFees.name': 'Docking & Berthing Fees',
    'assets.containerHandling.name': 'Container Handling Rights',
    'assets.logisticsInfrastructure.name': 'Logistics Infrastructure',
    'assets.straitPassageRights.name': 'Strait Passage Rights',
    'assets.tilTerminalx.name': 'TIL Terminal X Digital Infrastructure',
  };
  
  return nameMap[actualKey] || actualKey.replace(/^assets\./, '').replace(/\.name$/, '').replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
};

  /**
   * Calculate current value of an investment based on ROI rates
   * @param purchase - Purchase object containing asset and value data
   * @returns Object with current value, percentage change, and formatted display
   */
  const calculateCurrentValue = (purchase: Purchase): AssetValue => {
    // Validate input
    if (!purchase) {
      return {
        value: 0,
        change: 0,
        displayValue: formatCurrency(0),
        changeFormatted: '0.00%',
        isPositive: false,
      };
    }

    const base = purchase.total_usd || 0;
    
    if (base <= 0) {
      return {
        value: 0,
        change: 0,
        displayValue: formatCurrency(0),
        changeFormatted: '0.00%',
        isPositive: false,
      };
    }

    // Calculate time elapsed
    const createdAt = new Date(purchase.created_at);
    const yearsElapsed = calculateYearsDifference(createdAt);

    // Determine asset type and get ROI rate
    const assetName = purchase.asset_name || purchase.asset_key || '';
    const assetType = extractAssetType(assetName);
    const annualRate = getROIRate(assetType);

    // Calculate compounded value
    const currentValue = base * Math.pow(1 + annualRate, yearsElapsed);
    const changePercent = ((currentValue - base) / base) * 100;

    return {
      value: currentValue,
      change: changePercent,
      displayValue: formatCurrency(currentValue),
      changeFormatted: formatPercentageChange(changePercent),
      isPositive: changePercent > 0,
    };
  };

  /**
   * Calculate portfolio total value
   * @param purchases - Array of purchase objects
   * @returns Total portfolio value
   */
  const calculatePortfolioTotal = (purchases: Purchase[]): number => {
    if (!purchases || purchases.length === 0) return 0;
    
    return purchases.reduce((total, purchase) => {
      const { value } = calculateCurrentValue(purchase);
      return total + value;
    }, 0);
  };

  /**
   * Calculate portfolio performance metrics
   * @param purchases - Array of purchase objects
   * @returns Performance metrics
   */
  const calculatePortfolioPerformance = (purchases: Purchase[]) => {
    if (!purchases || purchases.length === 0) {
      return {
        totalInvested: 0,
        currentValue: 0,
        totalReturn: 0,
        totalReturnPercentage: 0,
        averageReturn: 0,
      };
    }

    const totalInvested = purchases.reduce((sum, p) => sum + (p.total_usd || 0), 0);
    const currentValue = calculatePortfolioTotal(purchases);
    const totalReturn = currentValue - totalInvested;
    const totalReturnPercentage = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;
    const averageReturn = totalReturnPercentage / purchases.length;

    return {
      totalInvested,
      currentValue,
      totalReturn,
      totalReturnPercentage,
      averageReturn,
    };
  };

  /**
   * Get ROI rate for display
   * @param assetType - Type of asset
   * @returns Formatted ROI rate
   */
  const getDisplayROI = (assetType: string): string => {
    const rate = getROIRate(assetType);
    return `${(rate * 100).toFixed(0)}%`;
  };

  /**
   * Get all available ROI rates
   * @returns Object with all ROI rates
   */
  const getAllROIRates = (): ROIRates => {
    return { ...MARINE_ROI_RATES };
  };

  return {
    // Core functions
    translateAssetName,
    calculateCurrentValue,
    
    // Portfolio functions
    calculatePortfolioTotal,
    calculatePortfolioPerformance,
    
    // Utility functions
    formatCurrency,
    formatPercentageChange,
    getChangeColorClass,
    getChangeIcon,
    
    // Asset functions
    extractAssetType,
    getROIRate,
    getDisplayROI,
    getAllROIRates,
    
    // Constants
    MARINE_ROI_RATES,
    DEFAULT_ROI_RATE,
  };
}

// ============================================
// ADDITIONAL HOOKS
// ============================================

/**
 * Hook for real-time portfolio value updates
 * @param purchases - Array of purchase objects
 * @param updateInterval - Interval in milliseconds (default: 60000)
 */
export function usePortfolioValue(purchases: Purchase[], updateInterval: number = 60000) {
  const [portfolioValue, setPortfolioValue] = useState<number>(0);
  const [performance, setPerformance] = useState<ReturnType<ReturnType<typeof useUtilities>['calculatePortfolioPerformance']> | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  const { calculatePortfolioTotal, calculatePortfolioPerformance } = useUtilities();
  
  const updatePortfolio = useCallback(() => {
    const total = calculatePortfolioTotal(purchases);
    const perf = calculatePortfolioPerformance(purchases);
    
    setPortfolioValue(total);
    setPerformance(perf);
    setLastUpdated(new Date());
  }, [purchases, calculatePortfolioTotal, calculatePortfolioPerformance]);
  
  useEffect(() => {
    updatePortfolio();
    
    const interval = setInterval(updatePortfolio, updateInterval);
    return () => clearInterval(interval);
  }, [updatePortfolio, updateInterval]);
  
  return {
    portfolioValue,
    performance,
    lastUpdated,
    refresh: updatePortfolio,
  };
}

/**
 * Hook for asset value prediction
 * @param purchase - Purchase object
 * @param years - Number of years to project
 */
export function useAssetProjection(purchase: Purchase | null, years: number = 5) {
  const [projections, setProjections] = useState<Array<{ year: number; value: number; formattedValue: string }>>([]);
  
  const { calculateCurrentValue, getROIRate, extractAssetType } = useUtilities();
  
  useEffect(() => {
    if (!purchase || !purchase.total_usd) {
      setProjections([]);
      return;
    }
    
    const baseValue = purchase.total_usd;
    const assetType = extractAssetType(purchase.asset_name || '');
    const annualRate = getROIRate(assetType);
    
    const projectionsData = [];
    for (let year = 1; year <= years; year++) {
      const value = baseValue * Math.pow(1 + annualRate, year);
      projectionsData.push({
        year,
        value,
        formattedValue: formatCurrency(value),
      });
    }
    
    setProjections(projectionsData);
  }, [purchase, years, getROIRate, extractAssetType]);
  
  return { projections };
}
