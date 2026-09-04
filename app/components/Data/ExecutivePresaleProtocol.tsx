'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Briefcase, Ship, Cpu, Target, MapPin, Users, Globe, TrendingUp, Lock, Shield, Zap, DollarSign, Building2, ChevronRight, CheckCircle2, X } from 'lucide-react';
import { supabase } from '../Lib/supabaseClient';
import { Button } from '@/components/ui/button';

interface ExecutiveProtocolProps {
  userId: string;
  onComplete: (status: string) => void;
  onCancel: () => void;
  session: any;
}

interface ProtocolData {
  discovery_source: string[];
  primary_interest_factors: string[];
  maritime_investment_experience: string;
  heard_about_project: string;
  conviction_based_status?: string;  
  infrastructure_interests: {
    portConcessions: { reasons: string[], questions: string[] };
    dockingOperations: { reasons: string[], questions: string[] };
    containerHandling: { reasons: string[], questions: string[] };
    logisticsInfrastructure: { reasons: string[], questions: string[] };
    straitPassageRights: { reasons: string[], questions: string[] };
    portTechnology: { reasons: string[], questions: string[] };
  };
  preferred_investment_focus: string;
  conviction_level: string;
  key_investment_factors: string[];
  technical_understanding: string[];
  expected_roi_timeline: string;
  risk_appetite: string;
  due_diligence_requests: string[];
  partnership_consideration: boolean;
  site_visit_interest: boolean;
  technical_team_meeting: boolean;
  follow_on_capacity: boolean;
  engagement_level: string;
  preferred_briefing: string[];
  exclusive_access_requests: string[];
  nda_status: boolean;
  submitted_at: string | null;
  protocol_status: 'pending' | 'qualified' | 'priority' | 'referred';
}

// Hardcoded data with updated terminology
const DISCOVERY_SOURCES = [
  "Maritime industry conference (Maritime Week, SMM Hamburg)",
  "Institutional network referral (Goldman, Blackstone, Carlyle)",
  "Infrastructure securities community",
  "Financial media (Bloomberg, Financial Times, WSJ)",
  "Direct outreach from TIL Group executive team",
  "Port/Logistics industry contacts",
  "Previous digital securities track record",
  "Other institutional executive recommendation"
];

const INTEREST_FACTORS = [
  "Real Asset Backing",
  "Portfolio Diversification",
  "Infrastructure Securities Growth",
  "Inflation Hedge",
  "Vietnam Growth Exposure",
  "Stable Digital Yields"
];

const EXPERIENCE_LEVELS = [
  { value: "none", label: "First Time", desc: "New to digital infrastructure securities" },
  { value: "limited", label: "Limited Exposure", desc: "Some securities experience" },
  { value: "moderate", label: "Moderate", desc: "Multiple digital securities allocations" },
  { value: "extensive", label: "Extensive", desc: "Portfolio-level securities exposure" }
];

const INVESTMENT_FACTORS = [
  "Fractional digital ownership provides liquidity in infrastructure assets",
  "Proven port economics (18-25% historical ROI in Asia)",
  "First-mover advantage in Vietnam digital securities",
  "Essential infrastructure = recession-resistant yields",
  "Vietnam economic growth driver (6-8% annual GDP)",
  "Inflation hedge via real asset-backed securities",
  "Vietnamese government partnership provides stability",
  "Digital port efficiency improvements",
  "Portfolio diversification from traditional securities",
  "ESG impact through modern efficient infrastructure"
];

const CONVICTION_LEVELS = [
  { value: "exploratory", label: "Exploratory", desc: "Initial securities research phase" },
  { value: "interested", label: "Interested", desc: "Serious consideration" },
  { value: "analysis", label: "Analysis Complete", desc: "Ready for allocation" },
  { value: "high_conviction", label: "High Conviction", desc: "Strategic securities priority" },
  { value: "anchor", label: "Anchor Executive", desc: "Lead participant potential" }
];

const TIMELINE_OPTIONS = [
  { value: "short_term", label: "1-3 years (Operational efficiency gains)" },
  { value: "medium_term", label: "3-5 years (Revenue growth + value appreciation)" },
  { value: "long_term", label: "5-10 years (Infrastructure value appreciation)" },
  { value: "strategic", label: "Strategic (Beyond financial returns)" }
];

const RISK_OPTIONS = [
  { value: "conservative", label: "Conservative (Stable yields, low volatility)" },
  { value: "moderate", label: "Moderate (Balanced risk/return)" },
  { value: "growth", label: "Growth (Higher yield potential, moderate risk)" },
  { value: "aggressive", label: "Aggressive (Maximum upside potential)" }
];

const DUE_DILIGENCE_MATERIALS = [
  "Financial Audits & Historical Performance Analysis",
  "Vietnamese Regulatory Compliance Documentation",
  "Port Concession Agreement (English/Vietnamese)",
  "Digital Securities Revenue Projections & Financial Modeling",
  "Environmental & Social Impact Assessments",
  "Technical Architecture & Engineering Reports",
  "Management Team Background & Experience",
  "Market Analysis & Competitive Landscape",
  "Legal Opinion on Digital Securities Ownership Structure",
  "Construction & Development Timelines"
];

const PARTNERSHIP_OPTIONS = [
  { value: "partnership_consideration", label: "Joint Venture/Partnership Consideration" },
  { value: "site_visit_interest", label: "Physical Site Visit Request" },
  { value: "technical_team_meeting", label: "Technical Team Meeting" },
  { value: "follow_on_capacity", label: "Follow-on Securities Capacity" }
];

const ENGAGEMENT_LEVELS = [
  { value: "standard", label: "Standard", desc: "Regular updates + documentation" },
  { value: "priority", label: "Priority", desc: "Monthly executive briefings" },
  { value: "exclusive", label: "Exclusive", desc: "Direct TIL Group executive access" }
];

const BRIEFING_FORMATS = [
  "1:1 Executive Briefing (TIL Group CEO/CFO Level)",
  "Technical Deep Dive (Port Engineering Team)",
  "Digital Securities Financial Modeling & Projection Workshop",
  "Vietnamese Regulatory & Compliance Review",
  "Can Gio Port Site Tour",
  "Executive Consortium Meeting"
];

const EXCLUSIVE_REQUESTS = [
  "Private Presale Digital Securities Invitation",
  "TIL Group Founder/CEO Dinner",
  "First Look at Expansion Phases",
  "Co-Securities Opportunities",
  "Port Advisory Board Consideration",
  "Custom Infrastructure Securities Reporting"
];

const REASON_OPTIONS = [
  "Yield predictability & contractual stability",
  "Growth potential in Southeast Asian markets",
  "Technological efficiency improvements",
  "Strategic geographic positioning",
  "High barrier to entry / competitive moat",
  "Government partnership structure"
];

// Infrastructure education data
const INFRASTRUCTURE_EDUCATION = {
  portConcessions: {
    name: "Port Concession Rights",
    icon: '⚓',
    highlights: [
      "25-year Vietnamese government concession agreement",
      "Revenue sharing with guaranteed minimum volumes",
      "CPI-indexed fee escalations built into contract",
      "Strategic chokepoint infrastructure"
    ],
    conviction_points: [
      "99.7% historical occupancy at comparable ports",
      "15-22% annual revenue growth 2019-2024",
      "Limited competition with high barrier to entry",
      "Government-backed revenue stability"
    ]
  },
  dockingOperations: {
    name: "Docking & Berthing Operations",
    icon: '🛳',
    highlights: [
      "Predictable per-vessel revenue model",
      "High-margin operations (85%+ gross margin)",
      "Annual 8-12% fee escalations contractual",
      "Diverse vessel mix (container, bulk, LNG)"
    ],
    conviction_points: [
      "Zero customer concentration risk",
      "Automatic CPI-linked fee increases",
      "30%+ EBITDA margins industry standard",
      "Essential service (ships must dock to operate)"
    ]
  },
  containerHandling: {
    name: "Container Handling Operations",
    icon: '📦',
    highlights: [
      "Fee per container moved (volume-based revenue)",
      "Direct exposure to global trade growth (5-7% annual)",
      "Automation-ready operations for efficiency",
      "High throughput capacity (6M+ TEU annually)"
    ],
    conviction_points: [
      "Direct correlation to global GDP growth",
      "Limited capex requirements post-construction",
      "Proven 18-22% ROI in similar Asian ports",
      "Strategic location on primary shipping routes"
    ]
  },
  logisticsInfrastructure: {
    name: "Logistics & Warehousing Infrastructure",
    icon: '🚚',
    highlights: [
      "Warehousing + distribution + intermodal facilities",
      "Multi-tenant revenue diversification",
      "Land value appreciation component",
      "Integrated supply chain solution"
    ],
    conviction_points: [
      "15-25% annual appreciation in strategic locations",
      "Long-term leases (10-15 years) with blue-chip tenants",
      "Anchor tenants from Fortune 500 logistics companies",
      "Infrastructure-as-core-asset securities thesis"
    ]
  },
  straitPassageRights: {
    name: "Strait Passage Rights",
    icon: '🌊',
    highlights: [
      "Natural geographic monopoly position",
      "Toll-based revenue per vessel transit",
      "Zero competition (geographic exclusivity)",
      "Strategic geopolitical infrastructure asset"
    ],
    conviction_points: [
      "40% of global trade passes through target straits",
      "25-35% annual revenue growth potential",
      "Government-backed exclusivity rights",
      "Essential infrastructure for global shipping routes"
    ]
  },
  portTechnology: {
    name: "Port Digital Management System",
    icon: '⚡',
    highlights: [
      "Digital port operations management platform",
      "Real-time revenue tracking and reporting",
      "30%+ operational efficiency improvements",
      "First-mover in Southeast Asian smart ports"
    ],
    conviction_points: [
      "Digital transformation of $1.2T maritime industry",
      "Proven 40% cost reduction in pilot implementations",
      "Exclusive partnerships with Vietnamese authorities",
      "Scalable to 500+ global ports"
    ]
  }
};

export default function ExecutiveProtocol({ 
  userId, 
  onComplete, 
  onCancel
}: ExecutiveProtocolProps) {
  const [currentSection, setCurrentSection] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [sectionErrors, setSectionErrors] = useState<{[key: number]: string}>({});
  const [selectedFocusCount, setSelectedFocusCount] = useState(0);
  const [discoverySourcesCount, setDiscoverySourcesCount] = useState(0);
  const [investmentFactorsCount, setInvestmentFactorsCount] = useState(0);
  const [dueDiligenceCount, setDueDiligenceCount] = useState(0);
  const [briefingFormatsCount, setBriefingFormatsCount] = useState(0);
  const [exclusiveAccessCount, setExclusiveAccessCount] = useState(0);
  const [partnershipSelectionsCount, setPartnershipSelectionsCount] = useState(0);  

  useEffect(() => {
    if (currentSection !== 1) setDiscoverySourcesCount(0);
    if (currentSection !== 3) setInvestmentFactorsCount(0);
    if (currentSection !== 5) {
      setBriefingFormatsCount(0);
      setExclusiveAccessCount(0);
    }
    if (currentSection !== 2) setSelectedFocusCount(0);
  }, [currentSection]);

  const [formData, setFormData] = useState<ProtocolData>({
    discovery_source: [],
    primary_interest_factors: [],
    maritime_investment_experience: '',
    heard_about_project: '',
    infrastructure_interests: {
      portConcessions: { reasons: [], questions: [] },
      dockingOperations: { reasons: [], questions: [] },
      containerHandling: { reasons: [], questions: [] },
      logisticsInfrastructure: { reasons: [], questions: [] },
      straitPassageRights: { reasons: [], questions: [] },
      portTechnology: { reasons: [], questions: [] }
    },
    preferred_investment_focus: '',    
    conviction_level: '',
    key_investment_factors: [],
    technical_understanding: [],
    expected_roi_timeline: '',
    risk_appetite: '',
    due_diligence_requests: [],
    partnership_consideration: false,
    site_visit_interest: false,
    technical_team_meeting: false,
    follow_on_capacity: false,
    engagement_level: '',
    preferred_briefing: [],
    exclusive_access_requests: [],
    nda_status: false,
    submitted_at: null,
    protocol_status: '' as any,
  });

  const validateSectionWithError = (section: number): boolean => {
    let isValid = true;
    let errorMessage = '';
    
    switch(section) {
      case 1:
        if (formData.discovery_source.length === 0) {
          errorMessage = "Please indicate how you discovered this digital securities opportunity";
          isValid = false;
        } else if (!formData.maritime_investment_experience) {
          errorMessage = "Please select your infrastructure securities experience level";
          isValid = false;
        }
        break;
        
      case 2:
        const hasInterest = Object.values(formData.infrastructure_interests)
          .some(asset => asset.reasons.length > 0);
        if (!hasInterest) {
          errorMessage = "Please select at least one infrastructure securities focus area with reasons";
          isValid = false;
        } else if (!formData.preferred_investment_focus) {
          errorMessage = "Please select your preferred securities focus area";
          isValid = false;
        }
        break;
        
      case 3:
        if (!formData.conviction_level || formData.key_investment_factors.length === 0) {
          errorMessage = "Please indicate your securities analysis level and key factors";
          isValid = false;
        }
        break;
        
      case 4:
        if (formData.due_diligence_requests.length === 0) {
          errorMessage = "Please select at least 1 due diligence material to review";
          isValid = false;
        }  
        break;
      
      case 5:
        if (!formData.engagement_level || formData.preferred_briefing.length === 0) {
          errorMessage = "Please select engagement level and briefing preferences";
          isValid = false;
        }
        break;
    }
    
    setSectionErrors({...sectionErrors, [section]: errorMessage});
    return isValid;
  };

  const isSection5Valid = useMemo(() => {
    return !!formData.engagement_level && 
           formData.preferred_briefing.length > 0 && 
           formData.nda_status;
  }, [formData.engagement_level, formData.preferred_briefing, formData.nda_status]);

  const renderSection1 = () => (
    <div className="space-y-6 md:space-y-8">
      <div className="border-b border-slate-700 pb-3 md:pb-4">
        <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight"></h3>
        <p className="text-slate-400 text-xs md:text-sm mt-1">Understanding our outreach helps us better serve institutional executives</p>
      </div>
      
      <div className="bg-gradient-to-r from-cyan-900 to-blue-900 p-4 md:p-6 rounded-xl border border-cyan-800/30">
        <h4 className="text-base md:text-lg font-semibold text-white mb-2 md:mb-3">How did you discover the TIL Group Can Gio Port Digital Securities Offering? *</h4>
        <p className="text-slate-400 text-xs md:text-sm mb-3 md:mb-4">Select up to 3 sources</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
          {DISCOVERY_SOURCES.map((source) => (
            <label key={source} className={`flex items-center space-x-2 md:space-x-3 p-2 md:p-3 rounded-lg border transition-all cursor-pointer ${
              formData.discovery_source.includes(source) 
                ? 'border-cyan-500 bg-cyan-500/10' 
                : 'border-slate-700 bg-slate-900/50 hover:bg-slate-800/50'
            }`}>
              <input
                type="checkbox"
                checked={formData.discovery_source.includes(source)}
                onChange={(e) => {
                  const isChecked = e.target.checked;
                  const currentSources = formData.discovery_source;
                  if (isChecked && currentSources.length >= 3) return;
                  const updated = isChecked
                    ? [...currentSources, source]
                    : currentSources.filter(s => s !== source);
                  setFormData({...formData, discovery_source: updated});
                }}
                className="w-3.5 h-3.5 md:w-4 md:h-4 accent-cyan-500"
              />
              <span className="text-xs md:text-sm text-slate-300">{source}</span>
            </label>
          ))}
        </div>
        <p className="text-[10px] md:text-xs text-slate-400 mt-2">{formData.discovery_source.length}/3 selections maximum</p>
      </div>
      
      <div>
        <h4 className="text-base md:text-lg font-semibold text-white mb-2 md:mb-3">Infrastructure Securities Experience *</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3">
          {EXPERIENCE_LEVELS.map((exp) => (
            <button
              key={exp.value}
              type="button"
              onClick={() => setFormData({...formData, maritime_investment_experience: exp.value})}
              className={`p-3 md:p-4 rounded-xl border text-left transition-all ${
                formData.maritime_investment_experience === exp.value
                  ? 'border-cyan-500 bg-cyan-500/10 ring-2 ring-cyan-400'
                  : 'border-slate-700 bg-slate-900/50 hover:border-slate-600'
              }`}
            >
              <div className="font-semibold text-sm md:text-base text-white">{exp.label}</div>
              <div className="text-[10px] md:text-xs text-slate-400 mt-1">{exp.desc}</div>
            </button>
          ))}
        </div>
      </div>
      
      <div>
        <h4 className="text-base md:text-lg font-semibold text-white mb-2 md:mb-3">What initially intrigued you about fractional digital infrastructure ownership? (Select top 3) *</h4>
        <p className="text-slate-400 text-xs md:text-sm mb-3 md:mb-4">Select up to 3 primary factors driving your interest</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3">
          {INTEREST_FACTORS.map((factor, idx) => {
            const icons = ['🏗', '🎯', '📈', '🛡', '🇻🇳', '💰'];
            return (
              <button
                key={factor}
                type="button"
                onClick={() => {
                  const current = formData.primary_interest_factors;
                  const updated = current.includes(factor)
                    ? current.filter(f => f !== factor)
                    : current.length < 3 ? [...current, factor] : current;
                  setFormData({...formData, primary_interest_factors: updated});
                }}
                className={`p-3 md:p-4 rounded-xl border flex items-center space-x-2 md:space-x-3 transition-all ${
                  formData.primary_interest_factors.includes(factor)
                    ? 'border-cyan-500 bg-cyan-500/10 ring-2 ring-cyan-400'
                    : 'border-slate-700 bg-slate-900/50 hover:border-slate-600'
                } ${formData.primary_interest_factors.length >= 3 && !formData.primary_interest_factors.includes(factor) ? 'opacity-50' : ''}`}
              >
                <span className="text-lg md:text-xl">{icons[idx]}</span>
                <span className="text-xs md:text-sm text-white">{factor}</span>
              </button>
            );
          })}
        </div>
        <p className="text-[10px] md:text-xs text-slate-400 mt-2">{formData.primary_interest_factors.length}/3 selections maximum</p>
      </div>
    </div>
  );

  const renderSection2 = () => (
    <div className="space-y-6 md:space-y-8">
      <div className="border-b border-slate-700 pb-3 md:pb-4">
        <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight">Digital Infrastructure Securities Education</h3>
        <p className="text-slate-400 text-xs md:text-sm mt-1">Each infrastructure component represents a unique value proposition in the $5.5B Can Gio Port ecosystem. Select what intrigues you most about each digital securities opportunity.</p>
      </div>
      
      <div className="space-y-4 md:space-y-6">
        {Object.entries(INFRASTRUCTURE_EDUCATION).map(([key, asset]) => (
          <div key={key} className="border border-slate-700 rounded-xl p-4 md:p-6 bg-gradient-to-r from-slate-900 to-slate-950">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <div className="flex items-center space-x-2 md:space-x-3">
                <span className="text-xl md:text-2xl">{asset.icon}</span>
                <h4 className="text-lg md:text-xl font-bold text-white">{asset.name}</h4>
              </div>
            </div>
            
            <div className="mb-3 md:mb-4">
              <h5 className="text-xs md:text-sm font-semibold text-slate-300 mb-1 md:mb-2">Key Securities Highlights:</h5>
              <div className="flex flex-wrap gap-1.5 md:gap-2">
                {asset.highlights.slice(0, 2).map((highlight, idx) => (
                  <span key={idx} className="text-[10px] md:text-xs bg-cyan-900/30 text-cyan-300 px-1.5 py-0.5 md:px-2 md:py-1 rounded">
                    {highlight}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="space-y-3 md:space-y-4">
              <div>
                <label className="text-xs md:text-sm font-medium text-slate-300 mb-1 md:mb-2 block">What interests you about {asset.name}? (Select up to 2 total across all areas) *</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 md:gap-2">
                  {REASON_OPTIONS.map((reason) => {
                    const isSelected = formData.infrastructure_interests[key as keyof typeof formData.infrastructure_interests].reasons.includes(reason);
                    const isDisabled = selectedFocusCount >= 2 && !isSelected;
                    return (
                      <label key={reason} className="flex items-center space-x-1.5 md:space-x-2 p-1.5 md:p-2 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            const updated = {...formData.infrastructure_interests};
                            const assetData = updated[key as keyof typeof updated];
                            if (e.target.checked) {
                              if (selectedFocusCount < 2) {
                                updated[key as keyof typeof updated] = {...assetData, reasons: [...assetData.reasons, reason]};
                                setSelectedFocusCount(prev => prev + 1);
                                setFormData({...formData, infrastructure_interests: updated});
                              }
                            } else {
                              updated[key as keyof typeof updated] = {...assetData, reasons: assetData.reasons.filter(r => r !== reason)};
                              setSelectedFocusCount(prev => prev - 1);
                              setFormData({...formData, infrastructure_interests: updated});
                            }
                          }}
                          disabled={isDisabled}
                          className="w-3.5 h-3.5 md:w-4 md:h-4 accent-cyan-500"
                        />
                        <span className={`text-[11px] md:text-xs ${isDisabled ? 'text-slate-500' : 'text-slate-300'}`}>{reason}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
              
              {formData.infrastructure_interests[key as keyof typeof formData.infrastructure_interests].reasons.length > 0 && (
                <div>
                  <label className="text-xs md:text-sm font-medium text-slate-300 mb-1 md:mb-2 block">Is {asset.name} your preferred securities focus? *</label>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name={`preferred-${key}`}
                        checked={formData.preferred_investment_focus === key}
                        onChange={() => setFormData({...formData, preferred_investment_focus: key})}
                        className="w-3.5 h-3.5 md:w-4 md:h-4 accent-cyan-500"
                      />
                      <span className="text-xs md:text-sm text-slate-300">Yes, primary securities focus</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name={`preferred-${key}`}
                        checked={formData.preferred_investment_focus !== key && formData.preferred_investment_focus !== ''}
                        onChange={() => {
                          if (formData.preferred_investment_focus === key) {
                            setFormData({...formData, preferred_investment_focus: ''});
                          }
                        }}
                        className="w-3.5 h-3.5 md:w-4 md:h-4 accent-cyan-500"
                      />
                      <span className="text-xs md:text-sm text-slate-300">No, considering other options</span>
                    </label>
                  </div>
                </div>
              )}
              
              <div>
                <label className="text-xs md:text-sm font-medium text-slate-300 mb-1 md:mb-2 block">Specific questions about {asset.name}:</label>
                <textarea
                  value={formData.infrastructure_interests[key as keyof typeof formData.infrastructure_interests].questions.join('\n')}
                  onChange={(e) => {
                    const updated = {...formData.infrastructure_interests};
                    updated[key as keyof typeof updated] = {
                      ...updated[key as keyof typeof updated],
                      questions: e.target.value.split('\n').filter(q => q.trim())
                    };
                    setFormData({...formData, infrastructure_interests: updated});
                  }}
                  className="w-full p-2 md:p-3 rounded-lg bg-slate-900/70 border border-slate-700 text-white text-xs md:text-sm"
                  rows={2}
                  placeholder="e.g., Specific location details? Revenue projection methodology? Vietnamese regulatory status?"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs md:text-sm text-slate-400">{selectedFocusCount}/2 selections used</p>
    </div>
  );

  const renderSection3 = () => (
    <div className="space-y-6 md:space-y-8">
      <div className="border-b border-slate-700 pb-3 md:pb-4">
        <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight">Securities Analysis & Risk Assessment</h3>
        <p className="text-slate-400 text-xs md:text-sm mt-1">Based on your analysis, what's your securities readiness level?</p>
      </div>
      
      <div className="bg-gradient-to-r from-emerald-900 to-cyan-900 p-4 md:p-6 rounded-xl border border-emerald-800/30">
        <h4 className="text-base md:text-lg font-semibold text-white mb-2 md:mb-3">Based on your analysis, what's your securities readiness level? *</h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-3">
          {CONVICTION_LEVELS.map((level) => (
            <button
              key={level.value}
              type="button"
              onClick={() => setFormData({...formData, conviction_level: level.value})}
              className={`p-2 md:p-4 rounded-xl text-center transition-all ${
                formData.conviction_level === level.value
                  ? 'ring-2 ring-cyan-400 bg-cyan-600'
                  : 'bg-slate-700 hover:bg-slate-600'
              }`}
            >
              <div className="font-bold text-white text-xs md:text-sm">{level.label}</div>
              <div className="text-[10px] md:text-xs text-slate-200 mt-0.5 md:mt-1">{level.desc}</div>
            </button>
          ))}
        </div>
      </div>
      
      <div>
        <h4 className="text-base md:text-lg font-semibold text-white mb-2 md:mb-3">What are your key securities decision factors? (Select top 5) *</h4>
        <p className="text-slate-400 text-xs md:text-sm mb-3 md:mb-4">5 selections maximum</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3">
          {INVESTMENT_FACTORS.map((factor) => {
            const isSelected = formData.key_investment_factors.includes(factor);
            const isDisabled = investmentFactorsCount >= 5 && !isSelected;
            return (
              <button
                key={factor}
                type="button"
                onClick={() => {
                  if (isSelected) {
                    setFormData({...formData, key_investment_factors: formData.key_investment_factors.filter(f => f !== factor)});
                    setInvestmentFactorsCount(prev => prev - 1);
                  } else if (investmentFactorsCount < 5) {
                    setFormData({...formData, key_investment_factors: [...formData.key_investment_factors, factor]});
                    setInvestmentFactorsCount(prev => prev + 1);
                  }
                }}
                className={`p-2 md:p-3 rounded-lg border text-left transition-all ${
                  isSelected
                    ? 'border-cyan-500 bg-cyan-500/10 ring-2 ring-cyan-400'
                    : 'border-slate-700 bg-slate-900/50 hover:border-slate-600'
                } ${isDisabled ? 'opacity-50' : ''}`}
              >
                <span className="text-xs md:text-sm text-slate-300">{factor}</span>
              </button>
            );
          })}
        </div>
        <p className="text-[10px] md:text-xs text-slate-400 mt-2">{investmentFactorsCount}/5 selections maximum</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div>
          <h4 className="text-base md:text-lg font-semibold text-white mb-2 md:mb-3">Expected Securities Yield Timeline *</h4>
          <div className="space-y-1.5 md:space-y-2">
            {TIMELINE_OPTIONS.map((timeline) => (
              <label key={timeline.value} className="flex items-center space-x-2 md:space-x-3 p-2 md:p-3 bg-slate-900/50 rounded-lg border border-slate-700 cursor-pointer">
                <input
                  type="radio"
                  name="roi_timeline"
                  checked={formData.expected_roi_timeline === timeline.value}
                  onChange={() => setFormData({...formData, expected_roi_timeline: timeline.value})}
                  className="w-3.5 h-3.5 md:w-4 md:h-4 accent-cyan-500"
                />
                <span className="text-xs md:text-sm text-slate-300">{timeline.label}</span>
              </label>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="text-base md:text-lg font-semibold text-white mb-2 md:mb-3">Risk Appetite for Infrastructure Securities *</h4>
          <div className="space-y-1.5 md:space-y-2">
            {RISK_OPTIONS.map((risk) => (
              <label key={risk.value} className="flex items-center space-x-2 md:space-x-3 p-2 md:p-3 bg-slate-900/50 rounded-lg border border-slate-700 cursor-pointer">
                <input
                  type="radio"
                  name="risk_appetite"
                  checked={formData.risk_appetite === risk.value}
                  onChange={() => setFormData({...formData, risk_appetite: risk.value})}
                  className="w-3.5 h-3.5 md:w-4 md:h-4 accent-cyan-500"
                />
                <span className="text-xs md:text-sm text-slate-300">{risk.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderSection4 = () => (
    <div className="space-y-6 md:space-y-8">
      <div className="border-b border-slate-700 pb-3 md:pb-4">
        <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight">Due Diligence & Partnership</h3>
        <p className="text-slate-400 text-xs md:text-sm mt-1">What due diligence materials would you like to review?</p>
      </div>
      
      <div>
        <h4 className="text-base md:text-lg font-semibold text-white mb-2 md:mb-3">What due diligence materials would you like to review? (Select up to 5) *</h4>
        <p className="text-slate-400 text-xs md:text-sm mb-3 md:mb-4">5 selections maximum</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
          {DUE_DILIGENCE_MATERIALS.map((material) => {
            const isSelected = formData.due_diligence_requests.includes(material);
            const isDisabled = dueDiligenceCount >= 5 && !isSelected;
            return (
              <label key={material} className={`flex items-center space-x-2 md:space-x-3 p-2 md:p-3 rounded-lg border cursor-pointer ${
                isSelected ? 'border-cyan-500 bg-cyan-500/10' : 'border-slate-700 bg-slate-900/50'
              } ${isDisabled ? 'opacity-50' : ''}`}>
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={(e) => {
                    if (e.target.checked && dueDiligenceCount < 5) {
                      setFormData({...formData, due_diligence_requests: [...formData.due_diligence_requests, material]});
                      setDueDiligenceCount(prev => prev + 1);
                    } else if (!e.target.checked) {
                      setFormData({...formData, due_diligence_requests: formData.due_diligence_requests.filter(d => d !== material)});
                      setDueDiligenceCount(prev => prev - 1);
                    }
                  }}
                  disabled={isDisabled}
                  className="w-3.5 h-3.5 md:w-4 md:h-4 accent-cyan-500"
                />
                <span className="text-xs md:text-sm text-slate-300">{material}</span>
              </label>
            );
          })}
        </div>
        <p className="text-[10px] md:text-xs text-slate-400 mt-2">{dueDiligenceCount}/5 selections maximum</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div>
          <h4 className="text-base md:text-lg font-semibold text-white mb-2 md:mb-3">Partnership Interest</h4>
          <div className="space-y-1.5 md:space-y-2">
            {PARTNERSHIP_OPTIONS.map((item) => {
              const fieldName = item.value as keyof ProtocolData;
              const currentCheckedCount = [
                formData.partnership_consideration,
                formData.site_visit_interest, 
                formData.technical_team_meeting,
                formData.follow_on_capacity
              ].filter(Boolean).length;
              const isDisabled = currentCheckedCount >= 2 && !formData[fieldName] as boolean;
              return (
                <label key={item.value} className={`flex items-center space-x-2 md:space-x-3 p-2 md:p-3 bg-cyan-900/10 rounded-lg border border-cyan-800 cursor-pointer ${isDisabled ? 'opacity-50' : ''}`}>
                  <input
                    type="checkbox"
                    checked={formData[fieldName] as boolean}
                    onChange={(e) => {
                      const isChecked = e.target.checked;
                      if (isChecked && currentCheckedCount >= 2) return;
                      setFormData({...formData, [fieldName]: isChecked});
                    }}
                    disabled={isDisabled}
                    className="w-4 h-4 md:w-5 md:h-5 accent-cyan-500"
                  />
                  <span className="text-xs md:text-sm text-white">{item.label}</span>
                </label>
              );
            })}
          </div>
          <p className="text-[10px] md:text-xs text-slate-400 mt-2">2 selections maximum</p>
        </div>

        <div className="bg-gradient-to-r from-purple-900 to-blue-900 p-4 md:p-6 rounded-xl border border-purple-800/30">
          <h4 className="text-base md:text-lg font-semibold text-white mb-2 md:mb-3">Executive Note</h4>
          <p className="text-slate-300 text-xs md:text-sm">
            Sophisticated institutional executives conduct thorough due diligence. TIL Group provides complete transparency to qualified executives.
          </p>
          <div className="mt-3 md:mt-4 space-y-1 md:space-y-2 text-[10px] md:text-xs text-slate-400">
            <div className="flex items-center">✓ Average due diligence period: 2-4 weeks for qualified executives</div>
            <div className="flex items-center">✓ All materials provided under NDA</div>
            <div className="flex items-center">✓ Direct access to port operational teams</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSection5 = () => (
    <div className="space-y-6 md:space-y-8">
      <div className="border-b border-slate-700 pb-3 md:pb-4">
        <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight">Executive Engagement</h3>
        <p className="text-slate-400 text-xs md:text-sm mt-1">How would you like to proceed?</p>
      </div>
      
      <div className="bg-gradient-to-r from-amber-900 to-yellow-900 p-4 md:p-6 rounded-xl border border-amber-800/30">
        <h4 className="text-base md:text-lg font-semibold text-white mb-2 md:mb-3">Preferred Engagement Level *</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3">
          {ENGAGEMENT_LEVELS.map((level) => (
            <button
              key={level.value}
              type="button"
              onClick={() => setFormData({...formData, engagement_level: level.value})}
              className={`p-2 md:p-4 rounded-xl border text-center transition-all ${
                formData.engagement_level === level.value
                  ? 'border-cyan-500 bg-cyan-500/10 ring-2 ring-cyan-400'
                  : 'border-slate-700 bg-slate-900/50 hover:border-slate-600'
              }`}
            >
              <div className="font-semibold text-white text-xs md:text-sm">{level.label}</div>
              <div className="text-[10px] md:text-xs text-slate-400 mt-0.5 md:mt-1">{level.desc}</div>
            </button>
          ))}
        </div>
      </div>
      
      <div>
        <h4 className="text-base md:text-lg font-semibold text-white mb-2 md:mb-3">Preferred Briefing Formats (Select all that apply) *</h4>
        <p className="text-slate-400 text-xs md:text-sm mb-3 md:mb-4">2 selections maximum</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
          {BRIEFING_FORMATS.map((format) => (
            <label key={format} className={`flex items-center space-x-2 md:space-x-3 p-2 md:p-3 rounded-lg border cursor-pointer ${
              formData.preferred_briefing.includes(format) ? 'border-cyan-500 bg-cyan-500/10' : 'border-slate-700 bg-slate-900/50'
            }`}>
              <input
                type="checkbox"
                checked={formData.preferred_briefing.includes(format)}
                onChange={(e) => {
                  const isChecked = e.target.checked;
                  if (isChecked && formData.preferred_briefing.length < 2) {
                    setFormData({...formData, preferred_briefing: [...formData.preferred_briefing, format]});
                  } else if (!isChecked) {
                    setFormData({...formData, preferred_briefing: formData.preferred_briefing.filter(b => b !== format)});
                  }
                }}
                className="w-3.5 h-3.5 md:w-4 md:h-4 accent-cyan-500"
              />
              <span className="text-xs md:text-sm text-slate-300">{format}</span>
            </label>
          ))}
        </div>
        <p className="text-[10px] md:text-xs text-slate-400 mt-2">{formData.preferred_briefing.length}/2 selections maximum</p>
      </div>

      <div className="bg-gradient-to-r from-red-900 to-amber-900 p-4 md:p-6 rounded-xl border border-red-800/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
          <div className="flex items-center space-x-2 md:space-x-3">
            <Lock className="w-5 h-5 md:w-6 md:h-6 text-red-400" />
            <div>
              <h4 className="font-semibold text-white text-sm md:text-base">Confidentiality Acknowledgement *</h4>
              <p className="text-xs md:text-sm text-slate-300">All due diligence materials are confidential and require NDA execution</p>
            </div>
          </div>
          <label className="flex items-center space-x-2 md:space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.nda_status}
              onChange={(e) => setFormData({...formData, nda_status: e.target.checked})}
              className="w-4 h-4 md:w-5 md:h-5 accent-cyan-500"
            />
            <span className="text-white font-medium text-xs md:text-sm">I acknowledge NDA requirements</span>
          </label>
        </div>
      </div>
      
      <div>
        <h4 className="text-base md:text-lg font-semibold text-white mb-2 md:mb-3">Exclusive Access Requests (Optional)</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
          {EXCLUSIVE_REQUESTS.map((request) => (
            <label key={request} className="flex items-center space-x-2 md:space-x-3 p-2 md:p-3 bg-purple-900/10 rounded-lg border border-purple-800 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.exclusive_access_requests.includes(request)}
                onChange={(e) => {
                  const updated = e.target.checked
                    ? [...formData.exclusive_access_requests, request]
                    : formData.exclusive_access_requests.filter(r => r !== request);
                  setFormData({...formData, exclusive_access_requests: updated});
                }}
                className="w-3.5 h-3.5 md:w-4 md:h-4 accent-cyan-500"
              />
              <span className="text-xs md:text-sm text-slate-300">{request}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const sections = [
    { title: "Discovery & Awareness", render: renderSection1 },
    { title: "Digital Infrastructure Securities", render: renderSection2 },
    { title: "Securities Analysis & Risk Assessment", render: renderSection3 },
    { title: "Due Diligence & Partnership", render: renderSection4 },
    { title: "Executive Engagement", render: renderSection5 }
  ];

  const handleNextSection = () => {
    if (!validateSectionWithError(currentSection)) return;
    if (currentSection < sections.length) {
      setCurrentSection(currentSection + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePreviousSection = () => {
    if (currentSection > 1) {
      setCurrentSection(currentSection - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleSubmit = async () => {
  if (!isSection5Valid) return;
  
  setSubmitting(true);
  
  try {
    const protocolStatus = formData.conviction_level === 'high_conviction' || formData.conviction_level === 'anchor'
      ? 'priority'
      : formData.conviction_level === 'analysis' ? 'qualified' : 'pending';

    // Build payload explicitly (same fields as before)
    const payload = {
      user_id: userId,
      discovery_source: formData.discovery_source,
      primary_interest_factors: formData.primary_interest_factors,
      maritime_investment_experience: formData.maritime_investment_experience,
      infrastructure_interests: formData.infrastructure_interests,
      preferred_investment_focus: formData.preferred_investment_focus,
      conviction_level: formData.conviction_level,
      key_investment_factors: formData.key_investment_factors,
      expected_roi_timeline: formData.expected_roi_timeline,
      risk_appetite: formData.risk_appetite,
      due_diligence_requests: formData.due_diligence_requests,
      partnership_consideration: formData.partnership_consideration,
      site_visit_interest: formData.site_visit_interest,
      technical_team_meeting: formData.technical_team_meeting,
      follow_on_capacity: formData.follow_on_capacity,
      engagement_level: formData.engagement_level,
      preferred_briefing: formData.preferred_briefing,
      exclusive_access_requests: formData.exclusive_access_requests,
      nda_status: formData.nda_status,
      protocol_status: protocolStatus,
      questionnaire_status: 'completed',
      submitted_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('executive_presale_protocols')
      .upsert(payload, { onConflict: 'user_id' });

    if (error) throw error;

    await supabase.from('user_legal_status').upsert({
      user_id: userId,
      executive_protocol_completed: true,
      presale_access_level: protocolStatus,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });

    // ✅ IMPORTANT: remove the window.location.reload() – let parent page handle UI
    if (onComplete) {
      onComplete(protocolStatus);
    }
  } catch (error: any) {
    console.error('Submission error:', error);
    alert(error.message || "Submission failed. Please try again.");
  } finally {
    setSubmitting(false);
  }
};

  return (
    <div className="fixed inset-0 bg-black/95 flex items-start md:items-center justify-center z-50 p-3 md:p-4 overflow-y-auto">
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl max-w-6xl w-full max-h-[95vh] md:max-h-[90vh] overflow-y-auto border border-slate-800 shadow-2xl">
        {/* Sticky Header */}
        <div className="sticky top-0 bg-gradient-to-r from-slate-900 to-slate-950 z-10 p-4 md:p-6 border-b border-slate-800">
          <div className="flex justify-between items-start">
            <div className="flex-1 pr-4">
              <h1 className="text-xl md:text-3xl font-bold text-white flex items-center gap-2 md:gap-3">
                <Building2 className="h-6 w-6 md:h-8 md:w-8 text-cyan-400" />
                <span className="text-base md:text-xl">TIL Group Executive Protocol</span>
              </h1>
              <p className="text-cyan-400 text-[10px] md:text-sm mt-0.5 md:mt-1">$5.5B Can Gio Port • Digital Securities Offering</p>
            </div>
            <button 
              onClick={onCancel} 
              className="text-slate-400 hover:text-white text-2xl md:text-3xl leading-none p-1"
              aria-label="Close"
            >
              <X className="h-5 w-5 md:h-6 md:w-6" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mt-4 md:mt-6 overflow-x-auto pb-2">
            {sections.map((section, index) => {
              const sectionNumber = index + 1;
              const isCompleted = sectionNumber < currentSection;
              const isCurrent = currentSection === sectionNumber;
              return (
                <div key={index} className="flex items-center flex-shrink-0">
                  <button
                    onClick={() => sectionNumber <= currentSection && setCurrentSection(sectionNumber)}
                    className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold transition-all text-xs md:text-base ${
                      isCurrent
                        ? 'bg-cyan-500 text-black'
                        : isCompleted ? 'bg-emerald-900 text-emerald-300' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5" /> : sectionNumber}
                  </button>
                  {index < sections.length - 1 && (
                    <div className={`w-8 md:w-16 h-px mx-1 md:mx-2 ${isCompleted ? 'bg-emerald-700' : 'bg-slate-700'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Main Content */}
        <div className="p-4 md:p-8">
          {sectionErrors[currentSection] && (
            <div className="mb-4 md:mb-6 p-3 md:p-4 bg-red-900/30 border border-red-700 rounded-lg">
              <p className="text-red-300 text-xs md:text-sm">{sectionErrors[currentSection]}</p>
            </div>
          )}

          <div className="mb-4 md:mb-6">
            <div className="inline-flex items-center gap-1.5 md:gap-2 px-2 py-0.5 md:px-3 md:py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-[10px] md:text-xs font-semibold">
              Section {currentSection} of {sections.length}
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white mt-1 md:mt-2">{sections[currentSection - 1].title}</h2>
          </div>

          {sections[currentSection - 1].render()}

          {/* Navigation Buttons */}
          <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 mt-8 md:mt-12 pt-6 md:pt-8 border-t border-slate-800">
            <Button 
              variant="outline" 
              onClick={handlePreviousSection} 
              disabled={currentSection === 1} 
              className="border-slate-700 text-slate-300 w-full sm:w-auto"
            >
              ← Previous
            </Button>

            {currentSection < sections.length ? (
              <Button onClick={handleNextSection} className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 md:px-8 w-full sm:w-auto">
                Continue <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4 ml-1 md:ml-2" />
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit} 
                disabled={submitting || !isSection5Valid} 
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 md:px-10 w-full sm:w-auto"
              >
                {submitting ? "Submitting..." : "Submit Executive Protocol"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
