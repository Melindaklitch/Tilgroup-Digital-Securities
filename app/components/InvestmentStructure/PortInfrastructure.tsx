"use client";
import React from "react";
import { useTranslation } from "react-i18next";
import { Anchor, Warehouse, Container, Ship } from "lucide-react";

export default function PortInfrastructure() {
  const { t } = useTranslation();

  const portAssets = [
    {
      icon: Anchor,
      name: t("portInfrastructure.assets.portTerminals.name"),
      description: t("portInfrastructure.assets.portTerminals.description"),
      metric: t("portInfrastructure.assets.portTerminals.metric"),
      color: "from-cyan-500 to-blue-500"
    },
    {
      icon: Warehouse,
      name: t("portInfrastructure.assets.logisticsWarehouses.name"),
      description: t("portInfrastructure.assets.logisticsWarehouses.description"),
      metric: t("portInfrastructure.assets.logisticsWarehouses.metric"),
      color: "from-emerald-500 to-green-500"
    },
    {
      icon: Container,
      name: t("portInfrastructure.assets.containerYards.name"),
      description: t("portInfrastructure.assets.containerYards.description"),
      metric: t("portInfrastructure.assets.containerYards.metric"),
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Ship,
      name: t("portInfrastructure.assets.dockingFacilities.name"),
      description: t("portInfrastructure.assets.dockingFacilities.description"),
      metric: t("portInfrastructure.assets.dockingFacilities.metric"),
      color: "from-purple-500 to-indigo-500"
    },
    {
      icon: CargoShip,
      name: t("portInfrastructure.assets.straitPassage.name"),
      description: t("portInfrastructure.assets.straitPassage.description"),
      metric: t("portInfrastructure.assets.straitPassage.metric"),
      color: "from-amber-500 to-orange-500"
    },
    {
      icon: Crane,
      name: t("portInfrastructure.assets.smartPortTech.name"),
      description: t("portInfrastructure.assets.smartPortTech.description"),
      metric: t("portInfrastructure.assets.smartPortTech.metric"),
      color: "from-indigo-500 to-purple-500"
    }
  ];

  return (
    <div className="max-w-6xl mx-auto py-12">
      <h3 className="text-3xl font-bold text-white text-center mb-12">
        {t("portInfrastructure.title")} <span className="gradient-text">{t("portInfrastructure.titleHighlight")}</span>
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {portAssets.map((asset, i) => {
          const Icon = asset.icon;
          return (
            <div
              key={i}
              className="p-6 rounded-xl border border-slate-700/50 bg-gradient-to-b from-slate-900 to-slate-950 hover:border-cyan-500/30 transition-all duration-300 group"
            >
              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${asset.color} mb-4`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <h4 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-300 transition-colors">
                {asset.name}
              </h4>
              <p className="text-slate-400 text-sm mb-4 leading-relaxed">
                {asset.description}
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/50 border border-slate-700/50">
                <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                <span className="text-sm font-medium text-white">{asset.metric}</span>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-8 text-center">
        <p className="text-sm text-slate-400">
          {t("portInfrastructure.footer.part1")}
          <span className="text-cyan-300 font-medium"> {t("portInfrastructure.footer.highlight")}</span>
        </p>
      </div>
    </div>
  );
}
