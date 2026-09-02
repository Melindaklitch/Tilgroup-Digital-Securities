// app/api/wallet/balance/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { PublicKey } from '@solana/web3.js';

export const runtime = 'edge';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const RPC_URL = process.env.SOLANA_RPC_URL;

const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

async function rpcCall(method: string, params: any[]) {
  if (!RPC_URL) {
    throw new Error('RPC_UNAVAILABLE');
  }

  const res = await fetch(RPC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method,
      params,
    }),
  });

  const json = await res.json();

  if (json.error) {
    throw new Error('RPC_UNAVAILABLE');
  }

  return json.result;
}

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user with existing Supabase JWT
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { ok: false, error: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false },
      global: {
        headers: { Authorization: `Bearer ${token}` },
      },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { ok: false, error: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // 2. Parse and validate wallet address
    const body = await request.json();
    const wallet = body?.wallet;

    if (!wallet || typeof wallet !== 'string') {
      return NextResponse.json(
        { ok: false, error: 'INVALID_WALLET' },
        { status: 400 }
      );
    }

    try {
      new PublicKey(wallet);
    } catch {
      return NextResponse.json(
        { ok: false, error: 'INVALID_WALLET' },
        { status: 400 }
      );
    }

    // 3. Verify wallet ownership using profiles.wallet_address
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('wallet_address')
      .eq('id', user.id)
      .single();

    if (profileError || profile?.wallet_address !== wallet) {
      return NextResponse.json(
        { ok: false, error: 'WALLET_MISMATCH' },
        { status: 403 }
      );
    }

    // 4. Fetch SOL balance
    const lamports = await rpcCall('getBalance', [wallet]);

    // 5. Fetch all USDC token accounts and sum
    const tokenAccounts = await rpcCall('getTokenAccountsByOwner', [
      wallet,
      { mint: USDC_MINT },
      { encoding: 'jsonParsed' },
    ]);

    let usdcRaw = 0n;
    for (const account of tokenAccounts.value ?? []) {
      const amountString =
        account.account?.data?.parsed?.info?.tokenAmount?.amount;

      if (amountString) {
        usdcRaw += BigInt(amountString);
      }
    }

    const usdc = Number(usdcRaw) / 1_000_000; // USDC has 6 decimals
    const sol = Number(lamports) / 1_000_000_000; // lamports → SOL

    return NextResponse.json({
      ok: true,
      sol,
      usdc,
      usdcRaw: usdcRaw.toString(),
      source: 'solana',
    });
  } catch (error: any) {
    console.error('[Wallet Balance API] Error:', error.message || error);

    if (error.message === 'RPC_UNAVAILABLE') {
      return NextResponse.json(
        { ok: false, error: 'RPC_UNAVAILABLE' },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { ok: false, error: 'BALANCE_UNAVAILABLE' },
      { status: 500 }
    );
  }
}
