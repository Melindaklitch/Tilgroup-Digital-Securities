import { PublicKey } from '@solana/web3.js';
import { USDC_MINT } from './balanceCheck';

// ============================================
// CONFIGURATION
// ============================================

export const TEST_MODE = process.env.NEXT_PUBLIC_TEST_MODE === 'true' || true; // 🧪 Set to false later for real transactions

// RPC Configuration
export const RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
export const PRESALE_WALLET = process.env.NEXT_PUBLIC_PRESALE_WALLET || '';
export const TREASURY = PRESALE_WALLET ? new PublicKey(PRESALE_WALLET) : null;

// ============================================
// TOKEN CONFIGURATION
// ============================================

export interface TokenConfig {
  symbol: string;
  mint: string;
  mintPublicKey: PublicKey;
  coingeckoId: string;
  decimals: number;
  icon?: string;
}

export const TOKENS: TokenConfig[] = [
  {
    symbol: "SOL",
    mint: "So11111111111111111111111111111111111111112",
    mintPublicKey: new PublicKey("So11111111111111111111111111111111111111112"),
    coingeckoId: "solana",
    decimals: 9,
    icon: "/icons/solana.svg",
  },
  {
    symbol: "USDC",
    mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    mintPublicKey: USDC_MINT,
    coingeckoId: "usd-coin",
    decimals: 6,
    icon: "/icons/usdc.svg",
  },
];

// Token map for quick lookup
export const TOKEN_MAP: Record<string, TokenConfig> = TOKENS.reduce((acc, token) => {
  acc[token.symbol] = token;
  acc[token.mint] = token;
  return acc;
}, {} as Record<string, TokenConfig>);

// ============================================
// PROJECT CONTEXT
// ============================================

export interface ProjectContext {
  projectName: string;
  totalValue: number;
  presaleTarget: number;
  presalePercentage: number;
  location: string;
  developer: string;
  parentCompany: string;
  timeline: {
    groundbreaking: string;
    phase1Completion: string;
    fullOperation: string;
  };
  capacity: {
    annualTEU: string;
    berths: string;
    depth: string;
    area: string;
  };
  strategicImportance: string[];
}

export const projectContext: ProjectContext = {
  projectName: "Can Gio International Transshipment Port",
  totalValue: 5500000000,
  presaleTarget: 150000000,
  presalePercentage: 2.7,
  location: "Can Gio District, Ho Chi Minh City, Vietnam",
  developer: "TILGroup (Terminal Investment Limited)",
  parentCompany: "Mediterranean Shipping Company (MSC)",
  timeline: {
    groundbreaking: "Q1 2025",
    phase1Completion: "Q4 2026",
    fullOperation: "Q2 2028"
  },
  capacity: {
    annualTEU: "8.5 million TEU",
    berths: "6 deep-water berths",
    depth: "18 meters",
    area: "480 hectares total"
  },
  strategicImportance: [
    "Primary transshipment hub for Southeast Asia",
    "Deepest port in Southern Vietnam",
    "Strategic position on East-West shipping route",
    "Part of Vietnam's national maritime strategy"
  ]
};

// ============================================
// EXECUTIVE METRICS
// ============================================

export interface ExecutiveMetrics {
  averageInvestment: number;
  institutionalParticipation: number;
  allocationCompleted: number;
  accreditedInvestors: number;
  phase1Target: number;
  projectValue: number;
  vietnameseParticipation: number;
  internationalParticipation: number;
}

export const executiveMetrics: ExecutiveMetrics = {
  averageInvestment: 1200000,
  institutionalParticipation: 42,
  allocationCompleted: 50000000,
  accreditedInvestors: 100,
  phase1Target: 150000000,
  projectValue: 5500000000,
  vietnameseParticipation: 35,
  internationalParticipation: 65
};

// ============================================
// ASSET TYPES
// ============================================

export interface PhysicalDetails {
  locationKey: string;
  coordinatesKey: string;
  [key: string]: string; // Allow additional dynamic keys
}

export interface Asset {
  key: string;
  nameKey: string;
  typeKey: string;
  spotlightKey: string;
  price: number;
  image: string;
  physicalDetails: PhysicalDetails;
}

// Presale assets with translation keys
export const ASSETS_JSON: Record<string, Asset> = {
  tilTerminalx: {
    key: "tilTerminalx",
    nameKey: "assets.tilTerminalx.name",
    typeKey: "assets.tilTerminalx.type",
    spotlightKey: "assets.tilTerminalx.spotlightText",
    price: 5500,
    image: "/images/Logo/Terminal.png",
    physicalDetails: {
      locationKey: "assets.tilTerminalx.location",
      coordinatesKey: "assets.tilTerminalx.coordinates",
      deploymentKey: "assets.tilTerminalx.deployment",
      technologyKey: "assets.tilTerminalx.technology",
      integrationKey: "assets.tilTerminalx.integration",
      revenueModelKey: "assets.tilTerminalx.revenueModel",
      fractionalOwnershipKey: "assets.tilTerminalx.fractionalOwnership"
    }
  },
  portConcessions: {
    key: "portConcessions",
    nameKey: "assets.portConcessions.name",
    typeKey: "assets.portConcessions.type",
    spotlightKey: "assets.portConcessions.spotlightText",
    price: 25000,
    image: "/images/Table/port.png",
    physicalDetails: {
      locationKey: "assets.portConcessions.location",
      coordinatesKey: "assets.portConcessions.coordinates",
      concessionPeriodKey: "assets.portConcessions.concessionPeriod",
      operatorKey: "assets.portConcessions.operator",
      capacityKey: "assets.portConcessions.capacity",
      ownershipTypeKey: "assets.portConcessions.ownershipType",
      fractionalOwnershipKey: "assets.portConcessions.fractionalOwnership"
    }
  },
  dockingFees: {
    key: "dockingFees",
    nameKey: "assets.dockingFees.name",
    typeKey: "assets.dockingFees.type",
    spotlightKey: "assets.dockingFees.spotlightText",
    price: 15000,
    image: "/images/Table/docking.png",
    physicalDetails: {
      locationKey: "assets.dockingFees.location",
      coordinatesKey: "assets.dockingFees.coordinates",
      berthsKey: "assets.dockingFees.berths",
      vesselTypesKey: "assets.dockingFees.vesselTypes",
      revenueModelKey: "assets.dockingFees.revenueModel",
      fractionalOwnershipKey: "assets.dockingFees.fractionalOwnership"
    }
  },
  containerHandling: {
    key: "containerHandling",
    nameKey: "assets.containerHandling.name",
    typeKey: "assets.containerHandling.type",
    spotlightKey: "assets.containerHandling.spotlightText",
    price: 22000,
    image: "/images/Table/logistic.png",
    physicalDetails: {
      locationKey: "assets.containerHandling.location",
      coordinatesKey: "assets.containerHandling.coordinates",
      coverageKey: "assets.containerHandling.coverage",
      trafficKey: "assets.containerHandling.traffic",
      governanceKey: "assets.containerHandling.governance",
      priorityKey: "assets.containerHandling.priority",
      revenueModelKey: "assets.containerHandling.revenueModel",
      fractionalOwnershipKey: "assets.containerHandling.fractionalOwnership"
    }
  },
  logisticsInfrastructure: {
    key: "logisticInfrastructure",
    nameKey: "assets.logisticsInfrastructure.name",
    typeKey: "assets.logisticsInfrastructure.type",
    spotlightKey: "assets.logisticsInfrastructure.spotlightText",
    price: 100000,
    image: "/images/Table/Logistics.jpg",
    physicalDetails: {
      locationKey: "assets.logisticsInfrastructure.location",
      coordinatesKey: "assets.logisticsInfrastructure.coordinates",
      facilitiesKey: "assets.logisticsInfrastructure.facilities",
      capacityKey: "assets.logisticsInfrastructure.capacity",
      connectivityKey: "assets.logisticsInfrastructure.connectivity",
      anchorTenantsKey: "assets.logisticsInfrastructure.anchorTenants",
      revenueModelKey: "assets.logisticsInfrastructure.revenueModel",
      fractionalOwnershipKey: "assets.logisticsInfrastructure.fractionalOwnership"
    }
  },
  straitPassageRights: {
    key: "straitPassageRights",
    nameKey: "assets.straitPassageRights.name",
    typeKey: "assets.straitPassageRights.type",
    spotlightKey: "assets.straitPassageRights.spotlightText",
    price: 25000,
    image: "/images/Table/route.png",
    physicalDetails: {
      locationKey: "assets.straitPassageRights.location",
      coordinatesKey: "assets.straitPassageRights.coordinates",
      coverageKey: "assets.straitPassageRights.coverage",
      trafficKey: "assets.straitPassageRights.traffic",
      governanceKey: "assets.straitPassageRights.governance",
      priorityKey: "assets.straitPassageRights.priority",
      revenueModelKey: "assets.straitPassageRights.revenueModel",
      fractionalOwnershipKey: "assets.straitPassageRights.fractionalOwnership"
    }
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get asset by key
 */
export function getAssetByKey(key: string): Asset | undefined {
  return ASSETS_JSON[key];
}

/**
 * Get all assets as array
 */
export function getAllAssets(): Asset[] {
  return Object.values(ASSETS_JSON);
}

/**
 * Get assets by price range
 */
export function getAssetsByPriceRange(min: number, max: number): Asset[] {
  return getAllAssets().filter(asset => asset.price >= min && asset.price <= max);
}

/**
 * Format currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format percentage
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

/**
 * Get project completion percentage
 */
export function getProjectCompletionPercentage(): number {
  return (executiveMetrics.allocationCompleted / executiveMetrics.phase1Target) * 100;
}
