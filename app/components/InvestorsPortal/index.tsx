"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { ShieldCheck, BarChart3, FileText, Users, Globe, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAuth } from "../Context/AuthContext";

export default function InvestorPortal() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const router = useRouter();

  const handleAccessPresale = () => {
    if (!user) {
      router.push("/signin");
    } else {
      router.push("/platform"); // Professional investment platform, not "trading"
    }
  };

  const portalFeatures = [
    {
      icon: ShieldCheck,
      title: t("investorPortal.features.regulatoryCompliance.title"),
      description: t("investorPortal.features.regulatoryCompliance.description"),
      color: "from-cyan-500 to-blue-500"
    },
    {
      icon: BarChart3,
      title: t("investorPortal.features.realTimePortfolio.title"),
      description: t("investorPortal.features.realTimePortfolio.description"),
      color: "from-emerald-500 to-green-500"
    },
    {
      icon: FileText,
      title: t("investorPortal.features.legalDocumentation.title"),
      description: t("investorPortal.features.legalDocumentation.description"),
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Users,
      title: t("investorPortal.features.investorRelations.title"),
      description: t("investorPortal.features.investorRelations.description"),
      color: "from-purple-500 to-indigo-500"
    },
    {
      icon: Globe,
      title: t("investorPortal.features.globalAccess.title"),
      description: t("investorPortal.features.globalAccess.description"),
      color: "from-amber-500 to-orange-500"
    },
    {
      icon: Lock,
      title: t("investorPortal.features.bankGradeSecurity.title"),
      description: t("investorPortal.features.bankGradeSecurity.description"),
      color: "from-cyan-500 to-emerald-500"
    },
  ];

  const qualificationSteps = [
    t("investorPortal.qualification.steps.verifyStatus"),
    t("investorPortal.qualification.steps.completeKyc"),
    t("investorPortal.qualification.steps.accessDocumentation"),
    t("investorPortal.qualification.steps.allocateFunds")
  ];

  return (
    <section className="py-20 px-6 lg:py-28">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            {t("investorPortal.title")} <span className="gradient-text">{t("investorPortal.titleHighlight")}</span>
          </h2>
          <p className="text-xl text-cyan-300 max-w-3xl mx-auto mb-8">
            {t("investorPortal.subtitle")}
          </p>
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-900 to-emerald-900 border border-cyan-500/30 rounded-full px-6 py-2 backdrop-blur-sm">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
            <span className="text-sm font-medium text-white">
              {t("investorPortal.badge")}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Features */}
          <div>
            <div className="grid grid-cols-2 gap-6">
              {portalFeatures.map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={i}
                    className="p-5 rounded-xl border border-slate-700/50 bg-gradient-to-b from-slate-900 to-slate-950 hover:border-cyan-500/30 transition-all duration-300"
                  >
                    <div className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${feature.color} mb-3`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                    <p className="text-slate-400 text-sm">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right side - Access CTA */}
          <div className="p-8 rounded-2xl border border-slate-700/50 bg-gradient-to-b from-slate-900 to-slate-950">
            <h3 className="text-2xl font-bold text-white mb-4">
              {t("investorPortal.accessSection.title")}
            </h3>
            <p className="text-slate-300 mb-6">
              {t("investorPortal.accessSection.description")}
            </p>

            <div className="space-y-4 mb-8">
              {qualificationSteps.map((step, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                  <span className="text-sm text-white">{step}</span>
                </div>
              ))}
            </div>

            <Button
              size="lg"
              className="w-full bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-700 hover:to-emerald-700 text-white font-medium py-6 text-lg"
              onClick={handleAccessPresale}
            >
              {user ? t("investorPortal.accessSection.accessButton") : t("investorPortal.accessSection.qualifyButton")}
            </Button>

            <p className="text-xs text-slate-500 text-center mt-4">
              {t("investorPortal.accessSection.disclaimer")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
