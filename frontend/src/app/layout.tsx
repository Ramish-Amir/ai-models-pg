import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { UserProvider } from "@/components/UserProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Model Playground",
  description: "Compare multiple AI models side-by-side in real-time",
  keywords: [
    "AI",
    "machine learning",
    "comparison",
    "GPT",
    "Claude",
    "playground",
  ],
  authors: [{ name: "AI Model Playground Team" }],
  viewport: "width=device-width, initial-scale=1",
};

/**
 * Root layout component for the AI Model Playground application.
 *
 * This layout provides:
 * - Global font configuration (Inter)
 * - Global CSS styles and Tailwind setup
 * - Toast notifications for user feedback
 * - SEO metadata and viewport configuration
 * - Responsive design foundation
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full bg-gray-50`}>
        <UserProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "#363636",
                color: "#fff",
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: "#10b981",
                  secondary: "#fff",
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: "#ef4444",
                  secondary: "#fff",
                },
              },
            }}
          />
        </UserProvider>
      </body>
    </html>
  );
}
