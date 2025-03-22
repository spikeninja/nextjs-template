import { QueryProvider } from "@/components/providers/query-provider"
import "./globals.css"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { ToastContainer } from "react-toastify"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: {
    template: "%s | PROJECT_NAME",
    default: "PROJECT_NAME",
  },
  description: "Some description",
  applicationName: "PROJECT_NAME",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>{children}</QueryProvider>
        <ToastContainer />
      </body>
    </html>
  )
}
