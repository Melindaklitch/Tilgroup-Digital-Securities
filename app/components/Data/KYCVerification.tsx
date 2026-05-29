// components/Data/KYCVerification.tsx
"use client";

import { useState, useEffect } from "react";
import usePlatformState from "@/app/platform/hooks/usePlatformState";
import MockKYC from "./KYC/MockKYC";
import RealKYC from "./KYC/RealKYC";
import { Shield, AlertTriangle, CheckCircle2 } from "lucide-react";

interface KYCVerificationProps {
  userId: string;
  onComplete: (status: 'verified' | 'failed' | 'pending') => void;
  testMode?: boolean;
}

export default function KYCVerification({ 
  userId, 
  onComplete,
  testMode = true 
}: KYCVerificationProps) {
  const platform = usePlatformState();
  const legal = platform.legal;
  const [mode] = useState<'mock' | 'real'>(testMode ? 'mock' : 'real');

  // If the database says they are already legal, tell the parent component immediately
  useEffect(() => {
    if (legal) {
      onComplete('verified');
    }
  }, [legal, onComplete]);

  // Guard Clause: If already verified, don't show the form at all
  if (legal) {
    return (
      <div className="min-h-[400px] flex items-center justify-center px-4 py-8 md:py-12">
        <div className="max-w-md w-full text-center">
          <div className="bg-emerald-900/20 border border-emerald-500/50 rounded-2xl p-6 md:p-8 space-y-3 backdrop-blur-sm">
            <div className="flex justify-center">
              <div className="bg-emerald-500/20 p-3 rounded-full">
                <CheckCircle2 className="h-8 w-8 md:h-10 md:w-10 text-emerald-400" />
              </div>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white">
              ✅ Identity Verified
            </h2>
            <p className="text-emerald-400 text-sm md:text-base">
              Your legal status is active. Redirecting to platform...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#071526] to-[#0a1f3a] py-8 md:py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
        
        {/* Header Section */}
        <div className="text-center space-y-2 md:space-y-3">
          <div className="flex justify-center">
            <div className="bg-gradient-to-br from-cyan-900 to-emerald-900 p-2.5 md:p-3 rounded-xl border border-cyan-500/30">
              <Shield className="h-6 w-6 md:h-8 md:w-8 text-cyan-400" />
            </div>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            Identity Verification
          </h1>
          <p className="text-gray-400 text-xs md:text-sm">
            {mode === 'mock' 
              ? "Development Mode: Mock KYC Verification"
              : "Production Mode: Real Identity Verification"}
          </p>
        </div>
        
        {/* Mode Warning Banner */}
        {mode === 'mock' && (
          <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-lg md:rounded-xl p-3 md:p-4 backdrop-blur-sm">
            <div className="flex items-start gap-2 md:gap-3">
              <AlertTriangle className="h-4 w-4 md:h-5 md:w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-yellow-200 text-xs md:text-sm font-medium">
                  <strong>Development Mode:</strong> Mock verification. All submissions auto-approve.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* KYC Content Card */}
        <div className="bg-gradient-to-b from-[#0a1f2f]/95 to-[#071526]/95 backdrop-blur-xl rounded-2xl border border-gray-800/50 shadow-2xl overflow-hidden">
          {mode === 'mock' ? (
            <MockKYC userId={userId} onComplete={onComplete} />
          ) : (
            <RealKYC userId={userId} onComplete={onComplete} />
          )}
        </div>
        
        {/* Footer Note */}
        <div className="text-center pt-4">
          <p className="text-[10px] md:text-xs text-gray-500">
            Your information is encrypted and secure. Compliance with international regulations.
          </p>
        </div>
      </div>
    </div>
  );
}
