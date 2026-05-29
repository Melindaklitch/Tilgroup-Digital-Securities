'use client';

import { useEffect } from 'react';
import { setupRealtimeRetry } from '../Lib/supabaseClient';

export default function RealtimeInitializer() {
  useEffect(() => {
    // Only run in production or on HTTPS
    if (typeof window !== 'undefined') {
      const isSecure = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
      if (isSecure) {
        setupRealtimeRetry();
      } else {
        console.log('⚠️ Realtime skipped - insecure connection');
      }
    }
  }, []);

  return null;
}
