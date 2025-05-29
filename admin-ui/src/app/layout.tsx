import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { Sidebar } from "@/components/sidebar";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: "Analytics Hub - Professional Analytics Platform",
  description: "Manage your analytics projects and track performance with our comprehensive dashboard",
  keywords: ["analytics", "dashboard", "tracking", "metrics", "insights"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} font-sans antialiased min-h-screen`}>
        <div className="flex h-screen overflow-hidden">
          {/* Sidebar */}
          <Sidebar className="fixed left-0 top-0 z-40 h-full md:relative md:z-auto" />
          
          {/* Main Content */}
          <div className="flex-1 main-content-mobile transition-all duration-300">
            <main className="main-content">
              {children}
            </main>
          </div>

          <Toaster 
            position="top-right"
            theme="light"
            className="toaster group"
            toastOptions={{
              classNames: {
                toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
                description: "group-[.toast]:text-muted-foreground",
                actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
                cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
              },
            }}
          />
        </div>
      </body>
    </html>
  );
}
