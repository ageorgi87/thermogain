"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, TrendingDown, BarChart3, Calculator } from "lucide-react"
import { checkEmailExists, registerUser } from "@/lib/actions/auth"

type Step = "email" | "login" | "register"

export default function LoginPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>("email")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [company, setCompany] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const data = await checkEmailExists(email)

      if (data.exists) {
        setStep("login")
      } else {
        setStep("register")
      }
    } catch (error) {
      setError("Une erreur s'est produite. Veuillez réessayer.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Mot de passe invalide")
      } else {
        router.push("/")
        router.refresh()
      }
    } catch (error) {
      setError("Une erreur s'est produite. Veuillez réessayer.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      await registerUser({
        email,
        password,
        firstName,
        lastName,
        company,
      })

      // Auto login after registration
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Compte créé mais la connexion a échoué. Veuillez essayer de vous connecter.")
      } else {
        router.push("/")
        router.refresh()
      }
    } catch (error: any) {
      setError(error.message || "Une erreur s'est produite. Veuillez réessayer.")
    } finally {
      setIsLoading(false)
    }
  }

  const resetToEmail = () => {
    setStep("email")
    setPassword("")
    setFirstName("")
    setLastName("")
    setCompany("")
    setError("")
  }

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 lg:gap-12 items-center">

        {/* Left Section - Branding & Value Proposition */}
        <div className="space-y-8 text-center md:text-left order-2 md:order-1">
          {/* Logo & Brand Name */}
          <div className="flex items-center justify-center md:justify-start gap-4">
            <Image
              src="/logo.png"
              alt="ThermoGain"
              width={80}
              height={80}
              priority
              className="object-contain"
            />
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                ThermoGain
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Études thermiques intelligentes
              </p>
            </div>
          </div>

          {/* Professional Product Description */}
          <div className="space-y-4">
            <h2 className="text-2xl lg:text-3xl font-semibold text-foreground leading-tight">
              Transformez vos prospects en clients convaincus
            </h2>
            <p className="text-base lg:text-lg text-muted-foreground leading-relaxed">
              Un investissement de 15 000€ à 25 000€ dans une PAC peut freiner vos clients.
              ThermoGain vous permet de démontrer la rentabilité réelle de chaque projet avec des
              chiffres clairs, personnalisés et visuels qui rassurent et accélèrent la décision.
            </p>
          </div>

          {/* Key Features */}
          <div className="grid gap-4">
            <div className="flex items-start gap-3">
              <div className="mt-1 p-2 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <Calculator className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Analyses personnalisées et précises</h3>
                <p className="text-sm text-muted-foreground">
                  Calculs adaptés au logement, à la zone climatique et au chauffage actuel de chaque client
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-1 p-2 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Visualisations parlantes</h3>
                <p className="text-sm text-muted-foreground">
                  Graphiques et tableaux clairs montrant les économies réelles année après année
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-1 p-2 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <TrendingDown className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Données centralisées et accessibles</h3>
                <p className="text-sm text-muted-foreground">
                  Tous les projets sauvegardés, partageables instantanément pour concrétiser vos ventes
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - Login Card */}
        <Card className="w-full shadow-2xl border-2 order-1 md:order-2">
          <CardHeader className="space-y-4">
            <CardTitle className="text-2xl text-center">
              {step === "email" && "Bienvenue"}
              {step === "login" && "Bon retour"}
              {step === "register" && "Créez votre compte"}
            </CardTitle>
            <CardDescription className="text-center">
              {step === "email" && "Entrez votre adresse e-mail professionnelle pour commencer"}
              {step === "login" && "Entrez votre mot de passe pour accéder à votre espace"}
              {step === "register" && "Complétez votre profil pour créer votre compte professionnel"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {step === "email" && (
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Adresse e-mail professionnelle</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="vous@exemple.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    autoFocus
                    autoComplete="email"
                    className="h-11"
                  />
                </div>
                <Button type="submit" className="w-full h-11" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Continuer
                </Button>
              </form>
            )}

            {step === "login" && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label>Adresse e-mail</Label>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">{email}</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={resetToEmail}
                    >
                      Modifier
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    autoFocus
                    autoComplete="current-password"
                    className="h-11"
                  />
                </div>
                <Button type="submit" className="w-full h-11" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Se connecter
                </Button>
              </form>
            )}

            {step === "register" && (
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label>Adresse e-mail</Label>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">{email}</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={resetToEmail}
                    >
                      Modifier
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input
                      id="firstName"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      disabled={isLoading}
                      autoFocus
                      autoComplete="given-name"
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom</Label>
                    <Input
                      id="lastName"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      disabled={isLoading}
                      autoComplete="family-name"
                      className="h-11"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Entreprise (optionnel)</Label>
                  <Input
                    id="company"
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    disabled={isLoading}
                    placeholder="Nom de votre entreprise"
                    autoComplete="organization"
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registerPassword">Mot de passe</Label>
                  <Input
                    id="registerPassword"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    minLength={6}
                    autoComplete="new-password"
                    className="h-11"
                  />
                  <p className="text-xs text-muted-foreground">
                    Au moins 6 caractères
                  </p>
                </div>
                <Button type="submit" className="w-full h-11" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Créer mon compte
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
