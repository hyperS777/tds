import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gemini Chatbot — AI Assistant",
  description:
    "Chat with Google Gemini AI. A beautiful, fast, and intelligent chatbot powered by Gemini 2.0 Flash.",
  keywords: ["gemini", "chatbot", "AI", "google", "assistant"],
  openGraph: {
    title: "Gemini Chatbot",
    description: "Chat with Google Gemini AI",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>✨</text></svg>" />
      </head>
      <body>{children}</body>
    </html>
  );
}
