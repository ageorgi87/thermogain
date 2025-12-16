import { UserMenu } from "@/components/UserMenu";
import { BackToProjectsButton } from "@/app/(main)/[projectId]/(step)/components/BackToProjectsButton";
import { LogoLink } from "./LogoLink";
import { RegisterButton } from "./RegisterButton";

interface HeaderProps {
  session: {
    user?: {
      id?: string;
      name?: string | null;
      email?: string | null;
    } | null;
  } | null;
  showUserMenu?: boolean;
}

/**
 * Header réutilisable pour toute l'application
 *
 * @param session - Session utilisateur (peut être null pour pages publiques)
 * @param showUserMenu - Afficher le menu utilisateur (par défaut: true si session existe)
 */
export const Header = ({ session }: HeaderProps) => {
  const isRegisterButtonDisplayed = false;
  const hasSession = !!session;

  return (
    <nav className="border-b bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <LogoLink />

          {hasSession && (
            <div className="flex items-center gap-4">
              {isRegisterButtonDisplayed ? (
                <RegisterButton />
              ) : (
                <>
                  <BackToProjectsButton />
                  <UserMenu
                    userName={session.user?.name}
                    userEmail={session.user?.email}
                  />
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
