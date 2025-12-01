"use client"

import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Mail, Building2, MapPin, Phone, Globe, User } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface ExtendedUser {
  name?: string | null
  email?: string | null
  company?: string | null
  phone?: string | null
  address?: string | null
  city?: string | null
  postalCode?: string | null
  website?: string | null
}

export default function ProfilPage() {
  const { data: session, status } = useSession()
  const user = session?.user as ExtendedUser | undefined

  const getInitials = () => {
    if (user?.name) {
      return user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    }
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase()
    }
    return "U"
  }

  if (status === "loading") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Mon Profil</CardTitle>
          <CardDescription>
            Vos informations personnelles et professionnelles
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-60" />
            </div>
          </div>
          <Skeleton className="h-40 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-3xl">Mon Profil</CardTitle>
        <CardDescription>
          Vos informations personnelles et professionnelles
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Avatar et nom */}
        <div className="flex items-center gap-6">
          <Avatar className="h-20 w-20 border-4 border-orange-200">
            <AvatarFallback className="bg-gradient-to-br from-orange-600 to-red-600 text-white text-2xl font-semibold">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl font-semibold">
              {user?.name || "Utilisateur"}
            </h2>
            <p className="text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        {/* Informations personnelles */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-orange-600" />
            Informations personnelles
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
              <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="text-sm">{user?.email || "Non renseigné"}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
              <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Téléphone</p>
                <p className="text-sm">{user?.phone || "Non renseigné"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Informations professionnelles */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-orange-600" />
            Informations professionnelles
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
              <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Entreprise</p>
                <p className="text-sm">{user?.company || "Non renseigné"}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="w-full">
                <p className="text-sm font-medium text-muted-foreground mb-2">Adresse</p>
                <div className="space-y-1.5">
                  <p className="text-sm">{user?.address || "Non renseigné"}</p>
                  <div className="flex gap-2 text-sm text-muted-foreground">
                    <span>{user?.postalCode || "---"}</span>
                    <span>{user?.city || "---"}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
              <Globe className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Site web</p>
                <p className="text-sm">
                  {user?.website ? (
                    <a
                      href={user.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {user.website}
                    </a>
                  ) : (
                    "Non renseigné"
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Note informative */}
        <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Note :</strong> Les informations professionnelles sont utilisées dans les emails de résultats d'étude envoyés à vos clients. Assurez-vous qu'elles sont à jour pour une présentation professionnelle.
          </p>
        </div>

        {/* Informations sur la modification */}
        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            Pour modifier vos informations, veuillez contacter le support à{" "}
            <a href="mailto:contact@thermogain.fr" className="text-primary hover:underline">
              contact@thermogain.fr
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
