"use client";

import { useAuth } from "../components/Context/AuthContext";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff, Building2, Mail, Key, Shield, Target, BarChart3, Lock, FileText, Loader2 } from "lucide-react";
import { supabase } from "../components/Lib/supabaseClient";

export default function ExecutiveSignUpPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [navigating, setNavigating] = useState(false);

  const isValidEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

   const handleSignup = async () => {
  setError("");
  setSuccess("");

  if (!isValidEmail(email)) {
    setError("Please enter a valid email address");
    return;
  }

  const emailDomain = email.split("@")[1]?.toLowerCase();
  const isTestEmail = email.toLowerCase().includes("+test");

  const personalDomains = [
    "gmail.com",
    "yahoo.com",
    "hotmail.com",
    "outlook.com",
    "icloud.com",
    "aol.com",
  ];

  // Allow personal emails ONLY for test accounts
  if (
    !isTestEmail &&
    emailDomain &&
    personalDomains.includes(emailDomain)
  ) {
    setError(
      "Please use your corporate email address for access to this digital securities offering"
    );
    return;
  }

  if (password.length < 8) {
    setError("Password must be at least 8 characters");
    return;
  }

  if (password !== confirmPassword) {
    setError("Passwords do not match");
    return;
  }

  try {
    setLoading(true);

    // 1. Create user in Supabase (email confirmation DISABLED in Supabase settings)
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { companyName: companyName || undefined },
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (signUpError) throw new Error(signUpError.message);
    if (!signUpData.user) throw new Error("No user returned from signup");

    console.log("✅ Auth signup successful:", signUpData.user.id);

    // 2. Send custom verification email via Resend
    const emailRes = await fetch('/api/auth/send-verification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        firstName: companyName || email.split('@')[0],
        userId: signUpData.user.id
      })
    });

    if (!emailRes.ok) {
      const errorData = await emailRes.json();
      throw new Error(errorData.error || 'Failed to send verification email');
    }

    setSuccess(
      "✅ Verification email sent! Please check your inbox to confirm your email address and begin the digital securities accreditation process."
    );

    setTimeout(() => {
      router.push("/signin?verify=email_sent");
    }, 3000);

  } catch (err: any) {
    console.error("Executive signup failed:", err);
    setError(
      err.message ||
      "Digital securities registration failed. Please try again."
    );
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-6 md:py-10 bg-gradient-to-br from-[#0a1f2f] via-[#071526] to-[#0a1f2f]">
      {/* Background effects - preserved */}
      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent"></div>

      <div className="max-w-md w-full space-y-5 relative z-10">
        
        {/* Main Card */}
        <div className="relative rounded-2xl bg-gradient-to-b from-[#0a1f2f]/95 to-[#071526]/95 backdrop-blur-xl border border-gray-800/50 shadow-2xl p-6 md:p-8 space-y-6">
          
          {/* Executive Portal Badge */}
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#0a2f3d] to-[#083545] border border-portxGreen/30 rounded-full px-4 py-1.5 md:px-5 md:py-2 backdrop-blur-sm">
              <Shield className="h-3.5 w-3.5 md:h-4 md:w-4 text-portxGreen" />
              <span className="text-xs font-medium text-white">
                DIGITAL SECURITIES OFFERING • $5.5B INFRASTRUCTURE
              </span>
            </div>
          </div>

          {/* Header Section */}
          <div className="text-center space-y-3 pt-4">
            <div className="flex justify-center">
              <div className="bg-gradient-to-br from-[#0a2f3d] to-[#083545] p-2.5 rounded-xl border border-portxGreen/20">
                <img
                  src="/images/Logo/logo-white.svg"
                  alt="TILGroup Digital Securities"
                  className="h-10 md:h-12 w-auto"
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <h1 className="text-xl md:text-2xl font-bold text-white">
                Can Gio International Transshipment Port
                <span className="block text-lg md:text-xl text-cyan-400 mt-1">
                  Digital Securities Executive Portal
                </span>
              </h1>
              <p className="text-gray-300 text-xs md:text-sm">
                Register for accredited investor access to the $150M digital securities offering
              </p>
            </div>
            
            <div className="inline-flex items-center gap-2 bg-gradient-to-br from-[#0a2f3d] to-[#083545] border border-gray-800/50 rounded-lg px-3 py-1.5 md:px-4 md:py-2 backdrop-blur-sm">
              <BarChart3 className="h-3.5 w-3.5 md:h-4 md:w-4 text-portxGreen" />
              <span className="text-[11px] md:text-xs font-medium text-gray-300">
                Blockchain Infrastructure: Solana SPL
              </span>
            </div>

            {process.env.NODE_ENV === 'development' && (
              <div className="inline-flex items-center gap-2 bg-purple-900/20 border border-purple-700/20 rounded-full px-2.5 py-0.5 md:px-3 md:py-1">
                <span className="text-[10px] md:text-xs text-purple-300/70">
                  Development Mode Active
                </span>
              </div>
            )}
          </div>

          {/* Form Section */}
          <div className="space-y-4">
            {/* Company Name */}
            <div className="space-y-1.5">
              <label className="block text-xs md:text-sm font-medium text-gray-300">
                Institution/Company Name <span className="text-gray-500 text-xs">(Required for accreditation)</span>
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3.5 w-3.5 md:h-4 md:w-4" />
                <input
                  type="text"
                  placeholder="e.g., Global Maritime Holdings Ltd."
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full pl-9 md:pl-10 pr-3 py-2.5 md:py-3 rounded-lg md:rounded-xl bg-[#0a2f3d]/50 border border-gray-700/30 text-white placeholder-gray-400/50 focus:outline-none focus:ring-2 focus:ring-portxGreen/30 focus:border-transparent text-sm backdrop-blur-sm"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-xs md:text-sm font-medium text-gray-300">
                Corporate Email <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3.5 w-3.5 md:h-4 md:w-4" />
                <input
                  type="email"
                  placeholder="name@institution.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 md:pl-10 pr-3 py-2.5 md:py-3 rounded-lg md:rounded-xl bg-[#0a2f3d]/50 border border-gray-700/30 text-white placeholder-gray-400/50 focus:outline-none focus:ring-2 focus:ring-portxGreen/30 focus:border-transparent text-sm backdrop-blur-sm"
                />
              </div>
              {process.env.NODE_ENV === 'development' && (
                <p className="text-[10px] md:text-xs text-purple-300/50 mt-1">
                  
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-xs md:text-sm font-medium text-gray-300">
                Password <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3.5 w-3.5 md:h-4 md:w-4" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 md:pl-10 pr-10 md:pr-12 py-2.5 md:py-3 rounded-lg md:rounded-xl bg-[#0a2f3d]/50 border border-gray-700/30 text-white placeholder-gray-400/50 focus:outline-none focus:ring-2 focus:ring-portxGreen/30 focus:border-transparent text-sm backdrop-blur-sm"
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

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="block text-xs md:text-sm font-medium text-gray-300">
                Confirm Password <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3.5 w-3.5 md:h-4 md:w-4" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-9 md:pl-10 pr-10 md:pr-12 py-2.5 md:py-3 rounded-lg md:rounded-xl bg-[#0a2f3d]/50 border border-gray-700/30 text-white placeholder-gray-400/50 focus:outline-none focus:ring-2 focus:ring-portxGreen/30 focus:border-transparent text-sm backdrop-blur-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-portxGreen transition-colors"
                >
                  {showConfirmPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
              </div>
            </div>

            {/* Alerts */}
            {error && (
              <div className="p-2.5 md:p-3 bg-red-900/20 border border-red-700/20 rounded-lg md:rounded-xl backdrop-blur-sm">
                <p className="text-red-300 text-xs md:text-sm">{error}</p>
              </div>
            )}
            {success && (
              <div className="p-2.5 md:p-3 bg-green-900/20 border border-green-700/20 rounded-lg md:rounded-xl backdrop-blur-sm">
                <p className="text-green-300 text-xs md:text-sm">{success}</p>
              </div>
            )}
          </div>

          {/* Offering Info */}
          <div className="p-3 md:p-4 bg-gradient-to-r from-[#0a2f3d] to-[#083545] border border-portxGreen/20 rounded-lg md:rounded-xl">
            <div className="flex items-start gap-2 md:gap-3">
              <FileText className="h-4 w-4 md:h-5 md:w-5 text-portxGreen flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs md:text-sm text-white font-medium mb-1">Digital Securities Offering</p>
                <p className="text-[11px] md:text-xs text-gray-400">
                  This $150M offering represents fractional ownership in the $5.5B Can Gio Port via SPL digital securities on institutional-grade blockchain infrastructure. Secure custody through Phantom Wallet integration.
                </p>
              </div>
            </div>
          </div>

          {/* Sign Up Button */}
          <Button
            onClick={handleSignup}
            disabled={loading}
            className="w-full bg-gradient-to-r from-portxGreen to-cyan-500 hover:from-portxGreen/90 hover:to-cyan-500/90 text-white text-sm md:text-base py-2.5 md:py-3 rounded-lg md:rounded-xl disabled:opacity-50 shadow-lg hover:shadow-xl transition-all duration-200 border border-cyan-300/20"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 md:h-5 md:w-5 border-2 border-white border-t-transparent mr-2 md:mr-3"></div>
                Initiating Digital Securities Accreditation...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Shield className="h-4 w-4 md:h-5 md:w-5" />
                Begin Digital Securities Registration
              </span>
            )}
          </Button>

          {/* Footer */}
          <div className="pt-4 border-t border-gray-800/50 space-y-3">
            <p className="text-gray-400 text-center text-xs md:text-sm">
              Already have digital securities access?{" "}
            <span
              className="text-portxGreen font-semibold cursor-pointer hover:underline hover:text-cyan-300 transition-colors inline-flex items-center gap-1"
              onClick={() => {
              setNavigating(true);
              router.push("/signin");
              }}
             >
             {navigating ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
             Institutional Sign In
           </span>
            </p>
            <p className="text-[10px] md:text-xs text-gray-500 text-center">
              This digital securities offering is available only to accredited investors. Minimum investment: $5,500. Distributed ledger technology provides enhanced transparency.
            </p>
            
            <div className="flex flex-wrap justify-center gap-1.5 md:gap-2">
              <div className="inline-flex items-center gap-1 bg-gradient-to-r from-[#0a2f3d] to-[#083545] border border-gray-800/50 rounded-full px-2 py-0.5 md:px-3 md:py-1">
                <span className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-portxGreen"></span>
                <span className="text-[10px] md:text-xs text-white">SPL Digital Securities</span>
              </div>
              <div className="inline-flex items-center gap-1 bg-gradient-to-r from-[#0a2f3d] to-[#083545] border border-gray-800/50 rounded-full px-2 py-0.5 md:px-3 md:py-1">
                <span className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-cyan-400"></span>
                <span className="text-[10px] md:text-xs text-white">Blockchain Infrastructure</span>
              </div>
              <div className="inline-flex items-center gap-1 bg-gradient-to-r from-[#0a2f3d] to-[#083545] border border-gray-800/50 rounded-full px-2 py-0.5 md:px-3 md:py-1">
                <span className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-blue-400"></span>
                <span className="text-[10px] md:text-xs text-white">Secure Digital Custody</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
