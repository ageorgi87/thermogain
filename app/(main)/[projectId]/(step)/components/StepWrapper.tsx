"use client"

import { ReactNode, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, ArrowRight, ChevronDown, ChevronUp, Info, Loader2 } from "lucide-react"

interface StepWrapperProps {
  title: string
  description: string
  stepNumber: number
  totalSteps: number
  explanation?: string
  isLastStep: boolean
  isSubmitting: boolean
  onPrevious: () => void
  onNext: () => void
  children: ReactNode
}

/**
 * Composant wrapper pour les étapes du wizard
 * Gère l'UI interactive : header, progression, explication, navigation
 */
export const StepWrapper = ({
  title,
  description,
  stepNumber,
  totalSteps,
  explanation,
  isLastStep,
  isSubmitting,
  onPrevious,
  onNext,
  children,
}: StepWrapperProps) => {
  const [showExplanation, setShowExplanation] = useState(false)

  return (
    <>
      {/* Header Card */}
      <Card className="shadow-2xl border-2 mb-8">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold">{title}</h1>
              <p className="text-muted-foreground mt-2">{description}</p>
            </div>
            <div className="text-sm text-muted-foreground ml-4 whitespace-nowrap">
              Étape {stepNumber} / {totalSteps}
            </div>
          </div>

          {/* Help button */}
          {explanation && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowExplanation(!showExplanation)}
              className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-950 mb-4 -ml-2"
            >
              <Info className="h-4 w-4 mr-2" />
              Pourquoi ces informations ?
              {showExplanation ? (
                <ChevronUp className="h-4 w-4 ml-2" />
              ) : (
                <ChevronDown className="h-4 w-4 ml-2" />
              )}
            </Button>
          )}

          {/* Collapsible explanation */}
          {showExplanation && explanation && (
            <div className="mb-4 p-4 bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg animate-in slide-in-from-top-2 duration-200">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-foreground flex-1">{explanation}</p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowExplanation(false)}
                  className="h-6 w-6 p-0 hover:bg-orange-100 dark:hover:bg-orange-900"
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Progress bar */}
          <div className="w-full bg-secondary rounded-full h-2">
            <div
              className="bg-foreground h-2 rounded-full transition-all"
              style={{
                width: `${(stepNumber / totalSteps) * 100}%`,
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Form Content */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          onNext()
        }}
        className="space-y-8"
      >
        <Card className="shadow-2xl border-2">
          <CardContent className="pt-6">{children}</CardContent>
        </Card>

        {/* Navigation buttons */}
        <div className="flex justify-between gap-4">
          <Button type="button" variant="outline" onClick={onPrevious}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {stepNumber === 1 ? "Annuler" : "Précédent"}
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLastStep ? (
              "Calculer les résultats"
            ) : (
              <>
                Suivant
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </form>
    </>
  )
}
