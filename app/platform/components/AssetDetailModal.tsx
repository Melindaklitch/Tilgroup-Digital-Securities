import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ModalPortal } from '../../components/Context/ModalPortal';
import { Z_INDEX } from '@/lib/zIndex';
import { useWallet } from '@solana/wallet-adapter-react';
import { X, ChevronRight } from 'lucide-react';

// ================= TYPES =================
interface Asset {
  key: string;
  image: string;
  price: number;
  physicalDetails?: Record<string, string>;
}

interface AssetDetailModalProps {
  asset: Asset;
  isOpen: boolean;
  onClose: () => void;
  onInvestNow: (asset: Asset & { translatedName: string }) => void;
  onShowQuestionnaire: () => void;
  userQuestionnaireCompleted: boolean;
  session: any;
}

// ================= HARDCODED ASSET DATA =================
const getAssetName = (key: string): string => {
  const names: Record<string, string> = {
    portConcessions: "Port Concession Rights",
    dockingFees: "Docking & Berthing Fees",
    containerHandling: "Container Handling Rights",
    logisticsInfrastructure: "Logistics Infrastructure",
    straitPassageRights: "Strait Passage Rights",
    tilTerminalx: "TIL Terminal X Digital Infrastructure"
  };
  return names[key] || key;
};

const getAssetDescription = (key: string): string => {
  const descriptions: Record<string, string> = {
    portConcessions: "Government-granted 30-year port operating rights with revenue sharing",
    dockingFees: "Recurring revenue from vessel docking at Can Gio's deep-water berths",
    containerHandling: "Automated container terminal operations with high throughput efficiency",
    logisticsInfrastructure: "Physical warehouse and distribution facilities supporting port operations",
    straitPassageRights: "Strategic maritime passage rights for vessels accessing Ho Chi Minh City",
    tilTerminalx: "Technology infrastructure for automated port operations"
  };
  return descriptions[key] || "Infrastructure investment opportunity";
};

const getBenefits = (key: string): string[] => {
  const benefitsMap: Record<string, string[]> = {
    portConcessions: [
      "Long-term stable revenue from government concession",
      "Inflation-protected income streams",
      "Strategic position in Vietnam's busiest shipping lane"
    ],
    dockingFees: [
      "Daily cash flow from port operations",
      "Low volatility compared to shipping markets",
      "Scalable with increasing vessel traffic"
    ],
    containerHandling: [
      "Operational leverage from automation",
      "Growing container trade volumes",
      "Revenue tied to Vietnam's export economy"
    ],
    logisticsInfrastructure: [
      "Long-term lease income from anchor tenants",
      "Infrastructure appreciation over time",
      "Essential service with high occupancy rates"
    ],
    straitPassageRights: [
      "Essential infrastructure with limited competition",
      "Revenue tied to Vietnam's economic growth",
      "High barrier to entry for competitors"
    ],
    tilTerminalx: [
      "Technology licensing revenue potential",
      "Scalable across MSC's global port network",
      "Operational efficiency dividends"
    ]
  };
  return benefitsMap[key] || [];
};

const getROI = (key: string): string => {
  const roiMap: Record<string, string> = {
    portConcessions: "6-8%",
    dockingFees: "4-6%",
    containerHandling: "7-9%",
    logisticsInfrastructure: "8-10%",
    straitPassageRights: "9-11%",
    tilTerminalx: "10-12%"
  };
  return roiMap[key] || "8-12%";
};

const getTimeline = (key: string): string => {
  const timelineMap: Record<string, string> = {
    portConcessions: "5-10 Years",
    dockingFees: "2-5 Years",
    containerHandling: "5-10 Years",
    logisticsInfrastructure: "5-10 Years",
    straitPassageRights: "3-7 Years",
    tilTerminalx: "2-5 Years"
  };
  return timelineMap[key] || "5-10 Years";
};

const getRiskLevel = (key: string): string => {
  const riskMap: Record<string, string> = {
    portConcessions: "Medium",
    dockingFees: "Low",
    containerHandling: "Medium",
    logisticsInfrastructure: "Medium",
    straitPassageRights: "Medium",
    tilTerminalx: "Medium"
  };
  return riskMap[key] || "Medium";
};

const getRiskColor = (risk: string): string => {
  const colors: Record<string, string> = {
    Low: 'text-green-400 bg-green-900/20',
    Medium: 'text-yellow-400 bg-yellow-900/20',
    High: 'text-red-400 bg-red-900/20'
  };
  return colors[risk] || 'text-yellow-400 bg-yellow-900/20';
};

const getMinInvestment = (key: string): string => {
  const minMap: Record<string, string> = {
    portConcessions: "$50,000",
    dockingFees: "$15,000",
    containerHandling: "$22,000",
    logisticsInfrastructure: "$100,000",
    straitPassageRights: "$25,000",
    tilTerminalx: "$5,500"
  };
  return minMap[key] || "$5,500";
};

// ================= HARDCODED PHYSICAL DETAILS =================
const getPhysicalDetails = (assetKey: string): { label: string; value: string }[] => {
  const detailsMap: Record<string, { label: string; value: string }[]> = {
    tilTerminalx: [
      { label: "Location", value: "Can Gio Port, Phase 1 - Main Terminal" },
      { label: "Coordinates", value: "10°31'30\"N, 106°50'00\"E" },
      { label: "Deployment", value: "Q4 2025 - Q1 2026" },
      { label: "Technology", value: "Automated Container Handling System (ACHS)" },
      { label: "Integration", value: "Integrated with MSC global shipping network" },
      { label: "Revenue Model", value: "Terminal handling fees + Technology licensing" },
      { label: "Fractional Ownership", value: "Digital ownership certificates representing 0.001% equity in terminal operations" }
    ],
    portConcessions: [
      { label: "Location", value: "Can Gio Port, 30-year Government Concession" },
      { label: "Coordinates", value: "10°31'30\"N, 106°50'00\"E" },
      { label: "Concession Period", value: "30 years (2025-2055) with 10-year extension option" },
      { label: "Operator", value: "TILGroup Vietnam (MSC subsidiary)" },
      { label: "Capacity", value: "8.5 million TEU annual capacity" },
      { label: "Ownership Type", value: "Build-Operate-Transfer (BOT) with Vietnamese Ministry of Transport" },
      { label: "Fractional Ownership", value: "Revenue-sharing rights from government concession agreement" }
    ],
    dockingFees: [
      { label: "Location", value: "Can Gio Deep-water Berths 1-6" },
      { label: "Coordinates", value: "10°31'15\"N, 106°49'45\"E" },
      { label: "Berths", value: "6 deep-water berths (18m depth)" },
      { label: "Vessel Types", value: "Post-Panamax, Ultra-Large Container Vessels (ULCVs)" },
      { label: "Revenue Model", value: "Tiered docking fees based on vessel size and dwell time" },
      { label: "Fractional Ownership", value: "Direct participation in port operations revenue stream" }
    ],
    containerHandling: [
      { label: "Location", value: "Can Gio Automated Terminal Yard" },
      { label: "Coordinates", value: "10°31'45\"N, 106°50'15\"E" },
      { label: "Coverage", value: "85 hectares of automated stacking yards" },
      { label: "Traffic", value: "Projected 4.2 million TEU annually by 2028" },
      { label: "Governance", value: "Vietnamese Port Authority supervised operations" },
      { label: "Priority", value: "MSC vessels receive priority berthing rights" },
      { label: "Revenue Model", value: "Per-container handling fees + Storage charges" },
      { label: "Fractional Ownership", value: "Equity stake in physical container handling infrastructure" }
    ],
    logisticsInfrastructure: [
      { label: "Location", value: "Can Gio Port Logistics Park" },
      { label: "Coordinates", value: "10°32'00\"N, 106°49'30\"E" },
      { label: "Facilities", value: "Warehouses, Cold Storage, Customs Bonded Areas" },
      { label: "Capacity", value: "500,000 sqm of logistics facilities" },
      { label: "Connectivity", value: "Direct access to National Highway 50 & Saigon River" },
      { label: "Anchor Tenants", value: "MSC Logistics, DHL, FedEx (confirmed)" },
      { label: "Revenue Model", value: "Lease income + Value-added logistics services" },
      { label: "Fractional Ownership", value: "Physical warehouse and logistics facility ownership shares" }
    ],
    straitPassageRights: [
      { label: "Location", value: "Saigon River Approach Channel & Vung Tau Strait" },
      { label: "Coordinates", value: "10°22'00\"N, 106°58'00\"E" },
      { label: "Coverage", value: "Primary maritime access route to Ho Chi Minh City" },
      { label: "Traffic", value: "45,000+ vessel movements annually" },
      { label: "Governance", value: "Vietnamese Maritime Administration regulated" },
      { label: "Priority", value: "Exclusive priority passage for port-associated vessels" },
      { label: "Revenue Model", value: "Channel usage fees + Pilotage services" },
      { label: "Fractional Ownership", value: "Revenue rights from strategic maritime passage operations" }
    ]
  };
  
  return detailsMap[assetKey] || [
    { label: "Location", value: "Can Gio Port, Vietnam" },
    { label: "Status", value: "Operational" }
  ];
};

// ================= COMPONENT =================
export default function AssetDetailModal({
  asset,
  isOpen,
  onClose,
  onInvestNow,
  onShowQuestionnaire,
  userQuestionnaireCompleted
}: AssetDetailModalProps) {

  if (!isOpen || !asset) return null;

  const assetKey = asset.key;
  const assetName = getAssetName(assetKey);
  const assetDescription = getAssetDescription(assetKey);
  const benefits = getBenefits(assetKey);
  const roiValue = getROI(assetKey);
  const timelineValue = getTimeline(assetKey);
  const riskLevel = getRiskLevel(assetKey);
  const riskColorClass = getRiskColor(riskLevel);
  const minInvestment = getMinInvestment(assetKey);
  const physicalDetails = getPhysicalDetails(assetKey);
  const { connected } = useWallet();
  return (
    <ModalPortal isOpen={isOpen} onClose={onClose}>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
           style={{ zIndex: Z_INDEX.MODAL }}>

        <div className="bg-gradient-to-b from-[#0f2a3f] to-[#0a1f2f] rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-800 shadow-2xl">

          {/* HEADER */}
          <div className="sticky top-0 p-6 border-b border-gray-700 bg-[#0f2a3f] z-10">
            <h2 className="text-2xl font-bold text-white">{assetName}</h2>
            <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X size={24} />
            </button>
          </div>

          {/* IMAGE */}
          <div className="relative h-64">
            <Image src={asset.image} alt={assetName} fill className="object-cover" />
          </div>

          {/* CONTENT */}
          <div className="p-6 space-y-6">

            {/* PHYSICAL DETAILS */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">📍 Physical Asset Details</h3>
              <div className="space-y-2">
                {physicalDetails.map(({ label, value }) => (
                  <div key={label} className="flex justify-between border-b border-gray-800 py-2">
                    <span className="text-slate-400">{label}</span>
                    <span className="text-white">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* DESCRIPTION */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Overview</h3>
              <p className="text-slate-300">{assetDescription}</p>
            </div>

            {/* BENEFITS */}
            {benefits.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Key Benefits</h3>
                <ul className="space-y-2">
                  {benefits.map((benefit, i) => (
                    <li key={i} className="flex items-start gap-2 text-slate-300">
                      <ChevronRight size={16} className="text-cyan-400 mt-0.5" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* INVESTMENT DETAILS */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">💰 Security Details</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#0a2f3d]/50 rounded-lg p-3 text-center">
                  <div className="text-cyan-400 text-xl font-bold">{roiValue}</div>
                  <div className="text-slate-400 text-xs">Annual ROI</div>
                </div>
                <div className="bg-[#0a2f3d]/50 rounded-lg p-3 text-center">
                  <div className="text-cyan-400 text-xl font-bold">{timelineValue}</div>
                  <div className="text-slate-400 text-xs">Timeline</div>
                </div>
                <div className={`${riskColorClass} rounded-lg p-3 text-center`}>
                  <div className="text-xl font-bold">{riskLevel}</div>
                  <div className="text-xs opacity-80">Risk Level</div>
                </div>
                <div className="bg-[#0a2f3d]/50 rounded-lg p-3 text-center">
                  <div className="text-cyan-400 text-xl font-bold">{minInvestment}</div>
                  <div className="text-slate-400 text-xs">Min Investment</div>
                </div>
              </div>
            </div>

            {/* INVEST BUTTON */}
            <Button
             onClick={() => {
             console.log("🔘 Button clicked, connected:", connected, "questionnaire:", userQuestionnaireCompleted);
             if (!connected) {
             console.log("⚠️ Wallet not connected");
             const walletButton = document.querySelector('.wallet-adapter-button');
             if (walletButton) (walletButton as HTMLElement).click();
             return;
            }
             if (!userQuestionnaireCompleted) {
             console.log("📋 Questionnaire not completed");
             onShowQuestionnaire();
             } else {
             console.log("✅ Calling onInvestNow with asset:", asset);
             onInvestNow({ ...asset, translatedName: assetName });
             }
           }}
              className="w-full bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-700 hover:to-emerald-700 text-white py-3 rounded-xl"
            >
              Purchase This Security Now
            </Button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
