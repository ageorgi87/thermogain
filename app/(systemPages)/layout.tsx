import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Footer } from "@/components/Footer";
import { UserMenu } from "@/components/UserMenu";
import { auth } from "@/lib/auth";
import { BackToProjectsButton } from "@/app/(main)/[projectId]/(step)/components/BackToProjectsButton";

export default async function FooterPagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 dark:from-gray-900 dark:to-gray-800 flex flex-col">
        {/* Header Navigation */}
        <nav className="border-b bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link
                href={session ? "/dashboard" : "/"}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                <Image
                  src="/logo.png"
                  alt="ThermoGain"
                  width={48}
                  height={48}
                  className="object-contain"
                />
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                    ThermoGain
                  </h1>
                  <p className="text-xs text-muted-foreground">
                    Études thermiques intelligentes
                  </p>
                </div>
              </Link>
              {session && (
                <div className="flex items-center gap-4">
                  <BackToProjectsButton />
                  <UserMenu
                    userName={session.user?.name}
                    userEmail={session.user?.email}
                  />
                </div>
              )}
            </div>
          </div>
        </nav>

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
