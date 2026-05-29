"use client";
import React from "react";
import { BarChart3, TrendingUp, Layers, Target, DollarSign, Percent, Users, Shield } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function InvestmentStructure() {
  const { t } = useTranslation();

  const investmentTiers = [
    {
      name: t("investment.tiers.executive.name"),
      minimum: t("investment.tiers.executive.minimum"),
      allocation: t("investment.tiers.executive.allocation"),
      description: t("investment.tiers.executive.description"),
      features: t("investment.tiers.executive.features", { returnObjects: true }) as string[],
      color: "from-cyan-600 to-emerald-600",
      icon: Shield,
      badge: t("investment.tiers.executive.badge")
    },
    {
      name: t("investment.tiers.accredited.name"),
      minimum: t("investment.tiers.accredited.minimum"),
      allocation: t("investment.tiers.accredited.allocation"),
      description: t("investment.tiers.accredited.description"),
      features: t("investment.tiers.accredited.features", { returnObjects: true }) as string[],
      color: "from-blue-600 to-cyan-600",
      icon: Users,
      badge: t("investment.tiers.accredited.badge")
    },
    {
      name: t("investment.tiers.priority.name"),
      minimum: t("investment.tiers.priority.minimum"),
      allocation: t("investment.tiers.priority.allocation"),
      description: t("investment.tiers.priority.description"),
      features: t("investment.tiers.priority.features", { returnObjects: true }) as string[],
      color: "from-emerald-600 to-green-600",
      icon: Target,
      badge: t("investment.tiers.priority.badge")
    },
  ];

  const revenueStreams = [
    {
      name: t("investment.revenueStreams.portConcessions.name"),
      roi: t("investment.revenueStreams.portConcessions.roi"),
      description: t("investment.revenueStreams.portConcessions.description"),
      icon: DollarSign
    },
    {
      name: t("investment.revenueStreams.containerHandling.name"),
      roi: t("investment.revenueStreams.containerHandling.roi"),
      description: t("investment.revenueStreams.containerHandling.description"),
      icon: TrendingUp
    },
    {
      name: t("investment.revenueStreams.dockingBerthing.name"),
      roi: t("investment.revenueStreams.dockingBerthing.roi"),
      description: t("investment.revenueStreams.dockingBerthing.description"),
      icon: Layers
    },
    {
      name: t("investment.revenueStreams.logisticsInfrastructure.name"),
      roi: t("investment.revenueStreams.logisticsInfrastructure.roi"),
      description: t("investment.revenueStreams.logisticsInfrastructure.description"),
      icon: BarChart3
    },
    {
      name: t("investment.revenueStreams.straitPassageRights.name"),
      roi: t("investment.revenueStreams.straitPassageRights.roi"),
      description: t("investment.revenueStreams.straitPassageRights.description"),
      icon: Percent
    },
    {
      name: t("investment.revenueStreams.portTechnology.name"),
      roi: t("investment.revenueStreams.portTechnology.roi"),
      description: t("investment.revenueStreams.portTechnology.description"),
      icon: TrendingUp
    },
  ];

  const keyMetrics = [
    { 
      label: t("investment.metrics.totalProject.label"), 
      value: t("investment.metrics.totalProject.value"), 
      desc: t("investment.metrics.totalProject.desc") 
    },
    { 
      label: t("investment.metrics.presalePercentage.label"), 
      value: t("investment.metrics.presalePercentage.value"), 
      desc: t("investment.metrics.presalePercentage.desc") 
    },
    { 
      label: t("investment.metrics.investmentHorizon.label"), 
      value: t("investment.metrics.investmentHorizon.value"), 
      desc: t("investment.metrics.investmentHorizon.desc") 
    },
    { 
      label: t("investment.metrics.targetAnnualRoi.label"), 
      value: t("investment.metrics.targetAnnualRoi.value"), 
      desc: t("investment.metrics.targetAnnualRoi.desc") 
    },
  ];

  return (
    <section className="py-20 px-6 lg:py-28">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            {t("investment.title")} <span className="gradient-text">{t("investment.titleHighlight")}</span>
          </h2>
          <p className="text-xl text-cyan-300 max-w-4xl mx-auto mb-8">
            {t("investment.subtitle")}
          </p>
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-900 to-emerald-900 border border-cyan-500/30 rounded-full px-6 py-2 backdrop-blur-sm">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
            <span className="text-sm font-medium text-white">
              {t("investment.presaleBadge")}
            </span>
          </div>
        </div>

        {/* Investment Tiers */}
        <div className="grid gap-8 md:grid-cols-3 mb-20">
          {investmentTiers.map((tier, i) => {
            const Icon = tier.icon;
            return (
              <div
                key={i}
                className="group p-8 rounded-2xl border border-slate-700/50 bg-gradient-to-b from-slate-900 to-slate-950 hover:border-cyan-500/30 transition-all duration-300"
              >
                {/* Badge */}
                <div className="mb-6">
                  <span className="text-xs font-semibold text-cyan-400 bg-cyan-900/30 px-3 py-1 rounded-full">
                    {tier.badge}
                  </span>
                </div>

                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${tier.color} mb-3`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
                    <p className="text-slate-400 text-sm">{tier.description}</p>
                  </div>
                </div>

                {/* Minimum & Allocation */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-700/30">
                    <div className="text-sm text-slate-400 mb-1">{t("investment.tiers.minimum")}</div>
                    <div className="text-xl font-bold text-white">{tier.minimum}</div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-700/30">
                    <div className="text-sm text-slate-400 mb-1">{t("investment.tiers.allocation")}</div>
                    <div className="text-xl font-bold text-white">{tier.allocation}</div>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-3">
                  {tier.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-cyan-400 mt-2"></div>
                      <span className="text-sm text-slate-300">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <button className="w-full mt-8 py-3 rounded-xl bg-gradient-to-r from-slate-800 to-slate-900 border border-slate-700 text-white font-medium hover:border-cyan-500/50 transition-colors">
                  {t("investment.tiers.requestInfo")}
                </button>
              </div>
            );
          })}
        </div>

        {/* Revenue Streams */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-white text-center mb-12">
            {t("investment.revenueStreams.title")} <span className="gradient-text">{t("investment.revenueStreams.titleHighlight")}</span>
          </h3>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {revenueStreams.map((stream, i) => {
              const Icon = stream.icon;
              return (
                <div
                  key={i}
                  className="group p-6 rounded-xl border border-slate-700/50 bg-gradient-to-b from-slate-900 to-slate-950 hover:border-emerald-500/30 transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-4">
                    <Icon className="h-6 w-6 text-cyan-400" />
                    <div className="text-2xl font-bold text-emerald-400">{stream.roi}</div>
                  </div>
                  <h4 className="text-lg font-bold text-white mb-3 group-hover:text-cyan-300 transition-colors">
                    {stream.name}
                  </h4>
                  <p className="text-slate-400 text-sm">{stream.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="p-8 rounded-2xl bg-gradient-to-r from-cyan-900 to-emerald-900 border border-cyan-500/20">
          <h3 className="text-2xl font-bold text-white mb-8 text-center">
            {t("investment.metrics.title")}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {keyMetrics.map((metric, i) => (
              <div key={i} className="text-center p-4 rounded-xl bg-slate-900/30 border border-slate-700/30">
                <div className="text-2xl font-bold text-cyan-400 mb-2">{metric.value}</div>
                <div className="text-sm font-medium text-white mb-1">{metric.label}</div>
                <div className="text-xs text-slate-400">{metric.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Legal Disclaimer */}
        <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-amber-900/10 to-orange-900/10 border border-amber-500/20">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-amber-900/30 border border-amber-500/30">
              <Shield className="h-6 w-6 text-amber-400" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white mb-2">{t("investment.disclaimer.title")}</h4>
              <p className="text-slate-300 text-sm leading-relaxed">
                {t("investment.disclaimer.text")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
