"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Wind, Droplets, Layers } from "lucide-react";
import { FormField } from "@/app/(main)/[projectId]/(step)/components/FormField";
import { InformationsData } from "@/app/(main)/[projectId]/(step)/(content)/informations/mutations/saveInformationsData/saveInformationsDataSchema";
import { PacType } from "@/types/pacType";

interface InformationsFieldsProps {
  formData: Partial<InformationsData>;
  errors: Partial<Record<keyof InformationsData, string>>;
  onChange: (name: keyof InformationsData, value: any) => void;
  isLoggedIn: boolean;
}

export function InformationsFields({
  formData,
  errors,
  onChange,
  isLoggedIn,
}: InformationsFieldsProps) {
  const [emailInput, setEmailInput] = useState("");
  const [emailError, setEmailError] = useState("");

  const currentEmails = formData.recipient_emails || [];

  const addEmail = () => {
    setEmailError("");

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput)) {
      setEmailError("Email invalide");
      return;
    }

    // Check for duplicates
    if (currentEmails.includes(emailInput)) {
      setEmailError("Cet email est déjà dans la liste");
      return;
    }

    // Add email to the list
    onChange("recipient_emails", [...currentEmails, emailInput]);
    setEmailInput("");
  };

  const removeEmail = (emailToRemove: string) => {
    onChange(
      "recipient_emails",
      currentEmails.filter((email) => email !== emailToRemove)
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addEmail();
    }
  };

  const showGestionEcs =
    formData.type_pac === PacType.AIR_EAU ||
    formData.type_pac === PacType.EAU_EAU;

  return (
    <div className="space-y-6">
      {/* Section 1: Informations générales */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Informations générales
        </h3>

        <FormField label="Nom du projet" required error={errors.project_name}>
          <Input
            placeholder="ex: Installation PAC - Maison Dupont"
            maxLength={100}
            value={formData.project_name ?? ""}
            onChange={(e) => {
              const value = e.target.value;
              onChange("project_name", value === "" ? undefined : value);
            }}
          />
        </FormField>

        {/* Email field - only visible for logged-in users */}
        {isLoggedIn && (
          <FormField
            label="Email(s) pour recevoir les résultats"
            error={errors.recipient_emails}
          >
            <div className="space-y-3">
              {/* Email input */}
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="exemple@email.com"
                  value={emailInput}
                  onChange={(e) => {
                    setEmailInput(e.target.value);
                    setEmailError("");
                  }}
                  onKeyDown={handleKeyDown}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={addEmail}
                  disabled={!emailInput}
                >
                  <Plus className="h-4 w-4" /> Ajouter
                </Button>
              </div>

              {/* Email error */}
              {emailError && (
                <p className="text-sm text-destructive">{emailError}</p>
              )}

              {/* Email list */}
              {currentEmails.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-muted/30">
                  {currentEmails.map((email) => (
                    <Badge
                      key={email}
                      variant="secondary"
                      className="pl-3 pr-2 py-1.5 text-sm"
                    >
                      {email}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 ml-2 hover:bg-destructive/20"
                        onClick={() => removeEmail(email)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </FormField>
        )}
      </div>

      {/* Section 2: Projet */}
      <div className="space-y-4 pt-2">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Projet
        </h3>

        <FormField
          label="Type de pompe à chaleur"
          required
          error={errors.type_pac}
        >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => {
              onChange("type_pac", PacType.AIR_AIR);
              onChange("with_ecs_management", undefined);
            }}
            className={`
              p-6 rounded-lg border-2 text-center transition-all
              ${
                formData.type_pac === PacType.AIR_AIR
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }
            `}
          >
            <Wind className="h-8 w-8 mx-auto mb-2" />
            <div className="font-medium">Air/Air</div>
          </button>

          <button
            type="button"
            onClick={() => onChange("type_pac", PacType.AIR_EAU)}
            className={`
              p-6 rounded-lg border-2 text-center transition-all
              ${
                formData.type_pac === PacType.AIR_EAU
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }
            `}
          >
            <Droplets className="h-8 w-8 mx-auto mb-2" />
            <div className="font-medium">Air/Eau</div>
          </button>

          <button
            type="button"
            onClick={() => onChange("type_pac", PacType.EAU_EAU)}
            className={`
              p-6 rounded-lg border-2 text-center transition-all
              ${
                formData.type_pac === PacType.EAU_EAU
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }
            `}
          >
            <Layers className="h-8 w-8 mx-auto mb-2" />
            <div className="font-medium">Eau/Eau</div>
          </button>
        </div>
      </FormField>

        {showGestionEcs && (
          <FormField
            label="La pompe à chaleur gère-t-elle également l'eau chaude sanitaire ?"
            required
            error={errors.with_ecs_management}
          >
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="with_ecs_management"
                  checked={formData.with_ecs_management === true}
                  onChange={() => onChange("with_ecs_management", true)}
                  className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm">Oui</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="with_ecs_management"
                  checked={formData.with_ecs_management === false}
                  onChange={() => onChange("with_ecs_management", false)}
                  className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm">Non</span>
              </label>
            </div>
          </FormField>
        )}
      </div>
    </div>
  );
}
