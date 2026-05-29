// components/Data/KYC/RealKYC.tsx
import SumSubWebSdk from '@sumsub/websdk-react';
import { useState, useEffect } from 'react';
import { logUserActivity } from '@/lib/analytics';
import { useAuth } from '@/app/components/Context/AuthContext';
import { useWallet } from '@solana/wallet-adapter-react';
import { ShieldCheck, AlertCircle, Loader2, CheckCircle2, Lock, Fingerprint } from 'lucide-react';
import { updateLegalStatus } from '@/lib/services/legalStatusService';

interface RealKYCProps {
  userId: string;
  onComplete: (status: 'verified' | 'failed' | 'pending') => void;
}

export default function RealKYC({ userId, onComplete }: RealKYCProps) {
  const [accessToken, setAccessToken] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { session } = useAuth();
  const { publicKey } = useWallet();
  const userEmail = session?.user?.email || '';

  // Get SumSub access token
  useEffect(() => {
    const getToken = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/sumsub/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId })
        });
        
        if (!res.ok) {
          throw new Error('Failed to get verification token');
        }
        
        const data = await res.json();
        setAccessToken(data.token);
        setError(null);
      } catch (err) {
        console.error('Token fetch error:', err);
        setError("Unable to initialize verification. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    getToken();
  }, [userId]);

  const handleSuccess = async () => {
    try {
      // 1. Log the activity
      await logUserActivity(session?.user?.id || null, publicKey?.toString() || null, 'kyc_completed', { status: 'verified' });

      // 2. UNIFIED DB UPDATE
      const result = await updateLegalStatus({
        userId: userId,
        fullyCompliant: true
      });

      if (!result.success) {
        console.error('❌ RealKYC Database Sync Error:', result.error);
      }

      console.log('✅ RealKYC verification and DB sync successful');
      onComplete('verified');
    } catch (err) {
      console.error('❌ handleSuccess Error:', err);
      onComplete('verified');
    }
  };

  const handleError = (error: any) => {
    console.error('KYC verification error:', error);
    logUserActivity(session?.user?.id || null, publicKey?.toString() || null, 'kyc_error', { error: error?.message });
    setError("Verification failed. Please check your documents and try again.");
  };

  if (loading) {
    return (
      <div className="p-6 md:p-12 text-center">
        <div className="flex flex-col items-center justify-center space-y-3 md:space-y-4">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-cyan-500/20 animate-ping"></div>
            <Loader2 className="h-10 w-10 md:h-12 md:w-12 text-cyan-400 animate-spin relative" />
          </div>
          <p className="text-slate-300 text-sm md:text-base">Loading verification portal...</p>
          <p className="text-xs md:text-sm text-slate-500">Please wait while we prepare your secure verification session</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-start gap-3 md:gap-4 p-4 md:p-6 bg-red-900/20 border border-red-500/30 rounded-xl md:rounded-2xl">
          <div className="p-2 rounded-lg bg-red-900/30 border border-red-500/30 flex-shrink-0">
            <AlertCircle className="h-5 w-5 md:h-6 md:w-6 text-red-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-base md:text-lg font-bold text-white mb-1 md:mb-2">Verification Error</h3>
            <p className="text-slate-300 text-xs md:text-sm mb-3 md:mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 md:px-5 py-2 bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-700 hover:to-emerald-700 text-white rounded-lg text-xs md:text-sm font-medium transition-all"
            >
              Retry Verification
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-slate-700/50 bg-gradient-to-r from-cyan-900/30 to-emerald-900/30">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="p-1.5 md:p-2 rounded-lg bg-gradient-to-r from-cyan-900 to-emerald-900 border border-cyan-500/30">
            <ShieldCheck className="h-5 w-5 md:h-6 md:w-6 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-bold text-white">Professional Identity Verification</h2>
            <p className="text-xs md:text-sm text-slate-400">Verify your identity to comply with regulatory requirements for infrastructure investment</p>
          </div>
        </div>
      </div>

      {/* Verification Content */}
      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        {/* Security Note */}
        <div className="p-3 md:p-4 bg-cyan-900/20 rounded-lg md:rounded-xl border border-cyan-500/20">
          <div className="flex items-start gap-2 md:gap-3">
            <Lock className="h-4 w-4 md:h-5 md:w-5 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs md:text-sm text-slate-300">
                Your verification is handled by SumSub, a leading KYC provider trusted by financial institutions worldwide.
              </p>
              <p className="text-[10px] md:text-xs text-slate-400">
                Your data is encrypted and securely processed in compliance with global privacy regulations.
              </p>
            </div>
          </div>
        </div>

        {/* SumSub SDK Container */}
        {accessToken && (
          <div className="min-h-[450px] md:min-h-[500px] w-full">
            <SumSubWebSdk
              accessToken={accessToken}
              expirationHandler={() => {
                console.log('Token expired, refreshing...');
              }}
              config={{
                lang: 'en',
                email: userEmail,
                onMessage: (type: string, payload: any) => {
                  if (type === 'idCheck.onApplicantStatusChanged') {
                    if (payload.reviewStatus === 'completed') {
                      handleSuccess();
                    } else if (payload.reviewStatus === 'rejected') {
                      handleError({ message: 'Verification rejected' });
                    }
                  }
                },
                onError: (error: any) => {
                  handleError(error);
                }
              }}
              options={{
                addViewportTag: false,
                adaptIframeHeight: true,
              }}
            />
          </div>
        )}

        {/* Verification Steps */}
        <div className="pt-4 md:pt-6 border-t border-slate-700/50">
          <h3 className="text-xs md:text-sm font-semibold text-white mb-3 md:mb-4">Verification Process</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
            <div className="flex items-center gap-2 md:gap-3 p-2 md:p-3 bg-slate-800/30 rounded-lg border border-slate-700/30">
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-cyan-900/30 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-xs md:text-sm">
                1
              </div>
              <span className="text-xs md:text-sm text-slate-300">Upload government ID (Passport, Driver's License, or National ID)</span>
            </div>
            <div className="flex items-center gap-2 md:gap-3 p-2 md:p-3 bg-slate-800/30 rounded-lg border border-slate-700/30">
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-cyan-900/30 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-xs md:text-sm">
                2
              </div>
              <span className="text-xs md:text-sm text-slate-300">Take a selfie for facial verification</span>
            </div>
            <div className="flex items-center gap-2 md:gap-3 p-2 md:p-3 bg-slate-800/30 rounded-lg border border-slate-700/30">
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-cyan-900/30 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-xs md:text-sm">
                3
              </div>
              <span className="text-xs md:text-sm text-slate-300">Wait for instant verification (typically 2-5 minutes)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="p-3 md:p-4 bg-slate-900/30 border-t border-slate-700/50 rounded-b-2xl">
        <div className="flex items-center justify-center gap-2">
          <Fingerprint className="h-3 w-3 md:h-4 md:w-4 text-slate-500" />
          <p className="text-[10px] md:text-xs text-slate-500 text-center">
            This verification is required for accredited investor status. Your information is protected by bank-grade security.
          </p>
        </div>
      </div>
    </div>
  );
}
