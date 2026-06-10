import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const YOUR_EMAIL = 'melindaklitch92@gmail.com';

export async function POST(request: NextRequest) {
  try {
    const event = await request.json();

    if (event.type === 'email.received') {
      const { from, to, subject, html, text } = event.data;
      
      // Forward to your personal email
      await resend.emails.send({
        from: `Forwarded <noreply@tilgroup.live>`,
        to: [YOUR_EMAIL],
        subject: `[${to}] ${subject}`,
        html: `
          <p><strong>From:</strong> ${from}</p>
          <p><strong>To:</strong> ${to}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <hr/>
          ${html || text || '<p>No content</p>'}
          <hr/>
          <p style="color: #666; font-size: 12px;">Forwarded from Resend Inbound</p>
        `,
      });
      
      console.log(`[Webhook] Forwarded email from ${from} to ${YOUR_EMAIL}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[Webhook] Error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
