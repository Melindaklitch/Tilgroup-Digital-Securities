import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Loader2, Wallet, Clock, ShieldCheck, AlertCircle, CheckCircle2, Hourglass } from 'lucide-react';

interface LoadingStatesProps {
  type: string;
}

export default function LoadingStates({ type }: LoadingStatesProps) {

  switch(type) {
    case 'initial-loading':
      return (
        <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-br from-[#0a1f2f] via-[#071526] to-[#0a1f2f]">
          <div className="text-center space-y-3 md:space-y-4">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-cyan-500/20 animate-ping"></div>
              <Loader2 className="h-10 w-10 md:h-12 md:w-12 animate-spin text-cyan-400 mx-auto relative" />
            </div>
            <p className="text-slate-300 text-sm md:text-base">Loading...</p>
          </div>
        </div>
      );
    
    case 'wallet-connection':
      return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 bg-gradient-to-br from-[#0a1f2f] via-[#071526] to-[#0a1f2f]">
          <div className="max-w-md w-full text-center space-y-5">
            <div className="flex justify-center">
              <div className="p-3 md:p-4 rounded-xl bg-gradient-to-br from-cyan-900 to-emerald-900 border border-cyan-500/30">
                <Wallet className="h-8 w-8 md:h-10 md:w-10 text-cyan-400" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-xl md:text-2xl font-bold text-white">
                Connect Wallet
              </h1>
              <p className="text-slate-400 text-xs md:text-sm">
                Please connect your wallet to continue
              </p>
            </div>
            
            <div className="bg-slate-900/30 p-3 md:p-4 rounded-xl border border-slate-700/30">
              <WalletMultiButton />
            </div>
            
            <div className="flex items-center justify-center gap-2 text-slate-500 text-[10px] md:text-xs">
              <ShieldCheck className="h-3 w-3" />
              <p>Make sure your wallet is set to Solana network.</p>
            </div>
          </div>
        </div>
      );
    
    case 'questionnaire-loading':
      return (
        <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-br from-[#0a1f2f] via-[#071526] to-[#0a1f2f]">
          <div className="text-center space-y-3 md:space-y-4">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-cyan-500/20 animate-ping"></div>
              <Loader2 className="h-10 w-10 md:h-12 md:w-12 animate-spin text-cyan-400 mx-auto relative" />
            </div>
            <p className="text-slate-300 text-sm md:text-base">Loading your investment profile...</p>
            <p className="text-slate-500 text-xs md:text-sm">Preparing your executive protocol...</p>
          </div>
        </div>
      );
    
    case 'questionnaire-pending':
      return (
        <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-br from-[#0a1f2f] via-[#071526] to-[#0a1f2f]">
          <div className="max-w-md w-full text-center space-y-5">
            <div className="flex justify-center">
              <div className="p-3 md:p-4 rounded-xl bg-gradient-to-br from-amber-900 to-orange-900 border border-amber-500/30">
                <Hourglass className="h-8 w-8 md:h-10 md:w-10 text-amber-400 animate-pulse" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-xl md:text-2xl font-bold text-white">Protocol Processing</h1>
              <p className="text-slate-300 text-xs md:text-sm">Your submission is under review</p>
            </div>
            
            <div className="flex items-center justify-center gap-2 text-amber-400 text-[10px] md:text-xs">
              <Clock className="h-3 w-3 animate-pulse" />
              <p>Estimated wait: 5-15 minutes</p>
            </div>
          </div>
        </div>
      );
    
    case 'kyc-checking':
      return (
        <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-br from-[#0a1f2f] via-[#071526] to-[#0a1f2f]">
          <div className="text-center space-y-3 md:space-y-4">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-cyan-500/20 animate-ping"></div>
              <ShieldCheck className="h-10 w-10 md:h-12 md:w-12 animate-spin text-cyan-400 mx-auto relative" />
            </div>
            <p className="text-slate-300 text-sm md:text-base">Checking verification status...</p>
            <p className="text-slate-500 text-xs md:text-sm">Verifying your identity status...</p>
          </div>
        </div>
      );
    
    case 'generic-loading':
      return (
        <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-br from-[#0a1f2f] via-[#071526] to-[#0a1f2f]">
          <div className="text-center space-y-3 md:space-y-4">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-cyan-500/20 animate-ping"></div>
              <Loader2 className="h-10 w-10 md:h-12 md:w-12 animate-spin text-cyan-400 mx-auto relative" />
            </div>
            <p className="text-slate-300 text-sm md:text-base">Loading...</p>
          </div>
        </div>
      );
    
    case 'processing-transaction':
      return (
        <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-br from-[#0a1f2f] via-[#071526] to-[#0a1f2f]">
          <div className="max-w-md w-full text-center space-y-5">
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping"></div>
                <div className="p-3 md:p-4 rounded-xl bg-gradient-to-br from-emerald-900 to-cyan-900 border border-emerald-500/30 relative">
                  <Loader2 className="h-8 w-8 md:h-10 md:w-10 animate-spin text-emerald-400" />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-xl md:text-2xl font-bold text-white">Processing Transaction</h1>
              <p className="text-slate-300 text-xs md:text-sm">Please confirm the transaction in your wallet</p>
            </div>
            
            <div className="flex items-center justify-center gap-2 text-emerald-400 text-[10px] md:text-xs">
              <CheckCircle2 className="h-3 w-3" />
              <p>Do not close this window</p>
            </div>
          </div>
        </div>
      );
    
    default:
      return (
        <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-br from-[#0a1f2f] via-[#071526] to-[#0a1f2f]">
          <div className="text-center space-y-3 md:space-y-4">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-cyan-500/20 animate-ping"></div>
              <Loader2 className="h-10 w-10 md:h-12 md:w-12 animate-spin text-cyan-400 mx-auto relative" />
            </div>
            <p className="text-slate-300 text-sm md:text-base">Loading...</p>
          </div>
        </div>
      );
  }
}
