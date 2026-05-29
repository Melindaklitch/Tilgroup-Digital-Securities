"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../components/Context/AuthContext";
import { useSearchParams } from "next/navigation";
import { Eye, EyeOff, Lock, KeyRound } from "lucide-react";
import { supabase } from '@/app/components/Lib/supabaseClient';
import { Button } from "@/components/ui/button";

export default function UpdatePasswordPage() {
  const { updatePassword } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const searchParams = useSearchParams();

  useEffect(() => {
    // Catch access token from the reset password link
    const access_token = searchParams.get("access_token");
    if (access_token) {
      supabase.auth.setSession({
        access_token,
        refresh_token: searchParams.get("refresh_token") || "",
      });
    }
  }, [searchParams]);

  const handleSubmit = async () => {
    setError("");
    setMessage("");
    setLoading(true);

    if (!password) {
      setError("❌ Password is required");
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("❌ Password must be at least 8 characters");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("❌ Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      await updatePassword(password);
      setMessage("✅ Password updated successfully!");
      setPassword("");
      setConfirmPassword("");
      
      // Optional: redirect after 3 seconds
      setTimeout(() => {
        // router.push("/signin");
      }, 3000);
    } catch (err: any) {
      setError(err.message || "❌ Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-6 md:py-10 bg-gradient-to-br from-[#0a1f2f] via-[#071526] to-[#0a1f2f]">
      <div className="max-w-md w-full space-y-5">
        
        {/* Main Card */}
        <div className="rounded-2xl bg-gradient-to-b from-[#0a1f2f]/95 to-[#071526]/95 backdrop-blur-xl border border-gray-800/50 shadow-2xl p-6 md:p-8 space-y-6">
          
          {/* Header Section */}
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <div className="inline-flex p-2.5 md:p-3 rounded-xl bg-gradient-to-br from-cyan-900 to-emerald-900 border border-cyan-500/30">
                <KeyRound className="h-6 w-6 md:h-8 md:w-8 text-cyan-400" />
              </div>
            </div>
            
            <div className="space-y-1">
              <h1 className="text-xl md:text-2xl font-bold text-white">
                Update Password
              </h1>
              <p className="text-gray-400 text-xs md:text-sm">
                Create a new secure password for your executive account
              </p>
            </div>
          </div>

          {/* Form Section */}
          <div className="space-y-4">
            {/* New Password Field */}
            <div className="space-y-1.5">
              <label className="block text-xs md:text-sm font-medium text-gray-300">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3.5 w-3.5 md:h-4 md:w-4" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 md:pl-10 pr-10 md:pr-12 py-2.5 md:py-3 rounded-lg md:rounded-xl bg-[#0a2f3d]/50 border border-gray-700/30 text-white placeholder-gray-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-transparent text-sm transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-400 transition-colors"
                >
                  {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
              </div>
              <p className="text-[10px] md:text-xs text-gray-500 mt-1">
                Minimum 8 characters
              </p>
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-1.5">
              <label className="block text-xs md:text-sm font-medium text-gray-300">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3.5 w-3.5 md:h-4 md:w-4" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-9 md:pl-10 pr-10 md:pr-12 py-2.5 md:py-3 rounded-lg md:rounded-xl bg-[#0a2f3d]/50 border border-gray-700/30 text-white placeholder-gray-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-transparent text-sm transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-400 transition-colors"
                >
                  {showConfirmPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
              </div>
            </div>

            {/* Alerts */}
            {error && (
              <div className="p-2.5 md:p-3 bg-red-900/20 border border-red-700/20 rounded-lg md:rounded-xl">
                <p className="text-red-300 text-xs md:text-sm">{error}</p>
              </div>
            )}
            
            {message && (
              <div className="p-2.5 md:p-3 bg-green-900/20 border border-green-700/20 rounded-lg md:rounded-xl">
                <p className="text-green-300 text-xs md:text-sm">{message}</p>
              </div>
            )}

            {/* Update Button */}
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-700 hover:to-emerald-700 text-white text-sm md:text-base py-2.5 md:py-3 rounded-lg md:rounded-xl disabled:opacity-50 transition-all duration-200"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Updating...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <KeyRound className="h-4 w-4" />
                  Update Password
                </span>
              )}
            </Button>
          </div>

          {/* Footer Notice */}
          <div className="pt-2 border-t border-gray-800/30">
            <p className="text-[10px] md:text-xs text-gray-500 text-center">
              Use a strong, unique password for your executive account
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
