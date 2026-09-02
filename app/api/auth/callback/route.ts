import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

export const runtime = 'edge';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const RESEND_API_KEY = process.env.RESEND_API_KEY!;
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || `TILGroup Digital Securities <noreply@${process.env.RESEND_DOMAIN}>`;

async function sendWelcomeEmail(userId: string) {
  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  // 1. Atomically claim the send by updating status from not_sent → sending
  const { data: claimedProfiles, error: claimError } = await supabaseAdmin
    .from('profiles')
    .update({ welcome_email_status: 'sending' })
    .eq('id', userId)
    .eq('welcome_email_status', 'not_sent')
    .select('id, email');

  if (claimError) {
    console.error('[WelcomeEmail] Claim error:', claimError);
    return;
  }

  if (!claimedProfiles || claimedProfiles.length === 0) {
    // Already sent or being sent
    console.log('[WelcomeEmail] Already processed for user:', userId);
    return;
  }

  const profile = claimedProfiles[0];
  const email = profile.email;

  if (!email) {
    await supabaseAdmin
      .from('profiles')
      .update({ welcome_email_status: 'failed', welcome_email_last_error: 'No email' })
      .eq('id', userId);
    return;
  }

  const resend = new Resend(RESEND_API_KEY);

  const html = `
    <!DOCTYPE html>
    <html>
      <body style="font-family: Arial, sans-serif; background:#0a1f2f; padding:20px; color:#e2e8f0;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; margin:auto; background:#0f2a3f; border-radius:12px; overflow:hidden; border:1px solid rgba(0,255,136,0.2);">
          <tr>
            <td style="padding:30px; text-align:center; background:linear-gradient(135deg, #0f2a3f 0%, #072532 100%);">
              <div style="font-size:38px; margin-bottom:10px;">🚢</div>
              <h1 style="margin:0; color:#ffffff; font-size:24px;">TIL<span style="color:#00ff88;">Group</span></h1>
              <p style="color:#94a3b8; font-size:13px; letter-spacing:1px;">Can Gio International Transshipment Port</p>
              <p style="color:#00ff88; font-size:12px;">Digital Securities Offering</p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 30px;">
              <p style="font-size:16px; color:#e2e8f0;">Hi ${email},</p>
              <p>Thank you for registering with <strong>TILGroup Digital Securities</strong>.</p>
              <p>Your email has been verified. You now have access to the <strong>$5.5B Can Gio Port</strong> investment opportunity.</p>
              <p>Complete the executive protocol questionnaire, connect your Solana wallet, and review legal documents to begin investing.</p>
              <p style="margin-top:40px; font-size:14px;">— The TILGroup Digital Securities Team</p>
            </td>
          </tr>
          <tr>
            <td style="background:#072532; text-align:center; padding:20px; font-size:12px; color:#64748b;">
              © 2025 TILGroup Digital Securities. All rights reserved.<br>
              Ho Chi Minh City, Vietnam • Backed by MSC Group
            </td>
          </tr>
        </table>
      </body>
    </html>`;

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: [email],
      subject: '🎉 Welcome to TILGroup Digital Securities',
      html,
    });

    await supabaseAdmin
      .from('profiles')
      .update({
        welcome_email_status: 'sent',
        welcome_email_sent_at: new Date().toISOString(),
        welcome_email_provider_id: result.id,
        welcome_email_last_error: null,
      })
      .eq('id', userId);

    console.log('[WelcomeEmail] Sent to', email);
  } catch (error: any) {
    console.error('[WelcomeEmail] Failed to send:', error);

    await supabaseAdmin
      .from('profiles')
      .update({
        welcome_email_status: 'failed',
        welcome_email_last_error: error.message || 'Resend error',
      })
      .eq('id', userId);
  }
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const token = requestUrl.searchParams.get('token') ?? requestUrl.searchParams.get('token_hash');
  const type = requestUrl.searchParams.get('type') ?? 'signup';

  try {
    if (token && (type === 'signup' || type === 'email')) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

      const { data: { user }, error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'email',
      });

      if (error || !user) {
        throw error || new Error('Verification failed');
      }

      // Send welcome email after successful verification
      await sendWelcomeEmail(user.id);
    }

    return NextResponse.redirect(new URL('/signin?verified=true', requestUrl));
  } catch (error: any) {
    console.error('[AuthCallback] Error:', error.message || error);
    return NextResponse.redirect(new URL('/signin?verified=false&error=' + encodeURIComponent(error.message || 'failed'), requestUrl));
  }
}
