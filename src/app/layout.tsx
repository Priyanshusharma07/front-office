import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import "./globals.css";
import Providers from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BrokerageX CRM - Auto Private Reply",
  description: "Automate your Instagram interactions with precision.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const attr = 'bis_skin_checked';
                const removeAttr = (node) => {
                  if (node.nodeType === 1) {
                    if (node.hasAttribute(attr)) node.removeAttribute(attr);
                    node.querySelectorAll('[' + attr + ']').forEach(el => el.removeAttribute(attr));
                  }
                };
                const observer = new MutationObserver((mutations) => {
                  mutations.forEach((mutation) => {
                    mutation.addedNodes.forEach(removeAttr);
                  });
                });
                observer.observe(document.documentElement, { childList: true, subtree: true });
                document.addEventListener('DOMContentLoaded', () => removeAttr(document.body));
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <AntdRegistry>
          <Providers>{children}</Providers>
        </AntdRegistry>
      </body>
    </html>
  );
}


