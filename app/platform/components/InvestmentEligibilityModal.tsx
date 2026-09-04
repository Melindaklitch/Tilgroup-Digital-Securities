'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  X, MapPin, Building2, DollarSign, TrendingUp, 
  Award, Shield, CheckCircle2, AlertCircle, 
  FileText, Clock, ChevronRight, ExternalLink,
  Star, Crown, Zap
} from 'lucide-react';

interface InvestmentEligibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  userLegalCompliant: boolean;
  onBeginVerification: () => void;
}

export default function InvestmentEligibilityModal({
  isOpen,
  onClose,
  userLegalCompliant,
  onBeginVerification,
}: InvestmentEligibilityModalProps) {
  
  if (!isOpen) return null;

  const tiers = [
    {
      key: 'executive',
      name: 'Executive Tier',
      badge: 'Institutional',
      minimum: '$100,000+',
      benefits: ['Full ROI rates (6-12%)', 'Priority asset allocation', 'Direct management access'],
      icon: Crown,
      color: 'blue',
      gradient: 'from-blue-900 to-transparent',
      border: 'border-blue-500/20',
      textColor: 'text-blue-400',
      badgeColor: 'bg-blue-500/20 text-blue-400',
    },
    {
      key: 'accredited',
      name: 'Accredited Tier',
      badge: 'Verified',
      minimum: '$25,000+',
      benefits: ['85% of base ROI rates', 'All asset class access', 'Monthly portfolio updates'],
      icon: Star,
      color: 'emerald',
      gradient: 'from-emerald-900 to-transparent',
      border: 'border-emerald-500/20',
      textColor: 'text-emerald-400',
      badgeColor: 'bg-emerald-500/20 text-emerald-400',
    },
    {
      key: 'priority',
      name: 'Priority Tier',
      badge: 'Retail',
      minimum: '$5,500+',
      benefits: ['75% of base ROI rates', 'Select asset classes', 'Managed platform access'],
      icon: Zap,
      color: 'cyan',
      gradient: 'from-cyan-900 to-transparent',
      border: 'border-cyan-500/20',
      textColor: 'text-cyan-400',
      badgeColor: 'bg-cyan-500/20 text-cyan-400',
    },
  ];

  const legalItems = [
    { title: 'Accredited Investor Verification', description: 'Proof of accreditation per Vietnamese securities regulations' },
    { title: 'Fractional Ownership Agreement', description: 'Legal documentation for port infrastructure ownership rights' },
    { title: 'Vietnamese KYC/AML Compliance', description: 'Identity verification per Vietnamese financial regulations' },
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-3 md:p-4">
      <div className="bg-gradient-to-b from-[#0f2a3f] to-[#071526] rounded-xl max-w-4xl w-full max-h-[95vh] md:max-h-[90vh] overflow-y-auto border border-cyan-500/20 shadow-2xl">
        
        {/* Sticky Header */}
        <div className="sticky top-0 bg-gradient-to-b from-[#0f2a3f] to-[#0f2a3f]/95 backdrop-blur-sm p-4 md:p-6 border-b border-slate-700/50 z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm md:text-base">CG</span>
              </div>
              <div>
                <h3 className="text-lg md:text-2xl font-bold text-white">Can Gio Port Investment Requirements</h3>
                <p className="text-slate-400 text-xs md:text-sm">$5.5B Infrastructure Project · TIL Group Vietnam</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors bg-slate-800/50 hover:bg-slate-700/50 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center"
              aria-label="Close"
            >
              <X className="h-4 w-4 md:h-5 md:w-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 md:p-6 space-y-5 md:space-y-6">
          
          {/* Project Overview Card */}
          <div className="bg-gradient-to-r from-slate-900/50 to-[#062b32]/50 p-4 md:p-5 rounded-xl border-l-4 border-cyan-500">
            <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
              <div className="p-1.5 md:p-2 rounded-lg bg-cyan-500/10">
                <MapPin className="h-4 w-4 md:h-5 md:w-5 text-cyan-400" />
              </div>
              <div>
                <h4 className="text-base md:text-lg font-semibold text-white">Project Overview</h4>
                <p className="text-slate-400 text-xs md:text-sm">Can Gio International Transshipment Port</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="bg-slate-900/30 p-3 rounded-lg">
                <p className="text-slate-500 text-xs md:text-sm">Total Value</p>
                <p className="text-lg md:text-xl font-bold text-cyan-400">$5.5 Billion</p>
              </div>
              <div className="bg-slate-900/30 p-3 rounded-lg">
                <p className="text-slate-500 text-xs md:text-sm">Presale Allocation</p>
                <p className="text-lg md:text-xl font-bold text-emerald-400">$150 Million</p>
              </div>
              <div className="bg-slate-900/30 p-3 rounded-lg">
                <p className="text-slate-500 text-xs md:text-sm">Location</p>
                <p className="font-medium text-white text-sm md:text-base">Ho Chi Minh City, Vietnam</p>
              </div>
              <div className="bg-slate-900/30 p-3 rounded-lg">
                <p className="text-slate-500 text-xs md:text-sm">Developer</p>
                <p className="font-medium text-white text-sm md:text-base">TIL Group (MSC Subsidiary)</p>
              </div>
            </div>
          </div>

          {/* Investment Tiers */}
          <div>
            <h4 className="text-base md:text-lg font-semibold text-white mb-3 md:mb-4">Investment Tier Requirements</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
              {tiers.map((tier) => {
                const TierIcon = tier.icon;
                return (
                  <div 
                    key={tier.key}
                    className={`bg-gradient-to-b ${tier.gradient} p-4 md:p-5 rounded-xl border ${tier.border} hover:border-opacity-50 transition-all duration-300`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <TierIcon className={`h-4 w-4 md:h-5 md:w-5 ${tier.textColor}`} />
                        <span className={`font-semibold text-sm md:text-base ${tier.textColor}`}>{tier.name}</span>
                      </div>
                      <span className={`text-[10px] md:text-xs ${tier.badgeColor} px-2 py-0.5 md:px-2.5 md:py-1 rounded-full`}>
                        {tier.badge}
                      </span>
                    </div>
                    <div className={`text-xl md:text-2xl font-bold mb-3 ${tier.textColor}`}>{tier.minimum}</div>
                    <ul className="space-y-1.5">
                      {tier.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 text-xs md:text-sm text-slate-300">
                          <CheckCircle2 className={`h-3 w-3 md:h-3.5 md:w-3.5 ${tier.textColor} flex-shrink-0 mt-0.5`} />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legal Requirements */}
          <div>
            <h4 className="text-base md:text-lg font-semibold text-white mb-3 md:mb-4">Required Documentation & Compliance</h4>
            <div className="space-y-3">
              {legalItems.map((item, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row sm:items-start gap-3 p-3 md:p-4 bg-slate-900/30 rounded-xl border border-slate-700/30 hover:border-cyan-500/30 transition-all">
                  <div className="p-1.5 md:p-2 rounded-lg bg-cyan-500/10 w-fit">
                    <FileText className="h-4 w-4 md:h-5 md:w-5 text-cyan-400" />
                  </div>
                  <div className="flex-1">
                    <h5 className="font-semibold text-white text-sm md:text-base">{item.title}</h5>
                    <p className="text-slate-400 text-xs md:text-sm mt-0.5">{item.description}</p>
                  </div>
                  <div className="flex items-center gap-1.5 bg-yellow-500/10 px-2 py-1 rounded-full w-fit">
                    <AlertCircle className="h-3 w-3 text-yellow-400" />
                    <span className="text-yellow-400 text-[10px] md:text-xs font-medium">Required</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 md:pt-4 border-t border-slate-700/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs md:text-sm text-slate-400">Your Current Status:</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className={`w-2 h-2 rounded-full ${userLegalCompliant ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'}`}></div>
                  <span className={`font-semibold text-sm md:text-base ${userLegalCompliant ? 'text-green-400' : 'text-yellow-400'}`}>
                    {userLegalCompliant ? 'Eligible for Investment' : 'Pending Legal Requirements'}
                  </span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  variant="outline" 
                  onClick={onClose}
                  className="border-slate-600 text-slate-300 hover:bg-slate-800/50 w-full sm:w-auto"
                >
                  Review Later
                </Button>
                {!userLegalCompliant && (
                  <Button
                    className="bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-700 hover:to-emerald-700 text-white w-full sm:w-auto"
                    onClick={onBeginVerification}
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Begin Verification
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Footer Disclaimer */}
          <div className="bg-slate-900/30 p-3 md:p-4 rounded-xl border border-amber-500/20">
            <div className="flex items-start gap-2 md:gap-3">
              <AlertCircle className="h-4 w-4 md:h-5 md:w-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-400 text-xs md:text-sm mb-1">Important Notice:</p>
                <p className="text-slate-400 text-[10px] md:text-xs leading-relaxed">
                  This offering represents fractional ownership in the $5.5B Can Gio International Transshipment Port infrastructure project. Investment is available only to accredited investors as defined by Vietnamese securities regulations. All investments are subject to legal documentation and regulatory compliance. Past performance does not guarantee future results. TIL Group Vietnam operates under license from the Vietnamese Ministry of Transport.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
