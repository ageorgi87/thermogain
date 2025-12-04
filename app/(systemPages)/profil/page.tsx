"use client";

import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { updateProfile } from "@/app/(systemPages)/profil/actions/updateProfile/updateProfile";
import { changePassword } from "@/app/(systemPages)/profil/actions/changePassword/changePassword";
import { getProfile } from "@/app/(systemPages)/profil/queries/getProfile";
import { ProfilFormCard } from "@/app/(systemPages)/profil/components/ProfilFormCard";
import { PasswordChangeCard } from "@/app/(systemPages)/profil/components/PasswordChangeCard";
import { useState, useEffect } from "react";

interface UserProfile {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  company?: string | null;
  siret?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  postalCode?: string | null;
  website?: string | null;
}

export default function ProfilPage() {
  const { status } = useSession();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    company: "",
    siret: "",
    address: "",
    city: "",
    postalCode: "",
    website: "",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Charger les données du profil depuis la base de données
  useEffect(() => {
    const loadProfile = async () => {
      setIsLoadingProfile(true);
      const result = await getProfile();

      if (result.success && result.data) {
        setUser(result.data);
        setFormData({
          firstName: result.data.firstName || "",
          lastName: result.data.lastName || "",
          phone: result.data.phone || "",
          company: result.data.company || "",
          siret: result.data.siret || "",
          address: result.data.address || "",
          city: result.data.city || "",
          postalCode: result.data.postalCode || "",
          website: result.data.website || "",
        });
      }

      setIsLoadingProfile(false);
    };

    if (status === "authenticated") {
      loadProfile();
    }
  }, [status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    const result = await updateProfile(formData);

    if (result.success) {
      setMessage({ type: "success", text: "Profil mis à jour avec succès" });
      // Recharger les données du profil depuis la base de données
      const profileResult = await getProfile();
      if (profileResult.success && profileResult.data) {
        setUser(profileResult.data);
      }
    } else {
      setMessage({
        type: "error",
        text: result.error || "Une erreur est survenue",
      });
    }

    setIsSaving(false);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsChangingPassword(true);
    setPasswordMessage(null);

    // Validation côté client
    if (passwordData.newPassword.length < 8) {
      setPasswordMessage({
        type: "error",
        text: "Le mot de passe doit contenir au moins 8 caractères",
      });
      setIsChangingPassword(false);
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage({
        type: "error",
        text: "Les mots de passe ne correspondent pas",
      });
      setIsChangingPassword(false);
      return;
    }

    const result = await changePassword({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    });

    if (result.success) {
      setPasswordMessage({
        type: "success",
        text: "Mot de passe modifié avec succès",
      });
      // Réinitialiser le formulaire
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } else {
      setPasswordMessage({
        type: "error",
        text: result.error || "Une erreur est survenue",
      });
    }

    setIsChangingPassword(false);
  };

  if (status === "loading" || isLoadingProfile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Mon Profil</CardTitle>
          <CardDescription>
            Vos informations personnelles et professionnelles
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-60" />
            </div>
          </div>
          <Skeleton className="h-40 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <ProfilFormCard
        user={user}
        formData={formData}
        isSaving={isSaving}
        message={message}
        onFormDataChange={setFormData}
        onSubmit={handleSubmit}
      />

      <PasswordChangeCard
        passwordData={passwordData}
        isChangingPassword={isChangingPassword}
        passwordMessage={passwordMessage}
        onPasswordDataChange={setPasswordData}
        onSubmit={handlePasswordChange}
      />
    </>
  );
}
