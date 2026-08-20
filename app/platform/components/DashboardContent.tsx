'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import AssetDetailModal from './AssetDetailModal';
import { ASSETS_JSON } from '../utils/constants';
import { PublicKey } from '@solana/web3.js';
import { useAuth } from '@/app/components/Context/AuthContext';
import usePlatformState from '../hooks/usePlatformState';
import { logUserActivity } from '@/lib/analytics';
import { supabase } from '@/app/components/Lib/supabaseClient';
import { useAccessMatrix } from '../hooks/useAccessMatrix';
import { useLegalState } from '../hooks/legal/useLegalState';
import { LegalDocumentsSection } from '@/app/components/Legal/document';
import ExecutiveProtocolCard from './ExecutiveProtocolCard';
import InvestmentEligibilityModal from './InvestmentEligibilityModal';
import AssetGrid from './AssetGrid';
import DocumentViewerModal from './DocumentViewerModal';
import { isValidDocumentType } from '@/lib/documentMapping';
import ContactForm from './ContactForm';
import { LogOut, Wallet, TrendingUp, TrendingDown, CheckCircle2, AlertCircle, X, Loader2 } from 'lucide-react';

const VIEWABLE_DOCUMENT_IDS = new Set([
  'port_concession_agreement',
  'investment-registration-certificate',
  'vietnamese_regulatory_compliance',
  'legal-opinion-ownership-structure',
  'financial_audits_historical',
  'revenue-projections-modeling',
  'schedule-4-epc-contract',
]);

interface DashboardContentProps {
  platformState?: any;
}

const getAssetName = (key: string): string => {
  console.log("🔍 getAssetName received:", key);
  
  if (!key) return "Unknown Asset";
  
  let cleanKey = key;
  
  if (cleanKey.startsWith('assets.')) {
    cleanKey = cleanKey.replace('assets.', '');
  }
  
  if (cleanKey.endsWith('.name')) {
    cleanKey = cleanKey.replace('.name', '');
  }
  
  const nameMap: Record<string, string> = {
    portConcessions: "Port Concession Rights",
    dockingFees: "Docking & Berthing Fees",
    containerHandling: "Container Handling Rights",
    logisticsInfrastructure: "Logistics Infrastructure",
    straitPassageRights: "Strait Passage Rights",
    tilTerminalx: "TIL Terminal X Digital Infrastructure"
  };
  
  const result = nameMap[cleanKey] || key;
    console.log(`🔍 Mapping "${key}" → "${result}"`);
    return result;
  };

export default function DashboardContent({ platformState: propsPlatformState }: DashboardContentProps) {
  const router = useRouter();
  const { session, user } = useAuth();

  const legal = useLegalState(session?.user?.id);
  const [showLegalDocModal, setShowLegalDocModal] = useState(false);
  const [selectedLegalDoc, setSelectedLegalDoc] = useState<any>(null);
  const matrix = useAccessMatrix(session?.user?.id);

  const hookPlatform = usePlatformState();
  const platform = propsPlatformState || hookPlatform;
  const walletAddress = platform?.walletAddress ?? null;

  const {
    solBalance,
    usdcBalance,
    showLegalRequirements,
    userLegalCompliant,
    legalAcknowledged,
    showLegalModal,
    questionnaireCompleted,
    showModal,
    showAssetDetail,
    selectedAssetDetail,
    showPurchaseToast,
    latestPurchase,
    selectedAsset,
    calculateCurrentValue,
    translateAssetName,
    handleShowAssetDetails,
    handleSellAsset,
    requireLegal,
  } = platform;

  type Purchase = {
  total_usd?: number;
  asset_name?: string;
  asset_name_key?: string;
  quantity: number;
  payment_token?: string;
  payment_history?: any[];
  latest_purchase_at?: string;
  created_at?: string;
};

const purchases = (platform.purchases || []) as Purchase[];

  const searchParams = useSearchParams();

  useEffect(() => {
    const legal = searchParams.get('legal');
    const docId = searchParams.get('doc');
    
    if (legal === 'true') {
      setTimeout(() => {
        const legalSection = document.getElementById('legal-documents-section');
        if (legalSection) {
          legalSection.scrollIntoView({ behavior: 'smooth' });
          if (docId) {
            console.log('Highlight document:', docId);
          }
        }
      }, 500);
    }
  }, [searchParams]);

  const totalSpent =
  purchases?.reduce(
    (sum: number, p: any) => sum + (p.total_usd || 0),
    0
  ) || 0;

  {console.log("🔍 selectedAsset.nameKey:", selectedAsset?.nameKey)}
  {console.log("🔍 selectedAsset full:", selectedAsset)}

  return (
      <div className="min-h-screen bg-gradient-to-b from-[#071526] to-[#0a1f2f] pt-16 md:pt-20 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-5 md:space-y-6">
        
        {/* ============================================ */}
        {/* HEADER SECTION */}
        {/* ============================================ */}
        <div className="bg-gradient-to-br from-slate-900 to-[#062b32] rounded-xl p-4 md:p-6 border border-slate-800/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-white">Presale Dashboard</h1>
              <div className="text-xs md:text-sm text-slate-300 mt-1 break-all">
                {session?.user?.email}
                {walletAddress && (
                  <>
                    {" • "}
                    <span className="text-cyan-400">{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Wallet className="h-3.5 w-3.5 md:h-4 md:w-4 text-emerald-400" />
                <span className="text-xs md:text-sm text-slate-300">
                  {(usdcBalance ?? 0).toFixed(2)} USDC
                </span>
              </div>
            </div>
            
            <Button
              onClick={async () => {
                await supabase.auth.signOut();
                router.push("/signin");
              }}
              variant="outline"
              className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300 w-full sm:w-auto"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* ============================================ */}
        {/* EXECUTIVE PROTOCOL CARD */}
        {/* ============================================ */}
        <ExecutiveProtocolCard />

        {/* ============================================ */}
        {/* QUESTIONNAIRE STATUS BANNER */}
        {/* ============================================ */}
        {!questionnaireCompleted && (
          <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-lg p-3 md:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 md:h-5 md:w-5 text-yellow-400" />
                <span className="text-yellow-300 text-xs md:text-sm">
                  Executive Protocol Required for Priority Access
                </span>
              </div>
              <Button
                size="sm"
                className="bg-yellow-600 hover:bg-yellow-700 text-white text-xs md:text-sm w-full sm:w-auto"
                onClick={() => platform.setShowQuestionnaire(true)}
              >
                Complete Protocol
              </Button>
            </div>
          </div>
        )}

        {/* ============================================ */}
        {/* INVESTMENT ELIGIBILITY MODAL */}
        {/* ============================================ */}
        <InvestmentEligibilityModal
          isOpen={showLegalRequirements}
          onClose={() => platform.setShowLegalRequirements(false)}
          userLegalCompliant={userLegalCompliant}
          onBeginVerification={() => {
            platform.setShowLegalRequirements(false);
            platform.setShowLegalModal(true);
          }}
        />

        {/* ============================================ */}
        {/* PORTFOLIO SECTION */}
        {/* ============================================ */}
        <div className="bg-gradient-to-br from-slate-900 to-[#062b32] rounded-xl border border-slate-800/50 overflow-hidden">
          <div className="p-4 md:p-6 border-b border-slate-800/50">
            <h3 className="font-semibold text-base md:text-lg text-white">My Purchased Assets</h3>
          </div>

          <div className="p-4 md:p-6">
            {purchases === undefined ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto"></div>
                <p className="text-slate-400 text-sm mt-3">Loading your purchases...</p>
              </div>
            ) : purchases.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-slate-500 text-sm">You have not purchased any presale assets yet.</div>
                <p className="text-slate-400 text-xs mt-2">Browse assets below to start your portfolio</p>
              </div>
            ) : (
              <>
                {/* Total Spent Summary */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 p-3 bg-cyan-900/20 rounded-lg border border-cyan-500/20">
                  <div className="text-sm text-slate-300">
                    Total Spent:
                    <span className="text-cyan-400 font-semibold ml-2">
                      ${totalSpent.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400">
                    {purchases.length} Assets Owned
                  </div>
                </div>

                {/* Assets Table - Responsive */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs md:text-sm">
                    <thead className="text-left text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="p-2 md:p-3">#</th>
                        <th className="p-2 md:p-3">Asset</th>
                        <th className="p-2 md:p-3">Quantity</th>
                        <th className="p-2 md:p-3">Total</th>
                        <th className="p-2 md:p-3 hidden md:table-cell">Payment Token</th>
                        <th className="p-2 md:p-3 hidden lg:table-cell">Date</th>
                        <th className="p-2 md:p-3">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {purchases.map((p: any, idx: number) => {
                        const calc = calculateCurrentValue(p);
                        const assetDisplayName = getAssetName(p.asset_name_key || p.asset_name);
                        return (
                          <tr key={idx} className="border-t border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                            <td className="p-2 md:p-3 text-slate-400">{idx + 1}</td>
                            <td className="p-2 md:p-3 font-medium text-white">
                              {assetDisplayName}
                            </td>
                            <td className="p-2 md:p-3 text-slate-300">{p.quantity}</td>
                            <td className="p-2 md:p-3">
                              <div className="font-medium text-white">{calc.displayValue}</div>
                              <div className={`flex items-center gap-0.5 text-xs ${calc.change >= 0 ? "text-green-400" : "text-red-400"}`}>
                                {calc.change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                <span>{calc.change >= 0 ? "+" : ""}{calc.change.toFixed(2)}%</span>
                              </div>
                            </td>
                            <td className="p-2 md:p-3 hidden md:table-cell">
                              <span className="text-slate-300">{p.payment_token}</span>
                              {p.payment_history && p.payment_history.length > 1 && (
                                <span className="ml-1 text-xs text-slate-500">({p.payment_history.length}x)</span>
                              )}
                            </td>
                            <td className="p-2 md:p-3 hidden lg:table-cell text-slate-400 text-xs">
                              {new Date(p.latest_purchase_at || p.created_at).toLocaleDateString()}
                            </td>
                            <td className="p-2 md:p-3">
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-red-500/50 text-red-400 hover:bg-red-500/10 text-xs"
                                onClick={() => handleSellAsset(p)}
                              >
                                Sell Asset
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ============================================ */}
        {/* ASSET GRID */}
        {/* ============================================ */}
        <AssetGrid
           assets={ASSETS_JSON}
           onAssetSelect={(asset, key) => {

        console.log("========== ASSET CLICK ==========");
        console.log("matrix.can_invest =", matrix.can_invest);
        console.log("asset =", asset);
        console.log("key =", key);

       console.log("Calling handleShowAssetDetails...");
       handleShowAssetDetails(asset, key);
      }}
       />

        {/* ============================================ */}
        {/* LEGAL DOCUMENTS SECTION */}
        {/* ============================================ */}
            <div className="bg-gradient-to-br from-slate-900 to-[#062b32] rounded-xl border border-cyan-500/20 overflow-hidden">
              <LegalDocumentsSection
                userId={session!.user!.id}
                userEmail={session?.user?.email || ""}
                userName={session?.user?.user_metadata?.firstName || ""}
                onDocumentAcknowledged={async () => {
                await matrix.refresh();
            }}
                onAcknowledged={async () => {
                platform.setLegalAcknowledged(true);
                await legal.refreshLegalStatus();
                await matrix.refresh();
                await platform.refresh?.();
            }}
                userTier={userLegalCompliant ? 'executive' : 'priority'}
                hasInvested={purchases?.length > 0}
                onViewDocument={(doc) => {
                  if (!VIEWABLE_DOCUMENT_IDS.has(doc.type)) {
                    alert("This document is available upon request. Use the \"Request Hard/Soft Copy\" button below and it will be sent to your email.");
                    return;
                }

                setSelectedLegalDoc({
                  type: doc.type,
                  title: doc.title,
                  directUrl: doc.fullUrl,
                });
                setShowLegalDocModal(true);
            }}
              />
            </div>

        {/* ============================================ */}
        {/* INVESTMENT EXECUTION MODAL */}
        {/* ============================================ */}
        {showModal && selectedAsset && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-b from-[#0f2a3f] to-[#0a1f2f] rounded-xl w-full max-w-md border border-slate-700/50 shadow-2xl">
              <div className="p-4 md:p-6 border-b border-slate-700/50">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg md:text-xl font-bold text-white">Join Presale</h2>
                  <button
                    onClick={() => platform.setShowModal(false)}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              <div className="p-4 md:p-6 space-y-4">
                <div className="space-y-2">
                  <p className="text-slate-300 text-sm">Asset: <span className="text-white font-medium">{getAssetName(selectedAsset?.nameKey)}</span></p>
                  <p className="text-slate-300 text-sm">Unit Price: <span className="text-cyan-400 font-medium">${selectedAsset?.price?.toLocaleString()}</span></p>
                </div>

                <div>
                   <input
                     type="number"
                     min="1"
                     value={selectedAsset.quantity || 1}
                     onChange={(e) =>
                     platform.setSelectedAsset({
                     ...selectedAsset,
                     quantity: Number(e.target.value) || 1,
                  })
                 }
                     className="w-full mb-4 p-3 rounded-lg bg-[#0a2f3d]/50 border border-cyan-500/30 text-white placeholder-gray-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
                    />
                </div>

                <div className="bg-slate-900/30 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm">Total:</span>
                    <span className="text-xl font-bold text-cyan-400">
                      ${((selectedAsset.quantity || 1) * selectedAsset.price).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-slate-500 text-xs">≈ USDC</span>
                    <span className="text-slate-300 text-sm">
                      {((selectedAsset.quantity || 1) * selectedAsset.price).toFixed(2)} USDC
                    </span>
                  </div>
                </div>

                <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
                  <Button 
                    variant="outline" 
                    onClick={() => platform.setShowModal(false)}
                    className="border-slate-600 text-slate-300 w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                  <Button 
                    className="bg-gradient-to-r from-cyan-600 to-emerald-600"
                    onClick={() => platform.confirmTransaction(selectedAsset, platform.selectedToken, platform.setUserHasInvested)}
                    disabled={platform.isProcessing}  // ✅ Disable while processing
                  >
                    {platform.isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                     Processing...
                  </>
                  ) : (
                    'Confirm'
                   )}
                    </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================ */}
        {/* DOCUMENT VIEWER MODAL */}
        {/* ============================================ */}
       <DocumentViewerModal
         isOpen={showLegalDocModal}
         onClose={() => setShowLegalDocModal(false)}
         documentType={selectedLegalDoc?.type}
         documentTitle={selectedLegalDoc?.title}
         userId={session!.user!.id}
         userEmail={session?.user?.email || ""}
         userName={session!.user!.user_metadata!.firstName}
         directDocumentUrl={selectedLegalDoc?.directUrl}
        />

          {/* ============================================ */}
          {/* ASSET DETAIL MODAL */}
          {/* ============================================ */}
         <AssetDetailModal
           asset={selectedAssetDetail}
           isOpen={showAssetDetail}
           onClose={() => platform.setShowAssetDetail(false)}
           onInvestNow={(asset) => platform.handleInvestFromDetails(asset, true)}
           onShowQuestionnaire={() => platform.setShowLegalModal(true)}
           userQuestionnaireCompleted={questionnaireCompleted}
           walletConnected={platform.walletConnected}
           session={platform.session}
           />

          {/* ============================================ */}
          {/* CONTACT FORM FOOTER */}
          {/* ============================================ */}
          <div className="mt-8 pt-8 border-t border-slate-800/50">
            <ContactForm />
          </div>

        </div>
      </div>
    );
  }
