"use client";

import Image from "next/image";
import Link from "next/link";

export const LogoLink = () => (
  <Link
    href="/dashboard"
    className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
  >
    <Image
      src="/logo.png"
      alt="ThermoGain"
      width={48}
      height={48}
      className="object-contain"
    />
    <div>
      <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
        ThermoGain
      </h1>
      <p className="text-xs text-muted-foreground">
        Études thermiques intelligentes
      </p>
    </div>
  </Link>
);
