'use client';

import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { MapPin, Anchor, TrendingUp, Clock, Shield, ChevronRight, Info, Star, Award } from 'lucide-react';

interface AssetGridProps {
  assets: Record<string, any>;
  onAssetSelect: (asset: any, key: string) => void;
}

interface RiskLevel {
  level: string;
  color: string;
  bgColor: string;
}

export default function AssetGrid({ assets, onAssetSelect }: AssetGridProps) {
  // ROI mapping
  const getROI = (key: string): string => {
    const roiMap: Record<string, string> = {
      portConcessions: "6-8%",
      dockingFees: "4-6%",
      containerHandling: "7-9%",
      logisticsInfrastructure: "8-10%",
      straitPassageRights: "9-11%",
      tilTerminalx: "10-12%"
    };
    return roiMap[key] || "6-12%";
  };

  // Timeline mapping
  const getTimeline = (key: string): string => {
    const timelineMap: Record<string, string> = {
      portConcessions: "30 Years",
      dockingFees: "2-5 Years",
      containerHandling: "5-10 Years",
      logisticsInfrastructure: "5-10 Years",
      straitPassageRights: "3-7 Years",
      tilTerminalx: "2-5 Years"
    };
    return timelineMap[key] || "5-10 Years";
  };

  // Risk level mapping
  const getRiskLevel = (key: string): RiskLevel => {
    const riskMap: Record<string, RiskLevel> = {
      portConcessions: { level: "Medium", color: "text-yellow-400", bgColor: "bg-yellow-900/20" },
      dockingFees: { level: "Low", color: "text-green-400", bgColor: "bg-green-900/20" },
      containerHandling: { level: "Medium", color: "text-yellow-400", bgColor: "bg-yellow-900/20" },
      logisticsInfrastructure: { level: "Medium", color: "text-yellow-400", bgColor: "bg-yellow-900/20" },
      straitPassageRights: { level: "Medium", color: "text-yellow-400", bgColor: "bg-yellow-900/20" },
      tilTerminalx: { level: "Medium", color: "text-yellow-400", bgColor: "bg-yellow-900/20" }
    };
    return riskMap[key] || { level: "Medium", color: "text-yellow-400", bgColor: "bg-yellow-900/20" };
  };

  // Tier badge
  const getTierStyles = (price: number) => {
    if (price >= 100000) {
      return {
        label: "Executive Tier",
        gradient: "from-purple-600 to-blue-600",
        icon: <Award className="h-3 w-3 mr-1" />
      };
    } else if (price >= 25000) {
      return {
        label: "Accredited Tier",
        gradient: "from-cyan-600 to-emerald-600",
        icon: <Star className="h-3 w-3 mr-1" />
      };
    } else {
      return {
        label: "Priority Tier",
        gradient: "from-blue-600 to-cyan-600",
        icon: <ChevronRight className="h-3 w-3 mr-1" />
      };
    }
  };

  // Asset names
  const getAssetName = (key: string): string => {
    const nameMap: Record<string, string> = {
      portConcessions: "Port Concession Rights",
      dockingFees: "Docking & Berthing Fees",
      containerHandling: "Container Handling Rights",
      logisticsInfrastructure: "Logistics Infrastructure",
      straitPassageRights: "Strait Passage Rights",
      tilTerminalx: "TIL Terminal X Digital Infrastructure"
    };
    return nameMap[key] || key;
  };

  // Asset types
  const getAssetType = (key: string): string => {
    const typeMap: Record<string, string> = {
      portConcessions: "Concession Asset",
      dockingFees: "Revenue Stream",
      containerHandling: "Operational Asset",
      logisticsInfrastructure: "Infrastructure Asset",
      straitPassageRights: "Strategic Asset",
      tilTerminalx: "Technology Infrastructure"
    };
    return typeMap[key] || "Infrastructure Asset";
  };

  // Asset locations
  const getAssetLocation = (key: string): string => {
    const locationMap: Record<string, string> = {
      portConcessions: "Can Gio Port, 30-year Government Concession",
      dockingFees: "Can Gio Deep-water Berths 1-6",
      containerHandling: "Can Gio Automated Terminal Yard",
      logisticsInfrastructure: "Can Gio Port Logistics Park",
      straitPassageRights: "Saigon River Approach Channel & Vung Tau Strait",
      tilTerminalx: "Can Gio Port, Phase 1 - Main Terminal"
    };
    return locationMap[key] || "Can Gio Port, Vietnam";
  };

  // Physical detail text
  const getPhysicalDetailText = (key: string): string => {
    const detailMap: Record<string, string> = {
      portConcessions: "30-year government concession",
      dockingFees: "6 deep-water berths (18m depth)",
      containerHandling: "85 hectares automated stacking yards",
      logisticsInfrastructure: "500,000 sqm logistics facilities",
      straitPassageRights: "45,000+ vessel movements annually",
      tilTerminalx: "AI-powered automated operations"
    };
    return detailMap[key] || "Infrastructure Scale";
  };

  return (
    <div className="bg-gradient-to-b from-[#072532] to-[#0a1f2f] rounded-2xl shadow-2xl border border-gray-800/50 overflow-hidden">

      {/* Header */}
      <div className="p-4 md:p-6 border-b border-gray-800/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white">Can Gio Port Infrastructure Investments</h2>
            <p className="text-slate-400 text-xs md:text-sm mt-1">Fractional ownership opportunities in $5.5B maritime infrastructure</p>
          </div>

          <div className="flex items-center gap-3 text-xs md:text-sm">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
              <span className="text-slate-300">Available</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-400"></div>
              <span className="text-slate-300">Priority Access</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="p-4 md:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-6">

          {Object.entries(assets).map(([key, asset]) => {
            const tier = getTierStyles(asset.price);
            const roi = getROI(key);
            const timeline = getTimeline(key);
            const risk = getRiskLevel(key);
            const physicalDetailText = getPhysicalDetailText(key);
            const assetName = getAssetName(key);
            const assetType = getAssetType(key);
            const assetLocation = getAssetLocation(key);

            return (
              <div key={key} className="group bg-gradient-to-br from-slate-900 to-[#062b32] rounded-xl overflow-hidden border border-slate-800 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]">

                {/* Image */}
                <div className="relative h-48 md:h-56 overflow-hidden">
                  <Image
                    src={asset.image}
                    alt={assetName}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                  <div className="absolute top-4 left-4">
                    <span className={`inline-flex items-center text-xs font-bold px-3 py-1 rounded-full bg-gradient-to-r ${tier.gradient} text-white`}>
                      {tier.icon}
                      {tier.label}
                    </span>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 flex items-center text-white">
                    <MapPin className="h-4 w-4 mr-1 text-cyan-400" />
                    <span className="text-sm truncate">{assetLocation}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-4">

                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-bold text-lg text-white">{assetName}</h3>
                      <p className="text-slate-400 text-sm">{assetType}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-cyan-400">
                        ${asset.price.toLocaleString()}
                      </div>
                      <div className="text-xs text-slate-500">Minimum Investment</div>
                    </div>
                  </div>

                  <div className="text-sm text-slate-300">
                    <div>{physicalDetailText}</div>
                  </div>

                  <Button onClick={() => onAssetSelect(asset, key)} className="w-full">
                    View Investment Details
                  </Button>

                  <div className="grid grid-cols-3 text-xs pt-2 border-t border-slate-800">
                    <div className="text-center">
                      {roi}<br />Projected ROI
                    </div>
                    <div className="text-center">
                      {timeline}<br />Horizon
                    </div>
                    <div className="text-center">
                      {risk.level}<br />Risk
                    </div>
                  </div>

                </div>
              </div>
            );
          })}

        </div>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-slate-800 bg-slate-900/20">
        <h4 className="text-cyan-400 font-semibold mb-1">
          Infrastructure Investment Note
        </h4>
        <p className="text-slate-300 text-sm">
          All investments represent fractional ownership in physical Can Gio Port infrastructure. Minimum investments vary by accreditation tier. Projected returns based on conservative marine industry standards. Investments are illiquid with long-term horizons.
        </p>
      </div>

    </div>
  );
}
