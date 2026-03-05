import './globals.css'
import type { Metadata } from 'next'
import { Sora, DM_Mono } from 'next/font/google'

// Configurando as fontes originais do seu design
const sora = Sora({ 
  subsets: ['latin'], 
  variable: '--sans',
  weight: ['300', '400', '500', '600', '700', '800'] 
})

const dmMono = DM_Mono({ 
  subsets: ['latin'], 
  variable: '--mono',
  weight: ['400', '500'] 
})

export const metadata: Metadata = {
  title: 'MEI 360 OS',
  description: 'Sistema Operacional para MEI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-br" className={`${sora.variable} ${dmMono.variable}`}>
      <body>{children}</body>
    </html>
  )
}