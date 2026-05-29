// app/components/ui/PasswordInput.tsx
"use client";

import { useState, useId } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";

// ============================================
// TYPES & INTERFACES
// ============================================

type Props = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  name?: string;
  autoComplete?: 'current-password' | 'new-password' | 'off';
  strengthMeter?: boolean;
};

// ============================================
// PASSWORD STRENGTH CHECKER
// ============================================

type PasswordStrength = 'weak' | 'medium' | 'strong' | 'very-strong';

function getPasswordStrength(password: string): PasswordStrength {
  if (!password) return 'weak';
  
  let score = 0;
  
  // Length check
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  
  // Character variety checks
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  
  if (score >= 6) return 'very-strong';
  if (score >= 4) return 'strong';
  if (score >= 2) return 'medium';
  return 'weak';
}

function getStrengthColor(strength: PasswordStrength): string {
  switch (strength) {
    case 'very-strong':
      return 'bg-emerald-500';
    case 'strong':
      return 'bg-green-500';
    case 'medium':
      return 'bg-yellow-500';
    case 'weak':
      return 'bg-red-500';
  }
}

function getStrengthText(strength: PasswordStrength): string {
  switch (strength) {
    case 'very-strong':
      return "Very Strong";
    case 'strong':
      return "Strong";
    case 'medium':
      return "Medium";
    case 'weak':
      return "Weak";
  }
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function PasswordInput({ 
  value, 
  onChange, 
  placeholder, 
  label,
  error,
  disabled = false,
  required = false,
  className = "",
  name,
  autoComplete = 'current-password',
  strengthMeter = false,
}: Props) {
  const [show, setShow] = useState(false);
  const [touched, setTouched] = useState(false);
  const id = useId();
  
  const passwordStrength = getPasswordStrength(value);
  const strengthColor = getStrengthColor(passwordStrength);
  const strengthText = getStrengthText(passwordStrength);
  const showStrengthMeter = strengthMeter && value.length > 0 && touched;

  return (
    <div className={`space-y-1.5 md:space-y-2 ${className}`}>
      {/* Label */}
      {label && (
        <label 
          htmlFor={id}
          className="block text-xs md:text-sm font-medium text-gray-300"
        >
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      
      {/* Input Container */}
      <div className="relative w-full">
        {/* Lock Icon */}
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          <Lock className="h-3.5 w-3.5 md:h-4 md:w-4" />
        </div>
        
        {/* Input Field */}
        <input
          id={id}
          type={show ? "text" : "password"}
          name={name}
          placeholder={placeholder || "Password"}
          value={value}
          onChange={onChange}
          onBlur={() => setTouched(true)}
          disabled={disabled}
          required={required}
          autoComplete={autoComplete}
          className={`
            w-full 
            pl-9 md:pl-10 
            pr-10 md:pr-12 
            py-2.5 md:py-3 
            rounded-lg md:rounded-xl 
            bg-[#0a2f3d]/50 
            border 
            text-white 
            placeholder-gray-400/50 
            focus:outline-none 
            focus:ring-2 
            focus:ring-cyan-500/30 
            focus:border-transparent 
            text-sm 
            transition-all
            disabled:opacity-50 
            disabled:cursor-not-allowed
            ${error 
              ? 'border-red-500/50 focus:ring-red-500/30' 
              : 'border-gray-700/30 hover:border-gray-600/50'
            }
          `}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : showStrengthMeter ? `${id}-strength` : undefined}
        />
        
        {/* Toggle Visibility Button */}
        <button
          type="button"
          onClick={() => setShow(!show)}
          disabled={disabled}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-cyan-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? (
            <EyeOff size={16} className="md:w-[18px] md:h-[18px]" />
          ) : (
            <Eye size={16} className="md:w-[18px] md:h-[18px]" />
          )}
        </button>
      </div>
      
      {/* Password Strength Meter */}
      {showStrengthMeter && !error && (
        <div className="space-y-1">
          <div className="flex gap-1 h-1.5">
            <div 
              className={`h-full rounded-full transition-all duration-300 ${
                passwordStrength === 'weak' ? 'w-1/4 bg-red-500' :
                passwordStrength === 'medium' ? 'w-1/2 bg-yellow-500' :
                passwordStrength === 'strong' ? 'w-3/4 bg-green-500' :
                'w-full bg-emerald-500'
              }`}
            />
          </div>
          <p className="text-[10px] md:text-xs text-slate-400">
            {strengthText}
          </p>
        </div>
      )}
      
      {/* Error Message */}
      {error && (
        <p className="text-red-400 text-[10px] md:text-xs mt-1" id={`${id}-error`}>
          {error}
        </p>
      )}
      
      {/* Password Hint (Optional) */}
      {!error && !label && !strengthMeter && (
        <p className="text-slate-500 text-[10px] md:text-xs mt-1">
          Minimum 8 characters
        </p>
      )}
    </div>
  );
}

// ============================================
// EXPORT HELPER FUNCTIONS
// ============================================

export { getPasswordStrength, getStrengthColor, getStrengthText };
export type { PasswordStrength };
