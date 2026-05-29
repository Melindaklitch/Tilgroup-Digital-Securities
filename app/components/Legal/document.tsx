// components/Legal/document.tsx
import { FileText, ShieldCheck, Globe, Clock, BarChart3, TrendingUp, Cpu, Users, Download, Eye, CheckCircle2, AlertTriangle } from "lucide-react";
import { legalDocuments } from './legalDocuments';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from "../Lib/supabaseClient";

interface LegalDocumentsSectionProps {
  userId: string;
  userEmail?: string;
  userName?: string;     
  onAcknowledged: () => void;
  userTier?: 'executive' | 'accredited' | 'priority';
  hasInvested?: boolean;
  onViewDocument?: (doc: any) => void;
  onDocumentAcknowledged?: (docId: string) => void;
}

export function LegalDocumentsSection({ 
  userId, 
  onAcknowledged,
  userTier = 'accredited', 
  hasInvested = false,
  onViewDocument,
  onDocumentAcknowledged,
  userEmail,             
  userName                 
}: LegalDocumentsSectionProps) {
  const [acknowledged, setAcknowledged] = useState<{[key: string]: boolean}>({});
  const [loading, setLoading] = useState<{[key: string]: boolean}>({});
  const [allAcknowledged, setAllAcknowledged] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [selectedAsset, setSelectedAsset] = useState<string>('all');
  const [requesting, setRequesting] = useState<{[key: string]: boolean}>({});

  const frontendToBackendDocType: Record<string, string> = {
  'port_concession_agreement': 'concession-agreement',
  'legal-opinion-ownership-structure': 'legal-opinion',
  'revenue-projections-modeling': 'revenue-projections',
  'construction-development-timelines': 'construction-timelines',
  'management-team-background': 'management-team',
  'technical-architecture-engineering': 'technical-architecture',
  'environmental-social-impact': 'environmental-assessment',
  'market-analysis-competitive-landscape': 'market-analysis',
  'financial_audits_historical': 'financial-audits',
  'vietnamese_regulatory_compliance': 'regulatory-compliance'
};

  // Filter documents based on user tier
  const filteredDocuments = legalDocuments.filter(doc => 
    doc.requiredFor.includes(userTier)
  );

  const assetClasses = [
    { key: 'portConcessions', name: "Port Concessions" },
    { key: 'dockingFees', name: "Docking Fees" },
    { key: 'containerHandling', name: "Container Handling" },
    { key: 'logisticsInfrastructure', name: "Logistics Infrastructure" },
    { key: 'straitPassageRights', name: "Strait Passage Rights" },
    { key: 'tilTerminalx', name: "TIL Terminal X" }
  ];

  // Filter documents based on selected asset
  const filteredByAsset = selectedAsset === 'all' 
    ? filteredDocuments 
    : filteredDocuments.filter(doc => 
        doc.assetReferences.includes(selectedAsset) || doc.assetReferences.includes('all')
      );

  // Load existing acknowledgements
  useEffect(() => {
    const loadAcknowledgements = async () => {
      if (!userId) return;
      
      try {
        const { data, error } = await supabase
          .from('legal_acknowledgements')
          .select('document_type')
          .eq('user_id', userId)
          .eq('acknowledged', true);

        if (!error && data) {
          const acknowledgedMap: {[key: string]: boolean} = {};
          data.forEach(item => {
            acknowledgedMap[item.document_type] = true;
          });
          setAcknowledged(acknowledgedMap);
        }
      } catch (error) {
        console.error('Failed to load acknowledgements:', error);
      } finally {
        setInitialLoad(false);
      }
    };

    loadAcknowledgements();
  }, [userId]);

  // Check if all required documents are acknowledged
  useEffect(() => {
    const requiredDocuments = filteredDocuments;
    const allRequiredAcknowledged = requiredDocuments.every(doc => acknowledged[doc.id]);
    setAllAcknowledged(allRequiredAcknowledged);
    
    if (allRequiredAcknowledged) {
      onAcknowledged();
    }
  }, [acknowledged, filteredDocuments, onAcknowledged]);

  const handleAcknowledge = async (docId: string) => {
  const backendDocType = frontendToBackendDocType[docId];
  if (!backendDocType) {
    console.error(`No backend mapping for document: ${docId}`);
    alert("Document type not recognized. Please contact support.");
    return;
  }
  setLoading(prev => ({ ...prev, [docId]: true }));
  try {
    const { error } = await supabase
      .from('legal_acknowledgements')
      .upsert({
        user_id: userId,
        document_type: backendDocType,
        acknowledged: true,
        acknowledged_at: new Date().toISOString(),
        ip_address: null,
        user_agent: navigator.userAgent,
        document_version: legalDocuments.find(d => d.id === docId)?.version || '1.0'
      }, { onConflict: 'user_id,document_type' });
    if (!error) {
      setAcknowledged(prev => ({ ...prev, [docId]: true }));
   if (onDocumentAcknowledged) {
       onDocumentAcknowledged(docId);
    }

    } else {
      console.error('Database error:', error);
      alert("Failed to save acknowledgment. Please try again.");
    }
  } catch (error) {
    console.error('Failed to acknowledge document:', error);
    alert("Failed to save acknowledgment. Please try again.");
  } finally {
    setLoading(prev => ({ ...prev, [docId]: false }));
  }
};

   const handleRequestDocument = async (doc: any) => {
  if (!userId || !userEmail) {
    alert("User information missing. Please refresh and try again.");
    return;
  }
  
  setRequesting(prev => ({ ...prev, [doc.id]: true }));
  
  try {
    const res = await fetch('/api/documents/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: userId,
        userEmail: userEmail,
        userName: userName || 'Investor',
        documentType: doc.id,
        documentTitle: doc.name,
        requestedLanguage: 'en',
        requestedAt: new Date().toISOString(),
      }),
    });
    
    const data = await res.json();
    if (data.success) {
      alert(`Request for "${doc.name}" sent. You will receive the document by email.`);
    } else {
      alert(`Request failed: ${data.message || 'Please try again.'}`);
    }
  } catch (error) {
    console.error('Request error:', error);
    alert('Network error. Please try again.');
  } finally {
    setRequesting(prev => ({ ...prev, [doc.id]: false }));
  }
};

  const handleDownloadAll = () => {
    filteredDocuments.forEach(doc => {
      const link = document.createElement('a');
      link.href = hasInvested ? doc.fullUrl : doc.previewUrl;
      link.download = `${doc.name.replace(/\s+/g, '-').toLowerCase()}.pdf`;
      link.click();
    });
  };

  const getCategoryTranslation = (category: string) => {
    const categoryMap: {[key: string]: string} = {
      'Regulatory': "Regulatory",
      'Investment': "Investment",
      'Compliance': "Compliance",
      'Risk': "Risk"
    };
    return categoryMap[category] || category;
  };

  const getTierTranslation = (tier: string) => {
    const tierMap: {[key: string]: string} = {
      'executive': "Executive",
      'accredited': "Accredited",
      'priority': "Priority"
    };
    return tierMap[tier] || tier;
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl border border-cyan-500/20 backdrop-blur-sm overflow-hidden">
      
      {/* Header Section */}
      <div className="p-4 md:p-6 border-b border-slate-700/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="p-2 md:p-3 rounded-lg bg-gradient-to-r from-cyan-900 to-emerald-900 border border-cyan-500/30 flex-shrink-0">
              <FileText className="h-5 w-5 md:h-6 md:w-6 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-bold text-white">Legal & Compliance Requirements</h3>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-cyan-500 animate-pulse"></div>
                  <span className="text-xs md:text-sm text-cyan-300">$5.5B Can Gio Port Investment</span>
                </div>
                <span className="text-slate-400 text-xs">•</span>
                <div className="text-xs md:text-sm text-slate-400">
                  Tier: <span className="text-cyan-300 capitalize">{getTierTranslation(userTier)}</span>
                </div>
              </div>
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadAll}
            className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-900/30 w-full sm:w-auto"
          >
            <Download className="h-4 w-4 mr-2" />
            Download All
          </Button>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 md:p-6 space-y-5 md:space-y-6">
        
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs md:text-sm text-slate-300">
              {filteredDocuments.filter(doc => acknowledged[doc.id]).length} of {filteredDocuments.length} documents completed
            </span>
            <span className="text-xs md:text-sm font-semibold text-cyan-400">
              {Math.round((filteredDocuments.filter(doc => acknowledged[doc.id]).length / filteredDocuments.length) * 100)}%
            </span>
          </div>
          <div className="w-full h-1.5 md:h-2 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-cyan-600 to-emerald-600 transition-all duration-500 rounded-full"
              style={{ 
                width: `${(filteredDocuments.filter(doc => acknowledged[doc.id]).length / filteredDocuments.length) * 100}%` 
              }}
            ></div>
          </div>
        </div>

        {/* Asset Filter Buttons */}
        <div className="flex gap-2 flex-wrap">
          <Button
            size="sm"
            variant={selectedAsset === 'all' ? 'default' : 'outline'}
            onClick={() => setSelectedAsset('all')}
            className="text-xs md:text-sm"
          >
            All Documents
          </Button>
          {assetClasses.map(asset => (
            <Button
              key={asset.key}
              size="sm"
              variant={selectedAsset === asset.key ? 'default' : 'outline'}
              onClick={() => setSelectedAsset(asset.key)}
              className="text-xs md:text-sm"
            >
              {asset.name}
            </Button>
          ))}
        </div>

        {/* Documents List */}
        <div className="space-y-3 md:space-y-4">
          {filteredByAsset.map((doc) => {
            const Icon = doc.icon;
            const isAcknowledged = acknowledged[doc.id];
            const isLoading = loading[doc.id];
            
            return (
              <div 
                key={doc.id} 
                className={`p-3 md:p-4 rounded-lg border transition-all ${
                  isAcknowledged 
                    ? 'bg-emerald-900/10 border-emerald-500/30' 
                    : 'bg-slate-900/30 border-slate-700/50 hover:border-cyan-500/50'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 md:gap-4">
                  
                  {/* Left Content */}
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <div className={`p-1.5 md:p-2 rounded-lg flex-shrink-0 ${
                        isAcknowledged 
                          ? 'bg-emerald-900/30 text-emerald-400' 
                          : 'bg-slate-800/50 text-slate-400'
                      }`}>
                        <Icon className="h-4 w-4 md:h-5 md:w-5" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h4 className="font-semibold text-white text-sm md:text-base">{doc.name}</h4>
                          <span className="text-[10px] md:text-xs px-1.5 py-0.5 md:px-2 md:py-1 rounded bg-slate-800/50 text-slate-300">
                            {getCategoryTranslation(doc.category)}
                          </span>
                        </div>
                        
                        <p className="text-slate-400 text-xs md:text-sm mb-2 md:mb-3">{doc.description}</p>
                        
                        <div className="flex flex-wrap items-center gap-2 md:gap-4 text-[10px] md:text-xs text-slate-500">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>Effective: {doc.effectiveDate}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            <span>v{doc.version} • {hasInvested ? doc.pages.full : doc.pages.preview} pages</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-current"></div>
                            <span className="capitalize">{getTierTranslation(userTier)} Tier Required</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                {/* Right Actions */}
                <div className="flex flex-row md:flex-col items-center gap-2 md:items-end ml-11 md:ml-0">
               <Button
               variant="ghost"
               size="sm"
            onClick={() => {
             if (onViewDocument) {
             onViewDocument({
             type: doc.id,
             title: doc.name,
             url: isAcknowledged ? doc.fullUrl : doc.previewUrl,
             documentType: doc.id,
             documentTitle: doc.name
           });
          } else {
            const url = hasInvested ? doc.fullUrl : doc.previewUrl;
            window.open(url, '_blank');
          }
        }}
         className="text-slate-400 hover:text-white hover:bg-slate-800/50 text-xs md:text-sm"
        >
         <Eye className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1 md:mr-2" />
         {hasInvested ? "View Full Document" : "View Preview"}
          </Button>
  
         {/* Request Hard/Soft Copy Button */}
          <Button
    variant="ghost"
    size="sm"
    onClick={() => handleRequestDocument(doc)}
    disabled={requesting[doc.id]}
    className="text-slate-400 hover:text-white hover:bg-slate-800/50 text-xs md:text-sm"
  >
    {requesting[doc.id] ? (
      <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
    ) : (
      <>
        <Download className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1 md:mr-2" />
        Request Hard/Soft Copy
      </>
    )}
  </Button>
  
  {!isAcknowledged ? (
    <Button
      size="sm"
      onClick={() => handleAcknowledge(doc.id)}
      disabled={isLoading}
      className="bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-700 hover:to-emerald-700 text-white text-xs md:text-sm py-1.5 md:py-2"
    >
      {isLoading ? (
        <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      ) : (
        <>
          <CheckCircle2 className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1 md:mr-2" />
           Acknowledge & Accept
            </>
             )}
               </Button>
                ) : (
                <div className="flex items-center gap-1.5 md:gap-2 px-2 py-1 md:px-3 md:py-2 bg-emerald-900/20 rounded-lg border border-emerald-500/30">
                <CheckCircle2 className="h-3.5 w-3.5 md:h-4 md:w-4 text-emerald-400" />
               <span className="text-emerald-400 text-[11px] md:text-sm font-medium">Accepted</span>
              </div>
             )}
               </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Completion Status */}
        {allAcknowledged && (
          <div className="p-3 md:p-4 bg-gradient-to-r from-emerald-900 to-green-900/10 rounded-lg border border-emerald-500/30">
            <div className="flex items-center gap-3">
              <div className="p-1.5 md:p-2 rounded-full bg-emerald-900/30 flex-shrink-0">
                <CheckCircle2 className="h-5 w-5 md:h-6 md:w-6 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-sm md:text-lg font-bold text-emerald-300">Legal Compliance Complete</h4>
                <p className="text-slate-300 text-xs md:text-sm">
                  All required legal documents have been acknowledged. You are now authorized to participate in the $150M presale for the $5.5B Can Gio International Transshipment Port.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Legal Disclaimer */}
        <div className="p-3 md:p-4 bg-slate-900/30 rounded-lg border border-amber-500/20">
          <div className="flex items-start gap-2 md:gap-3">
            <AlertTriangle className="h-4 w-4 md:h-5 md:w-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <h5 className="text-amber-400 font-semibold text-xs md:text-sm mb-0.5 md:mb-1">Important Legal Notice</h5>
              <p className="text-slate-400 text-[10px] md:text-xs leading-relaxed">
                By acknowledging these documents, you confirm that you have read, understood, and agree to be bound by all terms and conditions. This investment is available only to accredited investors meeting specific financial sophistication criteria. The $150M presale represents 2.7% fractional ownership of the $5.5B Can Gio Port project. Investment involves risk, including possible loss of principal.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
