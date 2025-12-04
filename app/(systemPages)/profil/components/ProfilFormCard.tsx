"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { getInitials } from "@/app/(systemPages)/profil/lib/getInitials"
import { getFullName } from "@/app/(systemPages)/profil/lib/getFullName"

interface UserProfile {
  firstName?: string | null
  lastName?: string | null
  email?: string | null
  company?: string | null
  siret?: string | null
  phone?: string | null
  address?: string | null
  city?: string | null
  postalCode?: string | null
  website?: string | null
}

interface FormData {
  firstName: string
  lastName: string
  phone: string
  company: string
  siret: string
  address: string
  city: string
  postalCode: string
  website: string
}

interface ProfilFormCardProps {
  user: UserProfile | null
  formData: FormData
  isSaving: boolean
  message: { type: "success" | "error"; text: string } | null
  onFormDataChange: (formData: FormData) => void
  onSubmit: (e: React.FormEvent) => void
}

export const ProfilFormCard = ({
  user,
  formData,
  isSaving,
  message,
  onFormDataChange,
  onSubmit,
}: ProfilFormCardProps) => {

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-3xl">Mon Profil</CardTitle>
        <CardDescription>
          Vos informations personnelles et professionnelles
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-8">
          {/* Avatar et email (non modifiable) */}
          <div className="flex items-center gap-6 pb-6 border-b">
            <Avatar className="h-20 w-20 border-4 border-orange-200">
              <AvatarFallback className="bg-gradient-to-br from-orange-600 to-red-600 text-white text-2xl font-semibold">
                {getInitials({ firstName: user?.firstName, lastName: user?.lastName, email: user?.email })}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-semibold">
                {getFullName({ firstName: user?.firstName, lastName: user?.lastName })}
              </h2>
              <p className="text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          {/* Formulaire */}
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => onFormDataChange({ ...formData, firstName: e.target.value })}
                  placeholder="Votre prénom"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Nom</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => onFormDataChange({ ...formData, lastName: e.target.value })}
                  placeholder="Votre nom"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Entreprise</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => onFormDataChange({ ...formData, company: e.target.value })}
                  placeholder="Nom de votre entreprise"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="siret">SIRET (14 chiffres)</Label>
                <Input
                  id="siret"
                  value={formData.siret}
                  onChange={(e) => onFormDataChange({ ...formData, siret: e.target.value })}
                  placeholder="123 456 789 00012"
                  maxLength={17}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => onFormDataChange({ ...formData, phone: e.target.value })}
                  placeholder="06 12 34 56 78"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Adresse</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => onFormDataChange({ ...formData, address: e.target.value })}
                  placeholder="Numéro et rue"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="postalCode">Code postal</Label>
                <Input
                  id="postalCode"
                  value={formData.postalCode}
                  onChange={(e) => onFormDataChange({ ...formData, postalCode: e.target.value })}
                  placeholder="75001"
                  maxLength={5}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">Ville</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => onFormDataChange({ ...formData, city: e.target.value })}
                  placeholder="Paris"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="website">Site web</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => onFormDataChange({ ...formData, website: e.target.value })}
                  placeholder="https://www.exemple.fr"
                />
              </div>
            </div>
          </div>

          {/* Note informative */}
          <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Note :</strong> Les informations professionnelles sont utilisées dans les emails de résultats d'étude envoyés à vos clients. Assurez-vous qu'elles sont à jour pour une présentation professionnelle.
            </p>
          </div>

          {/* Message de succès/erreur */}
          {message && (
            <div
              className={`p-4 rounded-lg ${
                message.type === "success"
                  ? "bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200"
                  : "bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200"
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Bouton de sauvegarde */}
          <div className="flex justify-end pt-4 border-t">
            <Button
              type="submit"
              disabled={isSaving}
              className="bg-black hover:bg-gray-800 text-white"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                "Enregistrer les modifications"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
