"use client";
import React from "react";
import { useTranslation } from "react-i18next";
import { TrendingUp, BarChart3, Shield, Clock, Target, DollarSign } from "lucide-react";

export default function InvestmentMetrics() {
  const { t } = useTranslation();

  const metrics = [
    {
      icon: DollarSign,
      title: t("investmentMetrics.items.totalInvestment.title"),
      subtitle: t("investmentMetrics.items.totalInvestment.subtitle"),
      description: t("investmentMetrics.items.totalInvestment.description")
    },
    {
      icon: Target,
      title: t("investmentMetrics.items.presaleTarget.title"),
      subtitle: t("investmentMetrics.items.presaleTarget.subtitle"),
      description: t("investmentMetrics.items.presaleTarget.description")
    },
    {
      icon: TrendingUp,
      title: t("investmentMetrics.items.expectedRoi.title"),
      subtitle: t("investmentMetrics.items.expectedRoi.subtitle"),
      description: t("investmentMetrics.items.expectedRoi.description")
    },
    {
      icon: BarChart3,
      title: t("investmentMetrics.items.assetClasses.title"),
      subtitle: t("investmentMetrics.items.assetClasses.subtitle"),
      description: t("investmentMetrics.items.assetClasses.description")
    },
    {
      icon: Clock,
      title: t("investmentMetrics.items.timeline.title"),
      subtitle: t("investmentMetrics.items.timeline.subtitle"),
      description: t("investmentMetrics.items.timeline.description")
    },
    {
      icon: Shield,
      title: t("investmentMetrics.items.accreditedOnly.title"),
      subtitle: t("investmentMetrics.items.accreditedOnly.subtitle"),
      description: t("investmentMetrics.items.accreditedOnly.description")
    }
  ];

  return (
    <div className="max-w-6xl mx-auto py-12">
      <h3 className="text-3xl font-bold text-white text-center mb-12">
        {t("investmentMetrics.title")} <span className="gradient-text">{t("investmentMetrics.titleHighlight")}</span>
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {metrics.map((metric, i) => {
          const Icon = metric.icon;
          return (
            <div
              key={i}
              className="text-center p-6 rounded-xl border border-slate-700/50 bg-gradient-to-b from-slate-900 to-slate-950 hover:border-cyan-500/30 transition-all duration-300"
            >
              <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-cyan-900 to-emerald-900 mb-4">
                <Icon className="h-6 w-6 text-cyan-400" />
              </div>
              <div className="text-2xl font-bold text-white mb-2">{metric.title}</div>
              <div className="text-sm font-semibold text-cyan-300 mb-2">{metric.subtitle}</div>
              <div className="text-xs text-slate-400">{metric.description}</div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-12 p-6 rounded-xl bg-gradient-to-r from-cyan-900/10 to-emerald-900/10 border border-cyan-500/20">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-900/30 border border-amber-500/30">
            <Shield className="h-5 w-5 text-amber-400" />
          </div>
          <p className="text-sm text-slate-300">
            <span className="font-semibold text-white">{t("investmentMetrics.disclaimer.important")}:</span>{" "}
            {t("investmentMetrics.disclaimer.text")}
          </p>
        </div>
      </div>
    </div>
  );
}
