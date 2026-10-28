import type { ReactNode } from "react"
import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Cartoonie",
  description: "A long animated movie that plays as you scroll.",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent" },
  icons: { apple: "/icon-192.png" },
}

type RootLayoutProps = {
  children: ReactNode
}

const RootLayout = ({ children }: RootLayoutProps) => {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Comic+Neue:wght@400;700&display=swap" />
      </head>
      <body>{children}</body>
    </html>
  )
}

export default RootLayout
