import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nova AI — Intelligent Chat Assistant",
  description:
    "Chat with Nova AI. A beautiful, fast, and intelligent chatbot powered by Llama 3.3 70B via Groq.",
  keywords: ["nova", "AI", "chatbot", "llama", "groq", "assistant"],
  openGraph: {
    title: "Nova AI — Chat Assistant",
    description: "Your intelligent AI assistant powered by Llama 3.3 70B",
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
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#06060e" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>✦</text></svg>" />
      </head>
      <body>{children}</body>
    </html>
  );
}
