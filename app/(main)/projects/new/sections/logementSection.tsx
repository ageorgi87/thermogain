import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { UseFormReturn } from "react-hook-form"
import { HeatingFormData } from "@/lib/schemas/heating-form"

interface LogementSectionProps {
  form: UseFormReturn<HeatingFormData>
}

export function LogementSection({ form }: LogementSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Informations sur le logement</CardTitle>
        <CardDescription>
          Caractéristiques principales de votre habitation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="logement.departement"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Département</FormLabel>
              <FormControl>
                <Input placeholder="ex: 75" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="logement.annee_construction"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Année de construction</FormLabel>
                <FormControl>
                  <Input
                    type="number"
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
            name="logement.surface_habitable"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Surface habitable (m²)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="logement.nombre_occupants"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre d&apos;occupants</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-3">
          <FormLabel>Isolation et équipements</FormLabel>
          <FormField
            control={form.control}
            name="logement.isolation_murs"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="font-normal">
                  Isolation des murs
                </FormLabel>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="logement.isolation_combles"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="font-normal">
                  Isolation des combles
                </FormLabel>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="logement.double_vitrage"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="font-normal">
                  Double vitrage
                </FormLabel>
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  )
}
