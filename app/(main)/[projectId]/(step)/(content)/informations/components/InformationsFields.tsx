"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { FormField } from "@/app/(main)/[projectId]/(step)/components/FormField";
import { InformationsData } from "@/app/(main)/[projectId]/(step)/(content)/informations/mutations/saveInformationsData/saveInformationsDataSchema";

interface InformationsFieldsProps {
  formData: Partial<InformationsData>;
  errors: Partial<Record<keyof InformationsData, string>>;
  onChange: (name: keyof InformationsData, value: any) => void;
}

export function InformationsFields({
  formData,
  errors,
  onChange,
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

  return (
    <div className="space-y-6">
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
    </div>
  );
}
