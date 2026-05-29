'use client';

import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Wallet, ShieldCheck, Zap, ArrowRight } from 'lucide-react';

export default function WalletConnection() {
  
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-br from-[#0a1f2f] via-[#071526] to-[#0a1f2f]">
      <div className="max-w-md w-full space-y-6">
        
        {/* Main Card */}
        <div className="rounded-2xl bg-gradient-to-b from-[#0a1f2f]/95 to-[#071526]/95 backdrop-blur-xl border border-gray-800/50 shadow-2xl p-6 md:p-8 space-y-6">
          
          {/* Header Icon */}
          <div className="flex justify-center">
            <div className="p-3 md:p-4 rounded-xl bg-gradient-to-br from-cyan-900 to-emerald-900 border border-cyan-500/30">
              <Wallet className="h-8 w-8 md:h-10 md:w-10 text-cyan-400" />
            </div>
          </div>
          
          {/* Title & Description */}
          <div className="text-center space-y-2">
            <h2 className="text-xl md:text-2xl font-bold text-white">
              Connect Your Wallet
            </h2>
            <p className="text-slate-400 text-xs md:text-sm">
              Sign in and connect your Solana wallet to view your presale assets.
            </p>
          </div>
          
          {/* Wallet Button Container */}
          <div className="bg-slate-900/30 p-3 md:p-4 rounded-xl border border-slate-700/30">
            <WalletMultiButton />
          </div>
          
          {/* Security Note */}
          <div className="flex items-start gap-2 p-3 md:p-4 bg-cyan-900/20 rounded-lg border border-cyan-500/20">
            <ShieldCheck className="h-4 w-4 md:h-5 md:w-5 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-cyan-400 font-semibold text-xs md:text-sm">
                Secure Connection
              </p>
              <p className="text-slate-400 text-[10px] md:text-xs mt-0.5">
                Your private keys never leave your wallet. We only request permission to view your wallet address.
              </p>
            </div>
          </div>
          
          {/* Supported Wallets */}
          <div className="pt-2 border-t border-slate-700/50">
            <div className="flex flex-wrap items-center justify-center gap-3 text-[10px] md:text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Zap className="h-3 w-3 text-cyan-400" />
                Phantom
              </span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-1">
                <Zap className="h-3 w-3 text-cyan-400" />
                Solflare
              </span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-1">
                <ArrowRight className="h-3 w-3 text-cyan-400" />
                More coming
              </span>
            </div>
          </div>
        </div>
        
        {/* Footer Note */}
        <div className="text-center">
          <p className="text-[10px] text-slate-500">
            By connecting, you agree to our Terms of Service
          </p>
        </div>
      </div>
    </div>
  );
}
