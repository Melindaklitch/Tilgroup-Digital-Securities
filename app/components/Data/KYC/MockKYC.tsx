"use client";

import { useState } from "react";
import { supabase } from "../../Lib/supabaseClient";
import { updateLegalStatus } from "@/lib/services/legalStatusService";
import { useQuestionnaireState } from "@/app/platform/hooks/questionnaire/useQuestionnaireState";

interface MockKYCProps {
  userId: string;
  onComplete: (status: 'verified' | 'failed' | 'pending') => void;
}

export default function MockKYC({ userId, onComplete }: MockKYCProps) {
  const { submitKYC } = useQuestionnaireState();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    country: 'US'
  });

  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      // 1. Submit KYC to update questionnaire_status
      const success = await submitKYC(formData);
      
      if (!success) {
        throw new Error('KYC submission failed');
      }

      // 2. Save detailed KYC record (Simulation)
      const { error: kycError } = await supabase
        .from('user_kyc_status')
        .upsert({
          user_id: userId,
          kyc_status: 'verified',
          provider: 'mockkyc',
          test_mode: true,
          verified_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        });

      if (kycError) {
        console.error('❌ KYC save error:', kycError);
        throw kycError;
      }

      // 3. USE THE UNIFIED SERVICE FOR LEGAL STATUS
      const result = await updateLegalStatus({
        userId: userId,
        fullyCompliant: true
      });

      if (!result.success) {
        console.error('❌ Legal status sync failed:', result.error);
      }

      console.log('✅ Mock KYC and Legal Status sync completed successfully');
      onComplete('verified');
      
    } catch (error: any) {
      console.error('❌ Mock KYC error:', error);
      
      if (error.message?.includes('does not exist')) {
        alert('Database table mismatch. Ensure your migrations have run.');
      }
      
      onComplete('failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0f2a3f] rounded-xl p-6">
      <h2 className="text-xl font-semibold mb-4">Mock KYC Verification</h2>
      <p className="text-gray-300 mb-6">
        This is a simulated verification for testing purposes only.
      </p>
      
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm mb-2">First Name</label>
          <input
            type="text"
            className="w-full p-3 bg-[#071526] border border-gray-700 rounded text-white"
            value={formData.firstName}
            onChange={(e) => setFormData({...formData, firstName: e.target.value})}
            placeholder="Enter test first name"
          />
        </div>
        
        <div>
          <label className="block text-sm mb-2">Last Name</label>
          <input
            type="text"
            className="w-full p-3 bg-[#071526] border border-gray-700 rounded text-white"
            value={formData.lastName}
            onChange={(e) => setFormData({...formData, lastName: e.target.value})}
            placeholder="Enter test last name"
          />
        </div>
        
        <div>
          <label className="block text-sm mb-2">Date of Birth</label>
          <input
            type="date"
            className="w-full p-3 bg-[#071526] border border-gray-700 rounded text-white"
            value={formData.dob}
            onChange={(e) => setFormData({...formData, dob: e.target.value})}
          />
        </div>
        
        <div>
          <label className="block text-sm mb-2">Country</label>
          <select
            className="w-full p-3 bg-[#071526] border border-gray-700 rounded text-white"
            value={formData.country}
            onChange={(e) => setFormData({...formData, country: e.target.value})}
          >
            <option value="US">United States</option>
            <option value="UK">United Kingdom</option>
            <option value="SG">Singapore</option>
          </select>
        </div>
      </div>
      
      <div className="p-4 bg-yellow-900/20 border border-yellow-700 rounded mb-6">
        <p className="text-yellow-200 text-sm">
          ⚠ <strong>Development Mode:</strong> Clicking submit will sync your legal status to "Fully Compliant" in the DB.
        </p>
      </div>
      
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-yellow-600 text-black py-3 rounded font-semibold hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
            Processing...
          </span>
        ) : 'Complete Mock KYC'}
      </button>
    </div>
  );
}
