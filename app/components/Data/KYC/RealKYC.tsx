// app/components/Data/KYC/RealKYC.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/components/Context/AuthContext';
import { useWallet } from '@solana/wallet-adapter-react';
import { logUserActivity } from '@/lib/analytics';
import { updateLegalStatus } from '@/lib/services/legalStatusService';
import { 
  ShieldCheck, 
  Loader2, 
  CheckCircle2, 
  Upload, 
  Camera, 
  Fingerprint,
  Lock,
  AlertCircle 
} from 'lucide-react';

interface RealKYCProps {
  userId: string;
  onComplete: (status: 'verified' | 'failed' | 'pending') => void;
}

type Step = 'start' | 'upload' | 'face' | 'processing' | 'done';

export default function RealKYC({ userId, onComplete }: RealKYCProps) {
  const { session } = useAuth();
  const { publicKey } = useWallet();
  const [currentStep, setCurrentStep] = useState<Step>('start');
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // Simulate document upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
      // Auto-advance after 1 second (simulate upload)
      setTimeout(() => {
        setCurrentStep('face');
      }, 1000);
    }
  };

  // Simulate face capture (just a button)
  const handleFaceCapture = () => {
    setCurrentStep('processing');
    startSimulation();
  };

  // Simulate the verification process with progress
  const startSimulation = () => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          completeVerification();
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  // Final verification success
  const completeVerification = async () => {
    try {
      // Log activity
      await logUserActivity(
        session?.user?.id || null,
        publicKey?.toString() || null,
        'kyc_completed',
        { status: 'verified', provider: 'simulated' }
      );

      // Update central matrix via legalStatusService
      const result = await updateLegalStatus({
        userId: userId,
        fullyCompliant: true
      });

      if (!result.success) {
        console.error('❌ Legal status sync error:', result.error);
        setError('Failed to update compliance status. Please try again.');
        return;
      }

      console.log('✅ Simulated KYC completed, matrix updated');
      setCurrentStep('done');
      onComplete('verified');
    } catch (err) {
      console.error('KYC completion error:', err);
      setError('Verification failed. Please try again.');
    }
  };

  // Reset and try again
  const handleRetry = () => {
    setError(null);
    setUploadedFile(null);
    setCurrentStep('start');
    setProgress(0);
  };

  // Step UI
  if (error) {
    return (
      <div className="p-6 md:p-8">
        <div className="flex flex-col items-center gap-4 p-6 bg-red-900/20 border border-red-500/30 rounded-xl">
          <AlertCircle className="h-12 w-12 text-red-400" />
          <h3 className="text-lg font-bold text-white">Verification Error</h3>
          <p className="text-slate-300 text-center">{error}</p>
          <button
            onClick={handleRetry}
            className="px-5 py-2 bg-gradient-to-r from-cyan-600 to-emerald-600 rounded-lg text-white"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (currentStep === 'done') {
    return (
      <div className="p-6 md:p-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="p-3 rounded-full bg-emerald-900/30 border border-emerald-500/30">
            <CheckCircle2 className="h-12 w-12 text-emerald-400" />
          </div>
          <h2 className="text-xl font-bold text-white">Verification Successful!</h2>
          <p className="text-slate-300">Your identity has been verified. Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-slate-700/50 bg-gradient-to-r from-cyan-900/30 to-emerald-900/30 rounded-t-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-r from-cyan-900 to-emerald-900 border border-cyan-500/30">
            <ShieldCheck className="h-6 w-6 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Identity Verification (Simulated)</h2>
            <p className="text-sm text-slate-400">For demonstration purposes – no real data is stored</p>
          </div>
        </div>
      </div>

      {/* Step content */}
      <div className="p-4 md:p-6">
        {currentStep === 'start' && (
          <div className="space-y-6">
            <div className="bg-cyan-900/20 p-4 rounded-lg border border-cyan-500/20">
              <p className="text-slate-300 text-sm">
                This is a simulated KYC process that mimics real identity verification.
                No documents are uploaded or stored. Click “Start” to continue.
              </p>
            </div>
            <button
              onClick={() => setCurrentStep('upload')}
              className="w-full py-3 bg-gradient-to-r from-cyan-600 to-emerald-600 rounded-lg font-semibold text-white hover:shadow-lg transition"
            >
              Start Verification
            </button>
          </div>
        )}

        {currentStep === 'upload' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 p-4 bg-slate-800/30 rounded-lg border border-slate-700/30">
              <Upload className="h-5 w-5 text-cyan-400" />
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-200 mb-1">
                  Upload Government ID
                </label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-600 file:text-white hover:file:bg-cyan-700"
                />
                <p className="text-xs text-slate-400 mt-1">Passport, Driver's License, or National ID (simulated)</p>
              </div>
            </div>
            {uploadedFile && (
              <div className="text-center text-emerald-400 text-sm">Uploading...</div>
            )}
          </div>
        )}

        {currentStep === 'face' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 p-4 bg-slate-800/30 rounded-lg border border-slate-700/30">
              <Camera className="h-5 w-5 text-cyan-400" />
              <div className="flex-1">
                <p className="text-sm text-slate-300">Face Verification (simulated)</p>
                <button
                  onClick={handleFaceCapture}
                  className="mt-2 px-4 py-2 bg-cyan-600 rounded-lg text-white text-sm hover:bg-cyan-700"
                >
                  Capture Selfie
                </button>
              </div>
            </div>
          </div>
        )}

        {currentStep === 'processing' && (
          <div className="space-y-6 text-center">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-10 w-10 text-cyan-400 animate-spin" />
              <p className="text-slate-300">Verifying your identity...</p>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-cyan-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-slate-400">This usually takes 2-5 minutes (simulated)</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer steps indicator */}
      <div className="p-4 border-t border-slate-700/50 bg-slate-900/30 rounded-b-2xl">
        <div className="flex justify-between items-center text-xs text-slate-400">
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${currentStep !== 'start' ? 'bg-emerald-400' : 'bg-slate-600'}`} />
            <span>Upload ID</span>
          </div>
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${['face', 'processing', 'done'].includes(currentStep) ? 'bg-emerald-400' : 'bg-slate-600'}`} />
            <span>Face Match</span>
          </div>
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${['processing', 'done'].includes(currentStep) ? 'bg-emerald-400' : 'bg-slate-600'}`} />
            <span>Verification</span>
          </div>
        </div>
      </div>
    </div>
  );
}
