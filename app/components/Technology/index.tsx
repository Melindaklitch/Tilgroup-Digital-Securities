"use client";
import React from "react";
import { useTranslation } from "react-i18next";
import { Cpu, Shield, Globe, Lock, Zap, Server, Database, Network } from "lucide-react";

export default function Technology() {
  const { t } = useTranslation();

  const techStack = [
    {
      name: t("technology.techStack.blockchainInfrastructure.name"),
      description: t("technology.techStack.blockchainInfrastructure.description"),
      icon: Cpu,
      features: t("technology.techStack.blockchainInfrastructure.features", { returnObjects: true }) as string[],
      color: "from-cyan-500 to-blue-500"
    },
    {
      name: t("technology.techStack.digitalIdentity.name"),
      description: t("technology.techStack.digitalIdentity.description"),
      icon: Shield,
      features: t("technology.techStack.digitalIdentity.features", { returnObjects: true }) as string[],
      color: "from-emerald-500 to-green-500"
    },
    {
      name: t("technology.techStack.smartContract.name"),
      description: t("technology.techStack.smartContract.description"),
      icon: Zap,
      features: t("technology.techStack.smartContract.features", { returnObjects: true }) as string[],
      color: "from-blue-500 to-cyan-500"
    },
    {
      name: t("technology.techStack.enterpriseSecurity.name"),
      description: t("technology.techStack.enterpriseSecurity.description"),
      icon: Lock,
      features: t("technology.techStack.enterpriseSecurity.features", { returnObjects: true }) as string[],
      color: "from-purple-500 to-indigo-500"
    },
    {
      name: t("technology.techStack.globalAccessibility.name"),
      description: t("technology.techStack.globalAccessibility.description"),
      icon: Globe,
      features: t("technology.techStack.globalAccessibility.features", { returnObjects: true }) as string[],
      color: "from-amber-500 to-orange-500"
    },
    {
      name: t("technology.techStack.portManagement.name"),
      description: t("technology.techStack.portManagement.description"),
      icon: Server,
      features: t("technology.techStack.portManagement.features", { returnObjects: true }) as string[],
      color: "from-cyan-500 to-emerald-500"
    },
  ];

  const technologyPartners = [
    { 
      name: t("technology.partners.solana.name"), 
      description: t("technology.partners.solana.description"),
      icon: "🔒"
    },
    { 
      name: t("technology.partners.fireblocks.name"), 
      description: t("technology.partners.fireblocks.description"),
      icon: "🔒"
    },
    { 
      name: t("technology.partners.chainalysis.name"), 
      description: t("technology.partners.chainalysis.description"),
      icon: "🔒"
    },
    { 
      name: t("technology.partners.oracle.name"), 
      description: t("technology.partners.oracle.description"),
      icon: "🔒"
    },
  ];

  return (
    <section className="py-20 px-6 lg:py-28">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            {t("technology.title")} <span className="gradient-text">{t("technology.titleHighlight")}</span>
          </h2>
          <p className="text-xl text-cyan-300 max-w-3xl mx-auto mb-8">
            {t("technology.subtitle")}
          </p>
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-900 to-emerald-900 border border-cyan-500/30 rounded-full px-6 py-2 backdrop-blur-sm">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
            <span className="text-sm font-medium text-white">
              {t("technology.badge")}
            </span>
          </div>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {techStack.map((tech, i) => {
            const Icon = tech.icon;
            return (
              <div
                key={i}
                className="group p-6 rounded-2xl border border-slate-700/50 bg-gradient-to-b from-slate-900 to-slate-950 hover:border-cyan-500/30 transition-all duration-300 hover:scale-[1.02]"
              >
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${tech.color} mb-4`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-300 transition-colors">
                  {tech.name}
                </h3>
                <p className="text-slate-400 text-sm mb-4 leading-relaxed">
                  {tech.description}
                </p>
                <div className="space-y-2">
                  {tech.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                      <span className="text-xs text-slate-300">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Technology Partners */}
        <div className="mt-16 pt-12 border-t border-slate-700/50">
          <h3 className="text-2xl font-bold text-white text-center mb-8">
            {t("technology.partners.title")}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {technologyPartners.map((partner, i) => (
              <div key={i} className="text-center p-4 rounded-xl bg-slate-900/30 border border-slate-700/30">
                <div className="text-2xl mb-3">{partner.icon}</div>
                <p className="text-sm font-medium text-white mb-1">{partner.name}</p>
                <p className="text-xs text-slate-400">{partner.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-cyan-900 to-emerald-900 border border-cyan-500/20">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-cyan-900/30 border border-cyan-500/30">
              <Shield className="h-6 w-6 text-cyan-400" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white mb-2">{t("technology.securityNotice.title")}</h4>
              <p className="text-slate-300 text-sm leading-relaxed">
                {t("technology.securityNotice.text")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
