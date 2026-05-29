"use client";
import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, AlertCircle, Loader2, Wallet, TrendingUp, CheckCircle2, ArrowRight } from 'lucide-react';
import { getUSDCBalance } from '../utils/balanceSource';
import usePlatformState from "@/app/platform/hooks/usePlatformState";
import { supabase } from '../../components/Lib/supabaseClient';

interface WalletVerificationGateProps {
  children?: React.ReactNode;
  publicKey: any;
  userId: string;
  onVerified: () => void;
  minimumBalance?: number;
}

export const WalletVerificationGate = ({
  children,
  publicKey,
  userId,
  onVerified,
  minimumBalance = 7000
}: WalletVerificationGateProps) => {
  const [verified, setVerified] = useState(false);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const hasVerified = useRef(false);

  const formattedThreshold = minimumBalance.toLocaleString();
  const progressPercentage = Math.min((balance / minimumBalance) * 100, 100);

  useEffect(() => {
    const checkBalance = async () => {
      if (!publicKey || !userId) {
        setLoading(false);
        return;
      }
      if (hasVerified.current) return;

      setLoading(true);
      try {
        const bal = await getUSDCBalance(publicKey);
        setBalance(bal);
        const isVerified = bal >= minimumBalance;
        setVerified(isVerified);

        if (isVerified && !hasVerified.current) {
          hasVerified.current = true;
          // Persist to database
          const { error } = await supabase
            .from('user_onboarding_state')
            .upsert({
              user_id: userId,
              pof_verified: true,
              updated_at: new Date().toISOString(),
            }, { onConflict: 'user_id' });

          if (error) {
            console.error('[POF] Failed to save verification:', error);
          } else {
            console.log('[POF] Verified and persisted for user:', userId);
            if (onVerified) onVerified();
          }
        }
      } catch (error) {
        console.error('Failed to check balance:', error);
      } finally {
        setLoading(false);
      }
    };

    checkBalance();
  }, [publicKey, userId, minimumBalance]); // onVerified removed from deps

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center px-4 py-8 bg-gradient-to-br from-[#0a1f2f] via-[#071526] to-[#0a1f2f]">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="relative flex justify-center">
            <div className="absolute inset-0 rounded-full bg-cyan-500/20 animate-ping"></div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-900 to-emerald-900 border border-cyan-500/30 relative">
              <Loader2 className="h-8 w-8 md:h-10 md:w-10 text-cyan-400 animate-spin" />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-slate-300 text-sm md:text-base">Verifying wallet balance...</p>
            <p className="text-slate-500 text-xs md:text-sm">Verifying wallet balance...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!verified) {
    return (
      <div className="min-h-[500px] flex items-center justify-center px-4 py-8 bg-gradient-to-br from-[#0a1f2f] via-[#071526] to-[#0a1f2f]">
        <div className="max-w-2xl w-full space-y-5">
          {/* Main Card */}
          <div className="rounded-2xl bg-gradient-to-b from-[#0a1f2f]/95 to-[#071526]/95 backdrop-blur-xl border border-amber-500/30 shadow-2xl p-6 md:p-8 space-y-6">
            {/* Header Icon */}
            <div className="flex justify-center">
              <div className="p-3 md:p-4 rounded-xl bg-gradient-to-br from-amber-900 to-orange-900 border border-amber-500/30">
                <ShieldCheck className="h-8 w-8 md:h-10 md:w-10 text-amber-400" />
              </div>
            </div>

            {/* Title & Description */}
            <div className="text-center space-y-2">
              <h2 className="text-xl md:text-2xl font-bold text-white">
                🏛 TILGroup Institutional Verification
              </h2>
              <p className="text-slate-300 text-xs md:text-sm">
                Minimum ${minimumBalance.toLocaleString()} stablecoin balance required for institutional access
              </p>
            </div>

            {/* Balance Card */}
            <div className="bg-slate-900/50 p-4 md:p-5 rounded-xl border border-slate-700/30 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 md:h-5 md:w-5 text-slate-400" />
                  <span className="text-slate-400 text-xs md:text-sm">Current Balance</span>
                </div>
                <span className={`text-2xl md:text-3xl font-bold ${balance >= minimumBalance ? 'text-emerald-400' : 'text-amber-400'}`}>
                  ${balance.toLocaleString()} USDC
                </span>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Progress</span>
                  <span>{Math.round(progressPercentage)}%</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-700 rounded-full"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>

              {/* Requirement Note */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-slate-500 text-[10px] md:text-xs">Required: ${minimumBalance.toLocaleString()}</span>
                <span className="text-slate-500 text-[10px] md:text-xs">
                  {balance >= minimumBalance ? "Qualified" : "Shortfall"}
                </span>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-amber-900/20 p-3 md:p-4 rounded-xl border border-amber-500/20">
              <div className="flex items-start gap-2 md:gap-3">
                <AlertCircle className="h-4 w-4 md:h-5 md:w-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-amber-400 font-semibold text-xs md:text-sm">How to qualify:</p>
                  <p className="text-slate-300 text-[11px] md:text-xs leading-relaxed">
                    Institutional verification ensures compliance with accredited investor requirements. Please fund your wallet to continue.
                  </p>
                </div>
              </div>
            </div>

            {/* Required Amount Highlight */}
            <div className="text-center pt-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-cyan-500/10 rounded-full border border-cyan-500/20">
                <TrendingUp className="h-3.5 w-3.5 md:h-4 md:w-4 text-cyan-400" />
                <span className="text-cyan-400 text-xs md:text-sm font-medium">
                  Required Balance:
                </span>
                <span className="text-white text-xs md:text-sm font-bold">
                  ${minimumBalance.toLocaleString()} USDC
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Verified state - render children
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1f2f] via-[#071526] to-[#0a1f2f]">
      {/* Success Toast / Banner */}
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-top duration-500">
        <div className="bg-emerald-900/90 backdrop-blur-sm border border-emerald-500/30 rounded-full px-4 py-2 md:px-6 md:py-3 shadow-xl">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-emerald-400" />
            <span className="text-emerald-300 text-xs md:text-sm font-medium">
              ✅ Verified: Institutional Access Granted
            </span>
            <ArrowRight className="h-3 w-3 md:h-4 md:w-4 text-emerald-400" />
          </div>
        </div>
      </div>
      {children}
    </div>
  );
};
