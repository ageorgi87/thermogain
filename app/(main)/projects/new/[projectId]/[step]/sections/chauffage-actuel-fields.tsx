import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
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
import { ChauffageActuelData } from "@/lib/schemas/heating-form"

interface ChauffageActuelFieldsProps {
  form: UseFormReturn<ChauffageActuelData>
}

export function ChauffageActuelFields({ form }: ChauffageActuelFieldsProps) {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="type_chauffage"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Type de chauffage</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="Fioul">Fioul</SelectItem>
                <SelectItem value="Gaz">Gaz</SelectItem>
                <SelectItem value="GPL">GPL</SelectItem>
                <SelectItem value="Pellets">Pellets</SelectItem>
                <SelectItem value="Bois">Bois</SelectItem>
                <SelectItem value="Electrique">Électrique</SelectItem>
                <SelectItem value="PAC Air/Air">PAC Air/Air</SelectItem>
                <SelectItem value="PAC Air/Eau">PAC Air/Eau</SelectItem>
                <SelectItem value="PAC Eau/Eau">PAC Eau/Eau</SelectItem>
                <SelectItem value="Autre">Autre</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="age_installation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Âge de l&apos;installation (années)</FormLabel>
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
          name="etat_installation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>État de l&apos;installation</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Bon">Bon</SelectItem>
                  <SelectItem value="Moyen">Moyen</SelectItem>
                  <SelectItem value="Mauvais">Mauvais</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}
