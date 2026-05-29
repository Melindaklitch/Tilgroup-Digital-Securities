import { Connection, PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from '@solana/spl-token';

// USDC mint address on Solana mainnet
export const USDC_MINT = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');

// Token decimals mapping
export const TOKEN_DECIMALS: Record<string, number> = {
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': 6, // USDC
  'So11111111111111111111111111111111111111112': 9, // SOL
};

export interface BalanceCheckResult {
  balance: number;
  formattedBalance: string;
  decimals: number;
  mint: string;
  success: boolean;
  error?: string;
}

/**
 * Check USDC balance for a given wallet
 * @param walletPublicKey - The Solana wallet public key
 * @returns Promise<number> - USDC balance in UI amount
 */
export async function checkStablecoinBalance(walletPublicKey: PublicKey): Promise<number> {
  try {
    const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
    const connection = new Connection(rpcUrl, {
      commitment: 'confirmed',
      confirmTransactionInitialTimeout: 60000,
    });
    
    // Get the associated token account for USDC
    const tokenAccount = await getAssociatedTokenAddress(
      USDC_MINT,
      walletPublicKey
    );
    
    // Check if token account exists
    const accountInfo = await connection.getAccountInfo(tokenAccount);
    if (!accountInfo) {
      console.log('[BalanceCheck] No USDC token account found for wallet');
      return 0;
    }
    
    const tokenAccountInfo = await connection.getTokenAccountBalance(tokenAccount);
    const balance = tokenAccountInfo.value.uiAmount || 0;
    
    console.log(`[BalanceCheck] USDC balance: ${balance} for wallet ${walletPublicKey.toString()}`);
    return balance;
  } catch (error) {
    console.error('[BalanceCheck] Error checking USDC balance:', error);
    return 0;
  }
}

/**
 * Check any token balance for a given wallet
 * @param walletPublicKey - The Solana wallet public key
 * @param tokenMint - The token mint address
 * @returns Promise<BalanceCheckResult>
 */
export async function checkTokenBalance(
  walletPublicKey: PublicKey,
  tokenMint: PublicKey
): Promise<BalanceCheckResult> {
  try {
    const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
    const connection = new Connection(rpcUrl, {
      commitment: 'confirmed',
    });
    
    const tokenAccount = await getAssociatedTokenAddress(tokenMint, walletPublicKey);
    const accountInfo = await connection.getAccountInfo(tokenAccount);
    
    if (!accountInfo) {
      return {
        balance: 0,
        formattedBalance: '0',
        decimals: TOKEN_DECIMALS[tokenMint.toString()] || 6,
        mint: tokenMint.toString(),
        success: true,
      };
    }
    
    const tokenAccountInfo = await connection.getTokenAccountBalance(tokenAccount);
    const balance = tokenAccountInfo.value.uiAmount || 0;
    const decimals = tokenAccountInfo.value.decimals;
    
    return {
      balance,
      formattedBalance: balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: decimals }),
      decimals,
      mint: tokenMint.toString(),
      success: true,
    };
  } catch (error) {
    console.error('[BalanceCheck] Error checking token balance:', error);
    return {
      balance: 0,
      formattedBalance: '0',
      decimals: 6,
      mint: tokenMint.toString(),
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Check multiple token balances at once
 * @param walletPublicKey - The Solana wallet public key
 * @param tokenMints - Array of token mint addresses
 * @returns Promise<Record<string, BalanceCheckResult>>
 */
export async function checkMultipleTokenBalances(
  walletPublicKey: PublicKey,
  tokenMints: PublicKey[]
): Promise<Record<string, BalanceCheckResult>> {
  const results: Record<string, BalanceCheckResult> = {};
  
  await Promise.all(
    tokenMints.map(async (mint) => {
      const result = await checkTokenBalance(walletPublicKey, mint);
      results[mint.toString()] = result;
    })
  );
  
  return results;
}
