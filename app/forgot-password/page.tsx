"use client";

import { useAuth } from "../components/Context/AuthContext";
import { useState } from "react";
import { Mail, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isValidEmail = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleSubmit = async () => {
    setError("");
    setMessage("");

    if (!email) {
      setError("Email address is required");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      await resetPassword(email);

      setMessage(
        "Password reset email sent successfully. Please check your inbox."
      );

      setTimeout(() => {
        router.push("/signin");
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Failed to send password reset email");
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
                <Mail className="h-6 w-6 md:h-8 md:w-8 text-cyan-400" />
              </div>
            </div>

            <div className="space-y-1">
              <h1 className="text-xl md:text-2xl font-bold text-white">
                Forgot Password
              </h1>

              <p className="text-gray-400 text-xs md:text-sm">
                Enter your email address and we'll send you instructions to
                reset your password.
              </p>
            </div>
          </div>

          {/* Form Section */}
          <div className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-xs md:text-sm font-medium text-gray-300">
                Email Address
              </label>

              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 md:py-3 rounded-lg md:rounded-xl bg-[#0a2f3d]/50 border border-gray-700/30 text-white placeholder-gray-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-transparent text-sm transition-all"
                onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
              />
            </div>

            {/* Error Alert */}
            {error && (
              <div className="p-2.5 md:p-3 bg-red-900/20 border border-red-700/20 rounded-lg md:rounded-xl">
                <p className="text-red-300 text-xs md:text-sm">{error}</p>
              </div>
            )}

            {/* Success Alert */}
            {message && (
              <div className="p-2.5 md:p-3 bg-green-900/20 border border-green-700/20 rounded-lg md:rounded-xl">
                <p className="text-green-300 text-xs md:text-sm">{message}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-700 hover:to-emerald-700 text-white text-sm md:text-base py-2.5 md:py-3 rounded-lg md:rounded-xl disabled:opacity-50 transition-all duration-200"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Sending...
                </span>
              ) : (
                "Send Reset Link"
              )}
            </Button>

            {/* Back Link */}
            <div className="text-center pt-2">
              <button
                onClick={() => router.push("/signin")}
                className="text-cyan-400 hover:text-cyan-300 text-xs md:text-sm flex items-center justify-center gap-1 transition-colors"
              >
                <ArrowLeft className="h-3 w-3" />
                Back to Sign In
              </button>
            </div>
          </div>

          {/* Footer Notice */}
          <div className="pt-2 border-t border-gray-800/30">
            <p className="text-[10px] md:text-xs text-gray-500 text-center">
              If an account exists for this email address, a password reset
              link will be sent.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
