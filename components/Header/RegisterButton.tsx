"use client";

import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

export const RegisterButton = () => {
  const handleClick = () => {
    console.log("click");
  };

  return (
    <Button
      onClick={handleClick}
      className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
      size="sm"
    >
      <UserPlus className="mr-2 h-4 w-4" />
      S'inscrire
    </Button>
  );
};
