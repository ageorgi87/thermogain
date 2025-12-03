"use client"

import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { updateProfile } from "@/lib/actions/updateProfile"
import { changePassword } from "@/lib/actions/changePassword"
import { getProfile } from "@/lib/actions/getProfile"
import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"

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

export default function ProfilPage() {
  const { status } = useSession()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    company: "",
    siret: "",
    address: "",
    city: "",
    postalCode: "",
    website: "",
  })

  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Charger les données du profil depuis la base de données
  useEffect(() => {
    const loadProfile = async () => {
      setIsLoadingProfile(true)
      const result = await getProfile()

      if (result.success && result.data) {
        setUser(result.data)
        setFormData({
          firstName: result.data.firstName || "",
          lastName: result.data.lastName || "",
          phone: result.data.phone || "",
          company: result.data.company || "",
          siret: result.data.siret || "",
          address: result.data.address || "",
          city: result.data.city || "",
          postalCode: result.data.postalCode || "",
          website: result.data.website || "",
        })
      }

      setIsLoadingProfile(false)
    }

    if (status === "authenticated") {
      loadProfile()
    }
  }, [status])

  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return (user.firstName[0] + user.lastName[0]).toUpperCase()
    }
    if (user?.firstName) {
      return user.firstName.slice(0, 2).toUpperCase()
    }
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase()
    }
    return "U"
  }

  const getFullName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`
    }
    if (user?.firstName) {
      return user.firstName
    }
    return "Utilisateur"
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setMessage(null)

    const result = await updateProfile(formData)

    if (result.success) {
      setMessage({ type: "success", text: "Profil mis à jour avec succès" })
      // Recharger les données du profil depuis la base de données
      const profileResult = await getProfile()
      if (profileResult.success && profileResult.data) {
        setUser(profileResult.data)
      }
    } else {
      setMessage({ type: "error", text: result.error || "Une erreur est survenue" })
    }

    setIsSaving(false)
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsChangingPassword(true)
    setPasswordMessage(null)

    // Validation côté client
    if (passwordData.newPassword.length < 8) {
      setPasswordMessage({ type: "error", text: "Le mot de passe doit contenir au moins 8 caractères" })
      setIsChangingPassword(false)
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage({ type: "error", text: "Les mots de passe ne correspondent pas" })
      setIsChangingPassword(false)
      return
    }

    const result = await changePassword({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    })

    if (result.success) {
      setPasswordMessage({ type: "success", text: "Mot de passe modifié avec succès" })
      // Réinitialiser le formulaire
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } else {
      setPasswordMessage({ type: "error", text: result.error || "Une erreur est survenue" })
    }

    setIsChangingPassword(false)
  }

  if (status === "loading" || isLoadingProfile) {
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
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Mon Profil</CardTitle>
          <CardDescription>
            Vos informations personnelles et professionnelles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
          {/* Avatar et email (non modifiable) */}
          <div className="flex items-center gap-6 pb-6 border-b">
            <Avatar className="h-20 w-20 border-4 border-orange-200">
              <AvatarFallback className="bg-gradient-to-br from-orange-600 to-red-600 text-white text-2xl font-semibold">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-semibold">
                {getFullName()}
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
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="Votre prénom"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Nom</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Votre nom"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Entreprise</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="Nom de votre entreprise"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="siret">SIRET (14 chiffres)</Label>
                <Input
                  id="siret"
                  value={formData.siret}
                  onChange={(e) => setFormData({ ...formData, siret: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="06 12 34 56 78"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Adresse</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Numéro et rue"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="postalCode">Code postal</Label>
                <Input
                  id="postalCode"
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  placeholder="75001"
                  maxLength={5}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">Ville</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Paris"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="website">Site web</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
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

    {/* Section Changement de mot de passe */}
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-2xl">Sécurité</CardTitle>
        <CardDescription>
          Modifiez votre mot de passe
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handlePasswordChange} className="space-y-6">
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-1 max-w-md">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  placeholder="Votre mot de passe actuel"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  placeholder="Minimum 8 caractères"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  placeholder="Retapez le nouveau mot de passe"
                  required
                />
              </div>
            </div>
          </div>

          {/* Message de succès/erreur */}
          {passwordMessage && (
            <div
              className={`p-4 rounded-lg max-w-md ${
                passwordMessage.type === "success"
                  ? "bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200"
                  : "bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200"
              }`}
            >
              {passwordMessage.text}
            </div>
          )}

          {/* Bouton de sauvegarde */}
          <div className="flex justify-end pt-4 border-t">
            <Button
              type="submit"
              disabled={isChangingPassword}
              className="bg-black hover:bg-gray-800 text-white"
            >
              {isChangingPassword ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Modification...
                </>
              ) : (
                "Changer le mot de passe"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
    </>
  )
}
