import type { Metadata } from 'next'
import { Cairo } from 'next/font/google'
import './globals.css'

const cairo = Cairo({ subsets: ['arabic', 'latin'], variable: '--font-cairo' })

export const metadata: Metadata = {
  title: 'TaskAI — مدير المهام الذكي',
  description: 'إدارة المهام المدعومة بالذكاء الاصطناعي',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
              navigator.serviceWorker.register('/sw.js').then(
                function(reg) { console.log('SW registered:', reg.scope); },
                function(err) { console.log('SW failed:', err); }
              );
            });
          }
        `}} />
      </head>
      <body className="font-cairo">{children}</body>
    </html>
  )
}
