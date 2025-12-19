"use client";

import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

export const RegisterButton = () => {
  const router = useRouter();
  const pathname = usePathname();

  const handleClick = () => {
    // Extract projectId from current path if user is on a project page
    const projectIdMatch = pathname.match(/^\/([^/]+)\//);
    const projectId = projectIdMatch ? projectIdMatch[1] : null;

    // Redirect to home with projectId as query param if present
    if (projectId) {
      router.push(`/?projectId=${projectId}`);
    } else {
      router.push("/");
    }
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
