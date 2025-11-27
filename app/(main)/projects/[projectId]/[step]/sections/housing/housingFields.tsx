import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { UseFormReturn } from "react-hook-form"
import { HousingData } from "./housingSchema"

interface HousingFieldsProps {
  form: UseFormReturn<HousingData>
}

export function HousingFields({ form }: HousingFieldsProps) {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="code_postal"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Code postal *</FormLabel>
            <FormControl>
              <Input
                placeholder="ex: 75001, 20000, 97400"
                maxLength={5}
                {...field}
              />
            </FormControl>
            <FormDescription>
              Code postal français (métropole, Corse, DOM-TOM)
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="annee_construction"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Année de construction *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  value={field.value === 0 ? "" : field.value}
                  onChange={(e) => {
                    const value = e.target.value
                    field.onChange(value === "" ? 0 : Number(value))
                  }}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="surface_habitable"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Surface habitable (m²) *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  value={field.value === 0 ? "" : field.value}
                  onChange={(e) => {
                    const value = e.target.value
                    field.onChange(value === "" ? 0 : Number(value))
                  }}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="nombre_occupants"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nombre d&apos;occupants *</FormLabel>
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
        name="qualite_isolation"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Qualité globale de l&apos;isolation *</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez la qualité de l'isolation" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="Mauvaise">
                  Mauvaise - Aucune isolation ou isolation minimale
                </SelectItem>
                <SelectItem value="Moyenne">
                  Moyenne - Isolation partielle (quelques éléments isolés)
                </SelectItem>
                <SelectItem value="Bonne">
                  Bonne - Logement bien isolé (la plupart des éléments isolés)
                </SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
