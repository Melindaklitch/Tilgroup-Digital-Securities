// app/api/contact/route.ts
import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export const runtime = 'edge';


const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {

    const resend = new Resend(process.env.RESEND_API_KEY);
    const { name, email, subject, message } = await request.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'All fields required' }, { status: 400 });
    }

    // Send to support team
    await resend.emails.send({
      from: 'TILGroup Contact <contact@tilgroup.live>',
      to: ['support@tilgroup.live'], // Change to your support email
      replyTo: email,
      subject: `[Contact] ${subject}`,
      html: `<p><strong>From:</strong> ${name} (${email})</p><p><strong>Message:</strong><br>${message.replace(/\n/g, '<br>')}</p>`,
    });

    // Auto-reply to user
    await resend.emails.send({
      from: 'TILGroup Support <support@tilgroup.live>',
      to: [email],
      subject: 'We received your message',
      html: `<p>Thank you, ${name}. We will respond within 24 hours.</p>`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send' }, { status: 500 });
  }
}
