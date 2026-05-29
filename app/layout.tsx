import './globals.css';
import { Providers } from './providers';
import RealtimeInitializer from './components/Context/RealtimeInitializer';

export const metadata = {
  title: 'Tilgroup Digital Securities | Can Gio Port Security',
  description: 'Executive presale platform for Can Gio Port Digital Security offering - $5.5B digital asset issuance',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  themeColor: '#0a1f2f',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gradient-to-br from-[#0a1f2f] via-[#071526] to-[#0a1f2f] min-h-screen text-white antialiased">
        <Providers>
          <RealtimeInitializer />
          <main className="min-h-screen">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
