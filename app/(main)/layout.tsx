import { auth } from "@/lib/auth";
import { Header } from "@/components/Header/Header";
import { Footer } from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // No auth redirect here - protection is handled at route level:
  // - Project routes: verifyProjectAccess (allows orphan projects)
  // - Dashboard/Profil: client-side redirect or server action protection

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 dark:from-gray-900 dark:to-gray-800 flex flex-col">
      <Header session={session} />
      <main className="flex-1 container mx-auto px-4 py-8">{children}</main>
      <Footer />
    </div>
  );
}
