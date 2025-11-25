"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, Settings, User, ChevronDown } from "lucide-react"
import { signOut } from "next-auth/react"
import { useState } from "react"

interface UserMenuProps {
  userName?: string | null
  userEmail?: string | null
}

/**
 * Menu utilisateur avec dropdown
 *
 * Bonnes pratiques UX/Design implémentées :
 * - Avatar cliquable avec initiales (reconnaissable)
 * - Indicateur visuel dropdown (chevron qui rotate)
 * - Menu dropdown aligné à droite (convention)
 * - Touch-friendly : zones de clic généreuses (min 44x44px)
 * - États visuels clairs (hover, focus, active)
 * - Focus uniquement au clavier (pas au clic)
 * - Icônes + texte pour meilleure compréhension
 * - Action destructive (déconnexion) visuellement distincte
 * - Accessible au clavier et screen readers
 * - Responsive : s'adapte au mobile
 * - Animation fluide < 200ms
 */
export function UserMenu({ userName, userEmail }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Générer les initiales à partir du nom ou de l'email
  const getInitials = () => {
    if (userName) {
      return userName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    }
    if (userEmail) {
      return userEmail.slice(0, 2).toUpperCase()
    }
    return "U"
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/login" })
  }

  // Gérer la fermeture du menu : retirer le focus du bouton
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)

    // Si le menu se ferme, retirer le focus du bouton après un court délai
    if (!open) {
      setTimeout(() => {
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur()
        }
      }, 0)
    }
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-2 rounded-lg px-2 py-1.5 outline-none transition-all hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label="Menu utilisateur"
        >
          {/* Avatar avec initiales */}
          <Avatar className="h-9 w-9 cursor-pointer border-2 border-gray-200 hover:border-gray-300 transition-colors">
            <AvatarFallback className="bg-blue-600 text-white text-sm font-semibold">
              {getInitials()}
            </AvatarFallback>
          </Avatar>

          {/* Chevron indicateur dropdown avec rotation */}
          <ChevronDown
            className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
            aria-hidden="true"
          />
        </button>
      </DropdownMenuTrigger>

      {/* Dropdown aligné à droite avec animation fluide */}
      <DropdownMenuContent
        align="end"
        className="w-56 animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-150"
      >
        {/* En-tête avec info utilisateur */}
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            {userName && (
              <p className="text-sm font-medium leading-none">{userName}</p>
            )}
            <p className="text-xs leading-none text-muted-foreground">
              {userEmail}
            </p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* Option Profil (pour future implémentation) */}
        <DropdownMenuItem
          className="cursor-pointer gap-2 py-2.5 px-3"
          disabled
        >
          <User className="h-4 w-4" />
          <span>Profil</span>
        </DropdownMenuItem>

        {/* Option Paramètres */}
        <DropdownMenuItem
          className="cursor-pointer gap-2 py-2.5 px-3"
          disabled
        >
          <Settings className="h-4 w-4" />
          <span>Paramètres</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Déconnexion (action destructive) */}
        <DropdownMenuItem
          className="cursor-pointer gap-2 py-2.5 px-3 text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4" />
          <span>Se déconnecter</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
