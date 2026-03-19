import type { Metadata } from 'next'
import './globals.css'
import QueryProvider from '@/src/providers/QueryProvider'

export const metadata: Metadata = {
  title: 'SDD Navigator Dashboard',
  description: 'Visualization and analysis of specification coverage metrics',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  console.log('Rendering RootLayout')
  return (
    <html lang="en">
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  )
}
