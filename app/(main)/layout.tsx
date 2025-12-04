import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { UserMenu } from "@/components/UserMenu";
import { Footer } from "@/components/Footer";
import { BackToProjectsButton } from "@/app/(main)/[projectId]/(step)/components/BackToProjectsButton";
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

  if (!session) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 dark:from-gray-900 dark:to-gray-800 flex flex-col">
      <nav className="border-b bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/dashboard"
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
            <div className="flex items-center gap-4">
              <BackToProjectsButton />
              <UserMenu
                userName={session.user?.name}
                userEmail={session.user?.email}
              />
            </div>
          </div>
        </div>
      </nav>
      <main className="flex-1 container mx-auto px-4 py-8">{children}</main>
      <Footer />
    </div>
  );
}
