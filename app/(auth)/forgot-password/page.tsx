"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
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
import { Loader2, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { requestPasswordReset } from "@/lib/actions/password-reset";

type Status = "idle" | "loading" | "success";

function ForgotPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<Status>("idle");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  // Pré-remplir l'email depuis l'URL
  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setError("");

    try {
      const result = await requestPasswordReset(email);

      if (result.success) {
        setStatus("success");
      } else {
        setError("Une erreur s'est produite. Veuillez réessayer.");
        setStatus("idle");
      }
    } catch (error: any) {
      setError(
        error.message || "Une erreur s'est produite. Veuillez réessayer."
      );
      setStatus("idle");
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-2">
        <CardHeader className="space-y-4">
          {status === "success" ? (
            <>
              <div className="mx-auto">
                <CheckCircle2 className="h-16 w-16 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-center">
                Email envoyé !
              </CardTitle>
              <CardDescription className="text-center">
                Si cette adresse email existe, vous recevrez un lien de
                réinitialisation dans quelques instants.
              </CardDescription>
            </>
          ) : (
            <>
              <CardTitle className="text-2xl text-center">
                Mot de passe oublié ?
              </CardTitle>
              <CardDescription className="text-center">
                Entrez votre adresse email et nous vous enverrons un lien pour
                réinitialiser votre mot de passe
              </CardDescription>
            </>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {status === "success" ? (
            <>
              <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-950">
                <Mail className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-sm">
                  <strong>Vérifiez votre boîte de réception</strong>
                  <br />
                  Cliquez sur le lien dans l'email pour réinitialiser votre mot
                  de passe. Le lien expire dans 1 heure.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Button
                  onClick={() => router.push("/login")}
                  className="w-full"
                >
                  Retour à la connexion
                </Button>

                <Button
                  onClick={() => {
                    setStatus("idle");
                    setEmail("");
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Renvoyer un email
                </Button>
              </div>
            </>
          ) : (
            <>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Adresse email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="vous@exemple.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={status === "loading"}
                    autoFocus
                    autoComplete="email"
                    className="h-11"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-11"
                  disabled={status === "loading" || !email}
                >
                  {status === "loading" && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Envoyer le lien de réinitialisation
                </Button>
              </form>

              <div className="text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Retour à la connexion
                </Link>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function ForgotPasswordPage() {
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
      <ForgotPasswordContent />
    </Suspense>
  );
}
