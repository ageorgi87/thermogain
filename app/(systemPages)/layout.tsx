import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header/Header";
import { auth } from "@/lib/auth";

export default async function FooterPagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 dark:from-gray-900 dark:to-gray-800 flex flex-col">
        <Header session={session} />

        <div className="flex-1">
          <div className="container mx-auto py-8 max-w-4xl px-4">
            {/* Back Button */}
            <div className="mb-6">
              <Link href={session ? "/dashboard" : "/"}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Retour à l'accueil
                </Button>
              </Link>
            </div>

            {/* Page Content */}
            {children}
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}
