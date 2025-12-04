import { HelpCircle } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface PriceLabelWithTooltipProps {
  label: string
  price?: number
  unit: string
}

export const PriceLabelWithTooltip = ({ label, price, unit }: PriceLabelWithTooltipProps) => (
  <div className="flex items-center gap-2">
    <span>{label}</span>

    {price && (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
          </TooltipTrigger>

          <TooltipContent side="top" className="max-w-[300px]">
            <p className="text-sm">
              Ce mois-ci, le prix moyen national est de <span className="font-semibold">{price.toFixed(3)}&nbsp;{unit}</span>.
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )}
  </div>
)
