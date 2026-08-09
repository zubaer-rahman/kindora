import { Outfit } from "next/font/google";
import "./globals.css";
import { ClientProviders } from "@/config/ClientProviders";
import { auth } from "@/auth";
import { Toaster } from "react-hot-toast";
import { SearchProvider } from "@/contexts/SearchContext";
import { OpportunityDrawerProvider } from "@/components/common/OpportunityDrawerProvider";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata = {
  title: "Kindora - Professional Volunteer Platform",
  description: "Empowering communities through meaningful connections and impactful volunteering.",
  icons: {
    icon: "/icons/favicon.ico",
    apple: "/icons/favicon.ico",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const rawSession = await auth();

  // Serialize session to plain JSON to avoid "Objects with toJSON methods" error
  const session = rawSession ? JSON.parse(JSON.stringify(rawSession)) : null;

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${outfit.className} `} suppressHydrationWarning>
        <ClientProviders session={session}>
          <SearchProvider>
            <OpportunityDrawerProvider>
              {children}
              <Toaster position="top-center" />
            </OpportunityDrawerProvider>
          </SearchProvider>
        </ClientProviders>
      </body>
    </html>
  );
}
