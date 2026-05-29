"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "../components/Context/AuthContext";
import KYCVerification from "../components/Data/KYCVerification";
import { syncOnboardingStatus } from "../services/onboardingStateService";

export default function KYCPage() {
  const router = useRouter();
  const { session, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!session) {
    router.push("/signin");
    return null;
  }

 const handleKYCComplete = async (
  status: 'verified' | 'failed' | 'pending'
) => {
  if (status === 'verified') {

    console.log('[KYC] Syncing wallet_pending');

    await syncOnboardingStatus(
      session.user.id,
      'wallet_pending'
    );

    console.log('[KYC] Redirecting to wallet');

    router.push('/wallet');
  }
};

  return (
    <KYCVerification 
      userId={session.user.id} 
      onComplete={handleKYCComplete}
      testMode={true}
    />
  );
}
