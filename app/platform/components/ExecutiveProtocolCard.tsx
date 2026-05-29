'use client';

import React from 'react';
import { TrendingUp, Building2, Target, Award, Anchor, Shield, Clock, BarChart3 } from 'lucide-react';

export default function ExecutiveProtocolCard() {
  const metrics = [
    {
      key: 'averageAmount',
      icon: TrendingUp,
      color: 'cyan',
      value: '$1.2M',
      badge: '↑ 25% from previous',
      label: 'Executive Round Average',
      trend: '↑ 25% from previous',
    },
    {
      key: 'institutionalParticipation',
      icon: Building2,
      color: 'green',
      value: '42%',
      badge: 'Institutional',
      label: 'Fund Participation',
      trend: 'VC & Family Offices',
    },
    {
      key: 'phaseProgress',
      icon: Target,
      color: 'cyan',
      value: '$50M',
      badge: 'Phase 1',
      label: 'of $150M Presale',
      trend: '(2.7% of $5.5B Project)',
      hasProgressBar: true,
      progressValue: 33,
    },
    {
      key: 'accreditedStatus',
      icon: Award,
      color: 'amber',
      value: '100%',
      badge: 'Verified',
      label: 'Accredited Status',
      trend: 'KYC/AML Compliant',
    },
  ];

  const getColorStyles = (color: string) => {
    const styles: Record<string, { text: string; bg: string; border: string; badge: string }> = {
      cyan: {
        text: 'text-cyan-400',
        bg: 'bg-cyan-500/10',
        border: 'border-cyan-500/20',
        badge: 'bg-cyan-500/10 text-cyan-400',
      },
      green: {
        text: 'text-green-400',
        bg: 'bg-green-500/10',
        border: 'border-green-500/20',
        badge: 'bg-green-500/10 text-green-400',
      },
      amber: {
        text: 'text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/20',
        badge: 'bg-amber-500/10 text-amber-400',
      },
    };
    return styles[color] || styles.cyan;
  };

  return (
    <div className="bg-gradient-to-r from-blue-900/50 to-cyan-900/50 backdrop-blur-sm p-4 md:p-6 rounded-xl border border-cyan-500/20 shadow-xl">
      
      {/* Header Section */}
      <div className="text-center mb-5 md:mb-6">
        <div className="inline-flex items-center justify-center p-2 md:p-3 bg-gradient-to-br from-cyan-900 to-emerald-900 rounded-full border border-cyan-500/30 mb-2 md:mb-3">
          <Anchor className="h-5 w-5 md:h-6 md:w-6 text-cyan-400" />
        </div>
        <h3 className="text-lg md:text-xl font-bold text-white">Executive Presale Protocol</h3>
        <p className="text-slate-400 text-xs md:text-sm mt-1">Priority Access · Institutional Grade</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {metrics.map((metric) => {
          const colors = getColorStyles(metric.color);
          const Icon = metric.icon;
          
          return (
            <div
              key={metric.key}
              className={`bg-gradient-to-br from-slate-900 to-[#062b32] p-3 md:p-4 rounded-lg border ${colors.border} hover:border-opacity-50 transition-all duration-300`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className={`text-xl md:text-2xl font-bold ${colors.text}`}>
                    {metric.value}
                  </div>
                  <div className="text-[10px] md:text-xs text-slate-400 mt-0.5 md:mt-1">
                    {metric.label}
                  </div>
                </div>
                <div className={`p-1.5 md:p-2 rounded-lg ${colors.bg} flex-shrink-0`}>
                  <Icon className={`h-4 w-4 md:h-5 md:w-5 ${colors.text}`} />
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-2 md:mt-3">
                <span className={`text-[10px] md:text-xs ${colors.badge} px-1.5 py-0.5 md:px-2 md:py-1 rounded`}>
                  {metric.badge}
                </span>
                <span className={`text-[10px] md:text-xs ${colors.text} opacity-80`}>
                  {metric.trend}
                </span>
              </div>
              
              {metric.hasProgressBar && (
                <div className="mt-2 md:mt-3">
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`bg-gradient-to-r from-cyan-500 to-emerald-400 h-1.5 rounded-full transition-all duration-500`}
                      style={{ width: `${metric.progressValue}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Status Footer */}
      <div className="mt-4 md:mt-6 pt-3 md:pt-4 border-t border-cyan-500/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 w-2 h-2 bg-green-400 rounded-full animate-ping opacity-75"></div>
            </div>
            <span className="text-xs md:text-sm text-slate-300">Your Protocol Status:</span>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 md:h-4 md:w-4 text-green-400" />
              <span className="text-green-400 font-semibold text-xs md:text-sm">
                ACTIVE
              </span>
            </div>
            <div className="text-[10px] md:text-xs bg-green-500/20 text-green-400 px-2 py-0.5 md:px-2.5 md:py-1 rounded-full">
              Priority Access
            </div>
          </div>
        </div>
        
        <div className="flex items-start gap-2 mt-3">
          <Clock className="h-3 w-3 md:h-3.5 md:w-3.5 text-slate-500 flex-shrink-0 mt-0.5" />
          <p className="text-[10px] md:text-xs text-slate-400 leading-relaxed">
            Executive protocol grants you priority allocation in the $150M Can Gio Port presale. Minimum investment: $100K for full ROI rates.
          </p>
        </div>
      </div>
    </div>
  );
}
