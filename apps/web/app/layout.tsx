import { Outfit } from "next/font/google";
import "./globals.css";
import { ClientProviders } from "@/components/providers/ClientProviders";
import { auth } from "@/auth";
import { Toaster } from "react-hot-toast";
import { SearchProvider } from "@/components/providers/SearchProvider";
import { OpportunityDrawerProvider } from "@/components/features/opportunities/OpportunityDrawerProvider";
import { OrganizationDrawerProvider } from "@/components/features/organization/OrganizationDrawerProvider";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata = {
  title: "Kindora - Professional Volunteer Platform",
  description:
    "Empowering communities through meaningful connections and impactful volunteering.",
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

  const session = rawSession ? JSON.parse(JSON.stringify(rawSession)) : null;

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${outfit.className} `} suppressHydrationWarning>
        <ClientProviders session={session}>
          <SearchProvider>
            <OpportunityDrawerProvider>
              <OrganizationDrawerProvider>
                {children}
                <Toaster position="top-center" />
              </OrganizationDrawerProvider>
            </OpportunityDrawerProvider>
          </SearchProvider>
        </ClientProviders>
      </body>
    </html>
  );
}
