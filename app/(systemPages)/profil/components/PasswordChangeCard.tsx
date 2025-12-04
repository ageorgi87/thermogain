"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

interface PasswordData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

interface PasswordChangeCardProps {
  passwordData: PasswordData
  isChangingPassword: boolean
  passwordMessage: { type: "success" | "error"; text: string } | null
  onPasswordDataChange: (passwordData: PasswordData) => void
  onSubmit: (e: React.FormEvent) => void
}

export const PasswordChangeCard = ({
  passwordData,
  isChangingPassword,
  passwordMessage,
  onPasswordDataChange,
  onSubmit,
}: PasswordChangeCardProps) => {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-2xl">Sécurité</CardTitle>
        <CardDescription>
          Modifiez votre mot de passe
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-1 max-w-md">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => onPasswordDataChange({ ...passwordData, currentPassword: e.target.value })}
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
                  onChange={(e) => onPasswordDataChange({ ...passwordData, newPassword: e.target.value })}
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
                  onChange={(e) => onPasswordDataChange({ ...passwordData, confirmPassword: e.target.value })}
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
  )
}
