import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

export const runtime = 'edge';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const RESEND_API_KEY = process.env.RESEND_API_KEY!;
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || `TILGroup Digital Securities <noreply@${process.env.RESEND_DOMAIN}>`;

const WELCOME_EMAIL_SUBJECT = '🎉 Welcome to TILGroup Digital Securities';

function buildWelcomeEmailHtml(firstName: string) {
  return `<!DOCTYPE html>
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
            <p style="font-size:16px; color:#e2e8f0;">Hi ${firstName},</p>
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
}

export async function POST(request: NextRequest) {
  // 1. Authenticate the caller using Supabase JWT
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ sent: false, error: 'UNAUTHORIZED' }, { status: 401 });
  }

  const token = authHeader.replace('Bearer ', '');
  const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ sent: false, error: 'UNAUTHORIZED' }, { status: 401 });
  }

  // 2. Use admin client for atomic DB operations and authoritative profile lookup
  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  // 3. Load authoritative profile data, ignoring any client-supplied fields
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('id, email, first_name, last_name, company_name, user_tier')
    .eq('id', user.id)
    .single();

  if (profileError || !profile?.email) {
    return NextResponse.json({ sent: false, error: 'PROFILE_NOT_FOUND' }, { status: 500 });
  }

  const firstName = profile.first_name || profile.last_name || profile.company_name || 'Investor';
  const recipientEmail = profile.email;
  const userTier = profile.user_tier || 'priority';

  // 4. Atomically claim the send using welcome_email_status
  //    If status is already 'sent' or 'sending' (and not stale), do nothing.
  const { data: claimedProfiles, error: claimError } = await supabaseAdmin
    .from('profiles')
    .update({
      welcome_email_status: 'sending',
      welcome_email_last_error: null,
    })
    .eq('id', user.id)
    .in('welcome_email_status', ['not_sent', 'failed'])  // only claim from not_sent or failed
    .select('id');

  if (claimError) {
    console.error('[WelcomeEmail] Claim error:', claimError);
    return NextResponse.json({ sent: false, error: 'CLAIM_FAILED' }, { status: 500 });
  }

  if (!claimedProfiles || claimedProfiles.length === 0) {
    // Already sent or currently being sent by another request
    return NextResponse.json({ sent: false, reason: 'already_sent' });
  }

  // 5. Send email via Resend
  const resend = new Resend(RESEND_API_KEY);
  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: [recipientEmail],
      subject: WELCOME_EMAIL_SUBJECT,
      html: buildWelcomeEmailHtml(firstName),
    });

    // 6. On success, mark as sent
    await supabaseAdmin
      .from('profiles')
      .update({
        welcome_email_status: 'sent',
        welcome_email_sent_at: new Date().toISOString(),
        welcome_email_provider_id: result.id,
      })
      .eq('id', user.id);

    return NextResponse.json({ sent: true, emailId: result.id });
  } catch (error: any) {
    console.error('[WelcomeEmail] Resend error:', error);

    // 7. On failure, mark as failed (so it can be retried later)
    await supabaseAdmin
      .from('profiles')
      .update({
        welcome_email_status: 'failed',
        welcome_email_last_error: error.message || 'Resend error',
      })
      .eq('id', user.id);

    return NextResponse.json({ sent: false, error: 'EMAIL_FAILED' }, { status: 500 });
  }
}
