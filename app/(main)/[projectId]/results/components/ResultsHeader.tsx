"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { getFirstStepKey } from "@/lib/wizardStepsData";
import { SendResultsButton } from "./SendResultsButton";

interface ResultsHeaderProps {
  projectId: string;
  userId: string;
  hasRecipientEmails: boolean;
}

export function ResultsHeader({
  projectId,
  userId,
  hasRecipientEmails,
}: ResultsHeaderProps) {
  const firstStepKey = getFirstStepKey();
  const [emailStatus, setEmailStatus] = useState<{
    emailSent: boolean;
    error: string | null;
  }>({
    emailSent: false,
    error: null,
  });

  return (
    <div className="space-y-4">
      {/* Header with title and buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Analyse de rentabilité</h1>
          <p className="text-muted-foreground mt-2">
            Résultat de l'analyse de rentabilité de votre projet de PAC
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {/* Send Results Button - only show if recipient emails exist */}
          {hasRecipientEmails && (
            <SendResultsButton
              projectId={projectId}
              userId={userId}
              onStatusChange={setEmailStatus}
            />
          )}

          <Link href={`/projects/${projectId}/${firstStepKey}`}>
            <Button variant="outline" className="h-10">
              <Pencil className="mr-2 h-4 w-4" />
              Modifier le projet
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
