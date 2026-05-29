import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { email, firstName, userId } = await request.json();

    // Generate Supabase confirmation link
    const { data, error } = await supabase.auth.admin.generateLink({
      type: 'signup',
      email: email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`
      }
    });

    if (error) throw error;

    const confirmationLink = data.properties.confirmation_url;

    // Send with Resend
    await resend.emails.send({
      from: `TILGroup Digital Securities <noreply@${process.env.RESEND_DOMAIN}>`,
      to: [email],
      subject: 'Confirm your email address',
      html: `
        <h1>Welcome ${firstName || 'Investor'}!</h1>
        <p>Please confirm your email address to complete registration:</p>
        <a href="${confirmationLink}" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">Confirm Email</a>
        <p>Or copy this link: ${confirmationLink}</p>
        <p>This link expires in 24 hours.</p>
      `
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
