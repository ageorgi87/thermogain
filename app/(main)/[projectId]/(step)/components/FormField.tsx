import React from "react"
import { cn } from "@/lib/utils"

interface FormFieldProps {
  label: React.ReactNode
  required?: boolean
  error?: string
  description?: string
  children: React.ReactNode
  className?: string
}

export function FormField({
  label,
  required = false,
  error,
  description,
  children,
  className,
}: FormFieldProps) {
  // Si le label contient déjà un tooltip (détecté par la présence d'une div avec flex)
  const hasTooltip = React.isValidElement(label) &&
    label.type === 'div' &&
    (label.props as any).className?.includes('flex')

  return (
    <div className={cn("space-y-2", className)}>
      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-1">
        {hasTooltip ? (
          // Si le label contient un tooltip, on clone l'élément et on insère l'astérisque avant le tooltip
          (() => {
            const labelElement = label as React.ReactElement<{ children: React.ReactNode }>
            const children = labelElement.props.children
            const childrenArray = Array.isArray(children) ? children : [children]

            return React.cloneElement(labelElement, {},
              childrenArray.flatMap((child: React.ReactNode, index: number) => {
                // Insérer l'astérisque après le premier élément (le texte) et avant le tooltip
                if (index === 0 && required) {
                  return [child, <span key="asterisk" className="text-destructive">*</span>]
                }
                return child
              })
            )
          })()
        ) : (
          // Sinon, affichage normal
          <>
            {label}
            {required && <span className="text-destructive">*</span>}
          </>
        )}
      </label>
      {children}
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      {error && (
        <p className="text-sm font-medium text-destructive">{error}</p>
      )}
    </div>
  )
}
