"use client";

import { useAuth } from "../components/Context/AuthContext";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff, Lock, Shield, Building2, Mail, Key, Loader2 } from "lucide-react";

export default function SignInPage() {
  const { signin, resetPassword } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [navigating, setNavigating] = useState(false);

  const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleSignIn = async () => {
  setError("");
  setMessage("");
  setLoading(true);

  if (!isValidEmail(email)) {
    setError("Please enter a valid institutional email address");
    setLoading(false);
    return;
  }
  if (!password) {
    setError("Password is required");
    setLoading(false);
    return;
  }

  try {
    const { data, error } = await signin(email, password);

    if (error) {
      if (error.message.includes("invalidCredentials")) {
        setError("Invalid credentials. Please check your email and password.");
      } else if (error.message.toLowerCase().includes("email")) {
        setError("Email not registered. Please register for executive access.");
      } else {
        setError("Sign in failed. Please try again or contact institutional support.");
      }
      setLoading(false);
      return;
    }

        if (!data?.session) {
      setError("Session creation failed. Please try again.");
      setLoading(false);
      return;
    }

    // ✅ Email verification guard
    if (!data.user?.email_confirmed_at) {
      setError("Please confirm your email address before signing in.");
      setLoading(false);
      return;
    }

    setMessage("✓ Sign in successful. Redirecting to investor qualification...");
    setTimeout(() => router.push("/questionnaire"), 1500);
  } catch (err: any) {
    setError("Authentication failed. Please check your credentials.");
    setLoading(false);
  }
};

  const handleForgotPassword = async () => {
    setError("");
    setMessage("");

    if (!isValidEmail(email)) {
      setError("Please enter your registered email address");
      return;
    }
    try {
      await resetPassword(email);
      setMessage("✓ Password reset email sent. Check your inbox.");
    } catch (err: any) {
      setError("Reset failed. Please try again or contact support.");
    }
  };

   const handleExecutiveSignUp = () => {
    setNavigating(true);
    router.push("/signup");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-6 md:py-10">
      <div className="max-w-md w-full space-y-5">
        
        {/* Main Card */}
        <div className="relative rounded-2xl bg-[#102a3a] border border-gray-800/50 shadow-2xl p-6 md:p-8 space-y-6">
          
          {/* Executive Portal Badge */}
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#0a2f3d] to-[#083545] border border-portxGreen/30 rounded-full px-4 py-1.5 md:px-5 md:py-2">
              <Shield className="h-3.5 w-3.5 md:h-4 md:w-4 text-portxGreen" />
              <span className="text-xs font-medium text-white">
                CAN GIO PORT EXECUTIVE PORTAL
              </span>
            </div>
          </div>

          {/* Header Section */}
          <div className="text-center space-y-3 pt-4">
            <div className="flex justify-center">
              <div className="bg-gradient-to-br from-[#0a2f3d] to-[#083545] p-2.5 rounded-xl border border-portxGreen/20">
                <img
                  src="/images/Logo/logo-white.svg"
                  alt="TIL Group Port Investment"
                  className="h-10 md:h-12 w-auto"
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <h1 className="text-xl md:text-2xl font-bold text-white">
                Institutional Sign In
              </h1>
              <p className="text-gray-300 text-xs md:text-sm">
                Access the $5.5B Can Gio Port digital securities offering
              </p>
            </div>
            
            {/* Project Brief */}
            <div className="p-2.5 md:p-3 bg-gradient-to-r from-[#0a2f3d] to-[#083545] rounded-lg border border-gray-800/30">
              <p className="text-[11px] md:text-xs text-gray-300">
                <span className="text-portxGreen font-medium">$5.5B Infrastructure</span> • <span className="text-cyan-300">Ho Chi Minh City, Vietnam</span> • <span className="text-emerald-300">MSC Group Backing</span>
              </p>
            </div>
          </div>

          {/* Form Section */}
          <div className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-xs md:text-sm font-medium text-gray-300">
                Institutional Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3.5 w-3.5 md:h-4 md:w-4" />
                <input
                  type="email"
                  placeholder="name@institution.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 md:pl-10 pr-3 py-2.5 md:py-3 rounded-lg md:rounded-xl bg-[#0a2f3d]/50 border border-gray-700/30 text-white placeholder-gray-400/50 focus:outline-none focus:ring-2 focus:ring-portxGreen/30 focus:border-transparent text-sm"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="block text-xs md:text-sm font-medium text-gray-300">
                Password
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3.5 w-3.5 md:h-4 md:w-4" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your institutional password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 md:pl-10 pr-10 md:pr-12 py-2.5 md:py-3 rounded-lg md:rounded-xl bg-[#0a2f3d]/50 border border-gray-700/30 text-white placeholder-gray-400/50 focus:outline-none focus:ring-2 focus:ring-portxGreen/30 focus:border-transparent text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-portxGreen transition-colors"
                >
                  {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
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
          </div>

          {/* Sign In Button */}
          <Button
            onClick={handleSignIn}
            disabled={loading}
            className="w-full bg-gradient-to-r from-portxGreen to-cyan-500 hover:from-portxGreen/90 hover:to-cyan-500/90 text-white text-sm md:text-base py-2.5 md:py-3 rounded-lg md:rounded-xl disabled:opacity-50 shadow-lg hover:shadow-xl transition-all duration-200 border border-cyan-300/20"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 md:h-5 md:w-5 border-2 border-white border-t-transparent mr-2 md:mr-3"></div>
                Authenticating...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Lock className="h-4 w-4 md:h-5 md:w-5" />
                Access Executive Portal
              </span>
            )}
          </Button>

          {/* Forgot Password */}
          <p
            onClick={handleForgotPassword}
            className="text-xs md:text-sm text-cyan-300 text-center cursor-pointer hover:text-cyan-200 hover:underline transition-colors"
          >
            Reset institutional password
          </p>

          {/* Executive Registration */}
          <div className="space-y-3 p-3 md:p-4 bg-gradient-to-r from-[#0a2f3d] to-[#083545] rounded-lg md:rounded-xl border border-gray-800/30">
            <p className="text-xs md:text-sm text-gray-300">
              Need executive access to the $150M digital securities offering?
            </p>
           <Button
             onClick={handleExecutiveSignUp}
             variant="outline"
             className="w-full border border-portxGreen/30 text-portxGreen hover:bg-[#0a2f3d]/50 hover:text-white text-sm md:text-base py-2 md:py-2.5 rounded-lg"
             disabled={navigating}
            >
           <div className="flex items-center justify-center gap-2">
             {navigating ? (
           <Loader2 className="h-3.5 w-3.5 md:h-4 md:w-4 animate-spin" />
            ) : (
          <Shield className="h-3.5 w-3.5 md:h-4 md:w-4" />
           )}
           {navigating ? 'Redirecting...' : 'Register for Executive Access'}
          </div>
         </Button>
          </div>

          {/* Accreditation Notice */}
          <div className="pt-4 border-t border-gray-800/30 space-y-3">
            <p className="text-[10px] md:text-xs text-gray-500 text-center">
              This portal is for accredited investors only. Access to the $5.5B Can Gio Port digital securities offering requires verification.
            </p>
            <div className="flex justify-center gap-3">
              <div className="h-px w-8 md:w-10 bg-gray-700/50"></div>
              <span className="text-[10px] md:text-xs text-gray-600">Institutional Platform</span>
              <div className="h-px w-8 md:w-10 bg-gray-700/50"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
