'use client';
import { useState } from 'react';
import { Send } from 'lucide-react';

export default function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState<'idle'|'sending'|'success'|'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setStatus('success');
        setForm({ name: '', email: '', subject: '', message: '' });
        setTimeout(() => setStatus('idle'), 3000);
      } else throw new Error();
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  return (
    <div className="bg-slate-900/50 rounded-xl p-6 border border-cyan-500/20">
      <h3 className="text-lg font-semibold text-white mb-4">Contact Support</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" placeholder="Your Name" required
          value={form.name} onChange={e => setForm({...form, name: e.target.value})}
          className="w-full p-3 rounded-lg bg-[#0a2f3d]/50 border border-cyan-500/30 text-white" />
        <input type="email" placeholder="Email Address" required
          value={form.email} onChange={e => setForm({...form, email: e.target.value})}
          className="w-full p-3 rounded-lg bg-[#0a2f3d]/50 border border-cyan-500/30 text-white" />
        <input type="text" placeholder="Subject" required
          value={form.subject} onChange={e => setForm({...form, subject: e.target.value})}
          className="w-full p-3 rounded-lg bg-[#0a2f3d]/50 border border-cyan-500/30 text-white" />
        <textarea rows={4} placeholder="Your message..." required
          value={form.message} onChange={e => setForm({...form, message: e.target.value})}
          className="w-full p-3 rounded-lg bg-[#0a2f3d]/50 border border-cyan-500/30 text-white" />
        <button type="submit" disabled={status === 'sending'}
          className="w-full bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-700 hover:to-emerald-700 text-white p-3 rounded-lg font-medium flex items-center justify-center gap-2">
          {status === 'sending' ? 'Sending...' : status === 'success' ? 'Sent! ✓' : status === 'error' ? 'Failed, try again' : <><Send size={18}/> Send Message</>}
        </button>
      </form>
    </div>
  );
}
