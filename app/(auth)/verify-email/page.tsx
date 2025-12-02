"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle2, XCircle, Mail } from "lucide-react";
import {
  verifyEmailToken,
  resendVerificationEmail,
} from "@/email/email-verification";

type Status = "verifying" | "success" | "error" | "resending" | "resent";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<Status>("verifying");
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");

  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setError("Token de vérification manquant");
      return;
    }

    verifyToken(token);
  }, [token]);

  const verifyToken = async (token: string) => {
    try {
      const result = await verifyEmailToken(token);

      if (result.error) {
        setStatus("error");
        setError(result.error);
      } else {
        setStatus("success");
        // Rediriger vers la page de connexion après 3 secondes
        setTimeout(() => {
          router.push("/");
        }, 3000);
      }
    } catch (error) {
      setStatus("error");
      setError("Une erreur s'est produite lors de la vérification");
    }
  };

  const handleResendEmail = async () => {
    if (!email) return;

    setStatus("resending");
    try {
      const result = await resendVerificationEmail(email);

      if (result.error) {
        setError(result.error);
        setStatus("error");
      } else {
        setError("");
        setStatus("resent");
      }
    } catch (error) {
      setError("Impossible de renvoyer l'email de vérification");
      setStatus("error");
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center p-4">
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
            {status === "resending" && (
              <Mail className="h-16 w-16 text-orange-600 animate-pulse" />
            )}
            {status === "resent" && (
              <CheckCircle2 className="h-16 w-16 text-green-600" />
            )}
          </div>

          <CardTitle className="text-2xl">
            {status === "verifying" && "Vérification en cours..."}
            {status === "success" && "Email vérifié !"}
            {status === "error" && "Erreur de vérification"}
            {status === "resending" && "Envoi en cours..."}
            {status === "resent" && "Email envoyé !"}
          </CardTitle>

          <CardDescription>
            {status === "verifying" &&
              "Veuillez patienter pendant que nous vérifions votre email"}
            {status === "success" &&
              "Votre adresse email a été vérifiée avec succès. Vous allez être redirigé vers la page de connexion."}
            {status === "error" && error}
            {status === "resending" &&
              "Envoi d'un nouveau lien de vérification..."}
            {status === "resent" &&
              "Un nouveau lien de vérification a été envoyé à votre adresse email. Vérifiez votre boîte de réception."}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {status === "success" && (
            <Button onClick={() => router.push("/")} className="w-full">
              Se connecter maintenant
            </Button>
          )}

          {(status === "error" || status === "resending" || status === "resent") &&
            error.includes("expiré") && (
              <div className="space-y-4">
                <Alert>
                  <AlertDescription>
                    Le lien de vérification a expiré. Entrez votre email pour
                    recevoir un nouveau lien.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <input
                    type="email"
                    placeholder="votre@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                  <Button
                    onClick={handleResendEmail}
                    className="w-full"
                    disabled={!email || status === "resending" || status === "resent"}
                  >
                    {status === "resending" && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Renvoyer l'email
                  </Button>
                </div>
              </div>
            )}

          {status === "error" && !error.includes("expiré") && (
            <Button
              onClick={() => router.push("/login")}
              variant="outline"
              className="w-full"
            >
              Retour à la connexion
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[calc(100vh-80px)] items-center justify-center p-4">
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
      <VerifyEmailContent />
    </Suspense>
  );
}
