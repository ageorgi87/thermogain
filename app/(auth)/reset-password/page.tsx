"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle2, XCircle, Eye, EyeOff } from "lucide-react";
import { verifyResetToken, resetPassword } from "@/lib/actions/password-reset";

type Status = "verifying" | "idle" | "loading" | "success" | "error";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<Status>("verifying");
  const [error, setError] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setError("Token de réinitialisation manquant");
      return;
    }

    verifyToken(token);
  }, [token]);

  const verifyToken = async (token: string) => {
    try {
      const result = await verifyResetToken(token);

      if (result.error) {
        setStatus("error");
        setError(result.error);
      } else {
        setStatus("idle");
      }
    } catch (error) {
      setStatus("error");
      setError("Une erreur s'est produite lors de la vérification");
    }
  };

  const validatePassword = (password: string, confirm: string) => {
    if (password.length < 6) {
      setPasswordError("Le mot de passe doit contenir au moins 6 caractères");
      return false;
    }
    if (password !== confirm) {
      setPasswordError("Les mots de passe ne correspondent pas");
      return false;
    }
    setPasswordError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePassword(newPassword, confirmPassword)) {
      return;
    }

    if (!token) {
      setError("Token manquant");
      return;
    }

    setStatus("loading");
    setError("");

    try {
      const result = await resetPassword(token, newPassword);

      if (result.error) {
        setError(result.error);
        setStatus("idle");
      } else {
        setStatus("success");
        // Rediriger vers la page de connexion après 3 secondes
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      }
    } catch (error: any) {
      setError(
        error.message || "Une erreur s'est produite. Veuillez réessayer."
      );
      setStatus("idle");
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      {/* Logo and Site Name */}
      <Link href="/login" className="flex items-center gap-3 mb-12 hover:opacity-80 transition-opacity">
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

      <Card className="w-full max-w-md shadow-2xl border-2">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto">
            {status === "verifying" && (
              <Loader2 className="h-16 w-16 animate-spin text-orange-600" />
            )}
            {status === "success" && (
              <CheckCircle2 className="h-16 w-16 text-green-600" />
            )}
            {status === "error" && (
              <XCircle className="h-16 w-16 text-red-600" />
            )}
          </div>

          <CardTitle className="text-2xl">
            {status === "verifying" && "Vérification en cours..."}
            {status === "idle" && "Nouveau mot de passe"}
            {status === "loading" && "Réinitialisation..."}
            {status === "success" && "Mot de passe réinitialisé !"}
            {status === "error" && "Erreur"}
          </CardTitle>

          <CardDescription>
            {status === "verifying" &&
              "Veuillez patienter pendant que nous vérifions votre lien"}
            {status === "idle" &&
              "Choisissez un nouveau mot de passe sécurisé pour votre compte"}
            {status === "loading" &&
              "Mise à jour de votre mot de passe en cours..."}
            {status === "success" &&
              "Votre mot de passe a été réinitialisé avec succès. Vous allez être redirigé vers la page de connexion."}
            {status === "error" && error}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {status === "success" && (
            <Button onClick={() => router.push("/login")} className="w-full">
              Se connecter maintenant
            </Button>
          )}

          {status === "idle" && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (confirmPassword) {
                        validatePassword(e.target.value, confirmPassword);
                      }
                    }}
                    required
                    minLength={6}
                    autoFocus
                    autoComplete="new-password"
                    className="h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Au moins 6 caractères
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  Confirmer le mot de passe
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      validatePassword(newPassword, e.target.value);
                    }}
                    required
                    autoComplete="new-password"
                    className="h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {passwordError && (
                <Alert variant="destructive">
                  <AlertDescription>{passwordError}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full h-11"
                disabled={
                  status === "loading" ||
                  !newPassword ||
                  !confirmPassword ||
                  !!passwordError
                }
              >
                {status === "loading" && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Réinitialiser le mot de passe
              </Button>
            </form>
          )}

          {status === "loading" && (
            <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-950">
              <Loader2 className="h-4 w-4 text-orange-600 animate-spin" />
              <AlertDescription className="text-sm">
                Mise à jour de votre mot de passe...
              </AlertDescription>
            </Alert>
          )}

          {status === "error" && (
            <div className="space-y-2">
              <Button
                onClick={() => router.push("/forgot-password")}
                className="w-full"
              >
                Demander un nouveau lien
              </Button>
              <Link
                href="/login"
                className="block text-center text-sm text-muted-foreground hover:text-foreground"
              >
                Retour à la connexion
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
          <Link href="/login" className="flex items-center gap-3 mb-12 hover:opacity-80 transition-opacity">
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
          <Card className="w-full max-w-md shadow-2xl border-2">
            <CardHeader className="space-y-4 text-center">
              <div className="mx-auto">
                <Loader2 className="h-16 w-16 animate-spin text-orange-600" />
              </div>
              <CardTitle className="text-2xl">Chargement...</CardTitle>
            </CardHeader>
          </Card>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
