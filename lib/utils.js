// lib/utils.js
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// ============================================
// MAIN UTILITY FUNCTIONS
// ============================================

/**
 * Merge Tailwind CSS classes with conditional logic
 * @param {...any} inputs - Class values (strings, objects, arrays)
 * @returns {string} Merged class string
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency for display
 * @param {number} amount - Number to format
 * @param {string} currency - Currency code (default: USD)
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format percentage for display
 * @param {number} value - Number to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage string
 */
export function formatPercentage(value, decimals = 1) {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Truncate string with ellipsis
 * @param {string} str - String to truncate
 * @param {number} length - Maximum length
 * @returns {string} Truncated string
 */
export function truncate(str, length = 50) {
  if (str.length <= length) return str;
  return `${str.slice(0, length)}...`;
}

/**
 * Generate random ID
 * @param {number} length - ID length (default: 8)
 * @returns {string} Random ID string
 */
export function generateId(length = 8) {
  return Math.random().toString(36).substring(2, 2 + length);
}

/**
 * Debounce function
 * @param {Function} fn - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(fn, delay) {
  let timeoutId;
  
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Throttle function
 * @param {Function} fn - Function to throttle
 * @param {number} limit - Limit in milliseconds
 * @returns {Function} Throttled function
 */
export function throttle(fn, limit) {
  let inThrottle;
  
  return (...args) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Safely parse JSON
 * @param {string} jsonString - JSON string to parse
 * @param {*} fallback - Fallback value on error
 * @returns {*} Parsed object or fallback
 */
export function safeJsonParse(jsonString, fallback) {
  try {
    return JSON.parse(jsonString);
  } catch {
    return fallback;
  }
}

/**
 * Check if running on client side
 * @returns {boolean}
 */
export const isClient = typeof window !== 'undefined';

/**
 * Check if running on server side
 * @returns {boolean}
 */
export const isServer = !isClient;

/**
 * Get environment variable with fallback
 * @param {string} key - Environment variable key
 * @param {string} fallback - Fallback value
 * @returns {string} Environment variable value or fallback
 */
export function getEnv(key, fallback = '') {
  return process.env[key] || fallback;
}

/**
 * Sleep for specified milliseconds
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================
// EXPORTS
// ============================================

export default {
  cn,
  formatCurrency,
  formatPercentage,
  truncate,
  generateId,
  debounce,
  throttle,
  safeJsonParse,
  isClient,
  isServer,
  getEnv,
  sleep,
};
