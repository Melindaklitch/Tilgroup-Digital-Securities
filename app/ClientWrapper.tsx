"use client";

import { ReactNode, useEffect, useState } from 'react';
import { AuthProvider } from "./components/Context/AuthContext";
import WalletProvider from "./components/Context/WalletProvider";

// ============================================
// TYPES & INTERFACES
// ============================================

interface ClientWrapperProps {
  children: ReactNode;
}

interface ClientWrapperState {
  isInitialized: boolean;
  error: string | null;
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function ClientWrapper({ children }: ClientWrapperProps) {
  const [state, setState] = useState<ClientWrapperState>({
    isInitialized: false,
    error: null,
  });

  // Initialize client-side only features
  useEffect(() => {
    try {
      // Mark as initialized after mount (for hydration safety)
      setState(prev => ({ ...prev, isInitialized: true }));
      
      // Log initialization in development
      if (process.env.NODE_ENV === 'development') {
        console.log('[ClientWrapper] Initialized successfully');
      }
    } catch (err: any) {
      console.error('[ClientWrapper] Initialization error:', err);
      setState(prev => ({ ...prev, error: err.message }));
    }
  }, []);

  // Show error state if initialization failed
  if (state.error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a1f2f] via-[#071526] to-[#0a1f2f] p-4">
        <div className="max-w-md w-full bg-red-900/20 border border-red-500/30 rounded-xl p-6 text-center">
          <div className="text-red-400 text-xl mb-2">⚠️</div>
          <h2 className="text-white font-semibold mb-2">Initialization Error</h2>
          <p className="text-red-300 text-sm">{state.error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <AuthProvider>
      <WalletProvider>
        {children}
      </WalletProvider>
    </AuthProvider>
  );
}

// ============================================
// HELPER HOOKS
// ============================================

/**
 * Hook to check if client wrapper is ready
 */
export function useClientReady() {
  const [isReady, setIsReady] = useState(false);
  
  useEffect(() => {
    setIsReady(true);
  }, []);
  
  return isReady;
}

/**
 * Hook to get client environment info
 */
export function useClientInfo() {
  const [info, setInfo] = useState({
    isClient: false,
    userAgent: '',
    language: '',
    platform: '',
  });
  
  useEffect(() => {
    setInfo({
      isClient: true,
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
    });
  }, []);
  
  return info;
}
