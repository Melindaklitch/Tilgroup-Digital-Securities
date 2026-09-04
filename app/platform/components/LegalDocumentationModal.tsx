'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/app/components/Lib/supabaseClient';
import { 
  X, FileText, CheckCircle2, AlertCircle, 
  Shield, BookOpen, ExternalLink, Clock,
  ChevronRight, Lock, Scale, Globe
} from 'lucide-react';

interface LegalDocumentationModalProps {
  isOpen: boolean;
  onClose: () => void;
  legalAcknowledged: boolean;
  setLegalAcknowledged: (value: boolean) => void;
  setUserLegalCompliant: (value: boolean) => void;
  session: any;
}

interface LegalDocument {
  title: string;
  description: string;
  badge: string;
  badgeColor: string;
  pages: string;
  filePath: string;
}

export default function LegalDocumentationModal({
  isOpen,
  onClose,
  legalAcknowledged,
  setLegalAcknowledged,
  setUserLegalCompliant,
  session,
}: LegalDocumentationModalProps) {
  
  if (!isOpen) return null;

  const documents: LegalDocument[] = [
    {
      title: "Fractional Ownership Agreement",
      description: "Legal contract for Can Gio Port infrastructure ownership",
      badge: "PDF",
      badgeColor: "bg-gradient-to-r from-cyan-500 to-blue-500",
      pages: "18 pages",
      filePath: "/legal/documents/fractional-ownership-agreement.pdf"
    },
    {
      title: "Investment Risk Disclosure",
      description: "Comprehensive risk assessment for port infrastructure",
      badge: "PDF",
      badgeColor: "bg-gradient-to-r from-emerald-500 to-teal-500",
      pages: "24 pages",
      filePath: "/legal/documents/risk-disclosure.pdf"
    },
    {
      title: "Vietnamese Regulatory Compliance",
      description: "SEC Vietnam registration and compliance documents",
      badge: "PDF",
      badgeColor: "bg-gradient-to-r from-purple-500 to-pink-500",
      pages: "32 pages",
      filePath: "/legal/documents/vietnamese-compliance.pdf"
    }
  ];

  const acknowledgmentPoints = [
    "I have reviewed all required legal documents for this investment",
    "I understand this represents fractional ownership in physical infrastructure",
    "I confirm I meet accredited investor requirements per Vietnamese law",
    "I accept the risks associated with port infrastructure investments",
    "I authorize TIL Group Vietnam to process my investment"
  ];

const handleAcknowledge = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const checked = e.target.checked;
  
  if (checked && session?.user?.id) {
    try {
      // All 10 required legal documents
      const requiredDocs = [
        'concession-agreement',
        'legal-opinion',
        'revenue-projections',
        'construction-timelines',
        'management-team',
        'technical-architecture',
        'environmental-assessment',
        'market-analysis',
        'financial-audits',
        'regulatory-compliance'
      ];
      
      // Insert acknowledgment for each document
      for (const docType of requiredDocs) {
        const { error: ackError } = await supabase
          .from('legal_acknowledgements')
          .upsert({
            user_id: session.user.id,
            document_type: docType,
            acknowledged: true,
            acknowledged_at: new Date().toISOString(),
            user_agent: navigator.userAgent,
          }, {
            onConflict: 'user_id,document_type'
          });
        
        if (ackError) {
          console.error(`Error saving ${docType}:`, ackError);
          alert("Failed to save legal acknowledgment. Please try again.");
          return;
        }
      }

      // Update legal status to fully compliant
      const { error: legalError } = await supabase
        .from('user_legal_status')
        .upsert({
          user_id: session.user.id,
          fully_compliant: true,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (legalError) throw legalError;

      setLegalAcknowledged(true);
      if (setUserLegalCompliant) setUserLegalCompliant(true);
      
      console.log('[LegalModal] All 10 documents acknowledged');
      
    } catch (err) {
      console.error('Failed to save legal acknowledgement:', err);
      alert("Failed to save acknowledgment. Please try again.");
    }
  } else {
    setLegalAcknowledged(false);
    if (setUserLegalCompliant) setUserLegalCompliant(false);
  }
};

  const handleConfirm = () => {
    if (legalAcknowledged) {
      onClose();
      alert("✅ Legal compliance confirmed. You may proceed with investments.");
    }
  };

  const getBadgeStyles = (badgeColor: string) => {
    const styles: Record<string, string> = {
      'bg-gradient-to-r from-cyan-500 to-blue-500': 'bg-gradient-to-r from-cyan-500 to-blue-500',
      'bg-gradient-to-r from-emerald-500 to-teal-500': 'bg-gradient-to-r from-emerald-500 to-teal-500',
      'bg-gradient-to-r from-purple-500 to-pink-500': 'bg-gradient-to-r from-purple-500 to-pink-500',
    };
    return styles[badgeColor] || 'bg-gradient-to-r from-cyan-500 to-blue-500';
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-3 md:p-4">
      <div className="bg-gradient-to-b from-[#0f2a3f] to-[#071526] rounded-2xl max-w-3xl w-full max-h-[95vh] md:max-h-[90vh] overflow-y-auto border border-cyan-500/20 shadow-2xl">
        
        {/* Sticky Header */}
        <div className="sticky top-0 bg-gradient-to-b from-[#0f2a3f] to-[#0f2a3f]/95 backdrop-blur-sm p-4 md:p-6 border-b border-slate-700/50 z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg md:text-2xl font-bold text-white">Legal Documentation Requirements</h3>
                <p className="text-slate-400 text-xs md:text-sm">Can Gio Port Infrastructure Investment</p>
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
          
          {/* Required Documents Section */}
          <div>
            <div className="flex items-center gap-2 mb-3 md:mb-4">
              <BookOpen className="h-4 w-4 md:h-5 md:w-5 text-cyan-400" />
              <h4 className="text-base md:text-lg font-semibold text-white">Required Investment Documents</h4>
            </div>
            
            <div className="space-y-3 md:space-y-4">
              {documents.map((doc, idx) => (
                <div 
                  key={idx} 
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 md:p-4 bg-slate-900/30 rounded-xl border border-slate-700/30 hover:border-cyan-500/30 transition-all duration-300"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 md:w-12 md:h-12 ${getBadgeStyles(doc.badgeColor)} rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg`}>
                      <FileText className="h-5 w-5 md:h-6 md:w-6 text-white" />
                    </div>
                    <div>
                      <h5 className="font-semibold text-white text-sm md:text-base">{doc.title}</h5>
                      <p className="text-slate-400 text-xs md:text-sm mt-0.5">{doc.description}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5">
                        <span className={`text-[10px] md:text-xs px-1.5 py-0.5 md:px-2 md:py-1 rounded-full font-medium bg-cyan-500/20 text-cyan-400`}>
                          {doc.badge}
                        </span>
                        <span className="text-[10px] md:text-xs bg-slate-800 text-slate-300 px-1.5 py-0.5 md:px-2 md:py-1 rounded-full">
                          {doc.pages}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 hover:text-cyan-300 w-full sm:w-auto"
                    onClick={() => window.open(doc.filePath, "_blank")}
                  >
                    <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                    Review Document
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Legal Acknowledgment Section */}
          <div className="bg-gradient-to-br from-slate-900/50 to-[#062b32]/50 p-4 md:p-5 rounded-xl border border-cyan-500/20">
            <div className="flex items-center gap-2 mb-3">
              <Scale className="h-4 w-4 md:h-5 md:w-5 text-cyan-400" />
              <h4 className="font-semibold text-white text-sm md:text-base">Legal Acknowledgment & Agreement</h4>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start gap-3">
              <input
                type="checkbox"
                id="legal-acknowledge"
                className="w-4 h-4 md:w-5 md:h-5 mt-1 accent-cyan-500 cursor-pointer"
                checked={legalAcknowledged}
                onChange={handleAcknowledge}
              />
              <div className="flex-1">
                <label htmlFor="legal-acknowledge" className="font-medium text-white text-sm md:text-base cursor-pointer">
                  I acknowledge and agree to the following:
                </label>
                <div className="mt-2 space-y-1.5">
                  {acknowledgmentPoints.map((point, idx) => (
                    <div key={idx} className="flex items-start gap-1.5">
                      <CheckCircle2 className="h-3 w-3 md:h-3.5 md:w-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-400 text-[11px] md:text-xs">{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800/50 hover:text-white"
              onClick={onClose}
            >
              Review Later
            </Button>
            <Button
              className={`flex-1 bg-gradient-to-r from-cyan-600 to-emerald-600 text-white transition-all duration-200 ${
                !legalAcknowledged ? 'opacity-50 cursor-not-allowed' : 'hover:from-cyan-700 hover:to-emerald-700'
              }`}
              disabled={!legalAcknowledged}
              onClick={handleConfirm}
            >
              <Lock className="h-4 w-4 mr-2" />
              Confirm Legal Compliance
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>

          {/* Regulatory Disclaimer */}
          <div className="bg-amber-900/20 p-3 md:p-4 rounded-xl border border-amber-500/20">
            <div className="flex items-start gap-2 md:gap-3">
              <AlertCircle className="h-4 w-4 md:h-5 md:w-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-400 text-xs md:text-sm mb-1">Regulatory Notice:</p>
                <p className="text-slate-400 text-[10px] md:text-xs leading-relaxed">
                  This investment offering complies with Vietnamese securities regulations for accredited investors. TIL Group Vietnam operates under license from the Vietnamese Ministry of Transport. All investments are subject to Vietnamese law and regulatory oversight. Past performance does not guarantee future results.
                </p>
              </div>
            </div>
          </div>

          {/* Security Note */}
          <div className="flex items-center justify-center gap-2 pt-2">
            <Globe className="h-3 w-3 text-slate-500" />
            <p className="text-[10px] text-slate-500 text-center">
              All documents are encrypted and securely stored
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
