"use client";
import React from "react";
import { ShieldCheck, FileText, Globe, Lock, Award, CheckCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Compliance() {
  const { t } = useTranslation();

  const complianceFeatures = [
    {
      title: t("compliance.features.vietnameseSecurities.title"),
      description: t("compliance.features.vietnameseSecurities.description"),
      icon: FileText,
      color: "from-cyan-500 to-blue-500"
    },
    {
      title: t("compliance.features.internationalRegulation.title"),
      description: t("compliance.features.internationalRegulation.description"),
      icon: Globe,
      color: "from-emerald-500 to-green-500"
    },
    {
      title: t("compliance.features.kycAml.title"),
      description: t("compliance.features.kycAml.description"),
      icon: ShieldCheck,
      color: "from-cyan-500 to-emerald-500"
    },
    {
      title: t("compliance.features.smartContractAudits.title"),
      description: t("compliance.features.smartContractAudits.description"),
      icon: Lock,
      color: "from-purple-500 to-indigo-500"
    },
    {
      title: t("compliance.features.accreditedVerification.title"),
      description: t("compliance.features.accreditedVerification.description"),
      icon: Award,
      color: "from-amber-500 to-orange-500"
    },
    {
      title: t("compliance.features.transparentReporting.title"),
      description: t("compliance.features.transparentReporting.description"),
      icon: CheckCircle,
      color: "from-blue-500 to-cyan-500"
    },
  ];

  const regulatoryPartners = [
    { name: t("compliance.partners.vietnameseSecurities"), logo: "🇻🇳" },
    { name: t("compliance.partners.bakerMcKenzie"), logo: "⚖" },
    { name: t("compliance.partners.kpmg"), logo: "📊" },
    { name: t("compliance.partners.allens"), logo: "📜" },
  ];

  return (
    <section className="py-20 px-6 lg:py-28">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            {t("compliance.title")} <span className="gradient-text">{t("compliance.titleHighlight")}</span>
          </h2>
          <p className="text-xl text-cyan-300 max-w-3xl mx-auto mb-8">
            {t("compliance.subtitle")}
          </p>
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-900 to-emerald-900 border border-cyan-500/30 rounded-full px-6 py-2 backdrop-blur-sm">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
            <span className="text-sm font-medium text-white">
              {t("compliance.registeredBadge")}
            </span>
          </div>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {complianceFeatures.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div
                key={i}
                className="group p-6 rounded-2xl border border-slate-700/50 bg-gradient-to-b from-slate-900 to-slate-950 hover:border-cyan-500/30 transition-all duration-300 hover:scale-[1.02]"
              >
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.color} mb-4`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-300 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Regulatory Partners */}
        <div className="mt-16 pt-12 border-t border-slate-700/50">
          <h3 className="text-2xl font-bold text-white text-center mb-8">
            {t("compliance.regulatoryPartners.title")}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {regulatoryPartners.map((partner, i) => (
              <div key={i} className="text-center p-4 rounded-xl bg-slate-900/30 border border-slate-700/30">
                <div className="text-3xl mb-3">{partner.logo}</div>
                <p className="text-sm text-slate-300 font-medium">{partner.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Compliance Notice */}
        <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-cyan-900 to-emerald-900 border border-cyan-500/20">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-amber-900/30 border border-amber-500/30">
              <ShieldCheck className="h-6 w-6 text-amber-400" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white mb-2">{t("compliance.complianceNotice.title")}</h4>
              <p className="text-slate-300 text-sm leading-relaxed">
                {t("compliance.complianceNotice.text")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
