"use client";

import { usePathname } from "next/navigation";
import { Footer } from "./footer";

export function ConditionalFooter() {
  const pathname = usePathname();

  // Hide footer on form pages and results page
  // Form pages: /projects/[id]/logement, /projects/[id]/chauffage-actuel, etc.
  // Results page: /projects/[id]/results
  const isFormPage = /\/projects\/[^/]+\/(logement|chauffage-actuel|projet-pac|couts|aides|evolutions|financement)/.test(pathname);
  const isResultsPage = pathname.includes("/results");

  if (isFormPage || isResultsPage) {
    return null;
  }

  return <Footer />;
}
