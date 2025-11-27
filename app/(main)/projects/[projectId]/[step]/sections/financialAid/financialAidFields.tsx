import { Separator } from "@/components/ui/separator"
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { UseFormReturn } from "react-hook-form"
import { FinancialAidData } from "./financialAidSchema"
import { useEffect } from "react"
import { AidCalculator } from "@/components/AidCalculator"

interface AidesFieldsProps {
  form: UseFormReturn<FinancialAidData>
  // Données des étapes précédentes
  typePac?: string
  anneeConstruction?: number
  codePostal?: string
  surfaceHabitable?: number
  nombreOccupants?: number
}

export function AidesFields({
  form,
  typePac,
  anneeConstruction,
  codePostal,
  surfaceHabitable,
  nombreOccupants,
}: AidesFieldsProps) {
  const maPrimeRenov = form.watch("ma_prime_renov")
  const cee = form.watch("cee")
  const autresAides = form.watch("autres_aides")

  // Auto-calculate total_aides when any of the aids change
  useEffect(() => {
    const total = (maPrimeRenov || 0) + (cee || 0) + (autresAides || 0)
    form.setValue("total_aides", total)
  }, [maPrimeRenov, cee, autresAides])

  return (
    <div className="space-y-4">
      {/* Calculateur unifié pour les deux aides */}
      <div className="p-4 bg-brand-orange-100 border border-brand-orange-300 rounded-lg dark:bg-brand-orange-900/30 dark:border-brand-orange-700">
        <p className="text-sm mb-3">
          💡 Utilisez le calculateur ci-dessous pour vérifier votre éligibilité et obtenir une estimation automatique des montants MaPrimeRénov' et CEE.
        </p>
        <AidCalculator
          typePac={typePac}
          anneeConstruction={anneeConstruction}
          codePostal={codePostal}
          surfaceHabitable={surfaceHabitable}
          nombreOccupants={nombreOccupants}
          onUseAmounts={(maPrimeRenov, cee) => {
            form.setValue("ma_prime_renov", maPrimeRenov)
            form.setValue("cee", cee)
          }}
        />
      </div>

      <Separator />

      <FormField
        control={form.control}
        name="ma_prime_renov"
        render={({ field }) => (
          <FormItem>
            <FormLabel>MaPrimeRénov&apos; (€)</FormLabel>
            <FormControl>
              <Input
                type="number"
                min="0"
                {...field}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="cee"
        render={({ field }) => (
          <FormItem>
            <FormLabel>CEE (Certificats d&apos;Économies d&apos;Énergie) (€)</FormLabel>
            <FormControl>
              <Input
                type="number"
                min="0"
                {...field}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="autres_aides"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Autres aides (€)</FormLabel>
            <FormControl>
              <Input
                type="number"
                min="0"
                {...field}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            </FormControl>
            <FormDescription>
              Aides locales, régionales, etc.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <Separator />

      <div className="flex justify-between items-center py-4 px-4 bg-brand-orange-100 border border-brand-orange-300 rounded-lg dark:bg-brand-orange-900/30 dark:border-brand-orange-700">
        <span className="text-lg font-semibold">Total des aides</span>
        <span className="text-2xl font-bold">
          {((maPrimeRenov || 0) + (cee || 0) + (autresAides || 0)).toLocaleString('fr-FR')} €
        </span>
      </div>
    </div>
  )
}
