import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * IMPORTANT: Ce fichier DOIT s'appeler "middleware.ts" (convention Next.js)
 * Il protège la route /tracking avec HTTP Basic Authentication
 */

/**
 * Crée une réponse 401 demandant l'authentification HTTP Basic
 */
const createUnauthorizedResponse = () => {
  return new NextResponse("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="ThermoGain Analytics"',
    },
  });
};

/**
 * Extrait et valide les credentials depuis l'en-tête Authorization
 */
const validateBasicAuth = (authHeader: string | null): boolean => {
  if (!authHeader) return false;

  try {
    const base64Credentials = authHeader.split(" ")[1];
    const [username, password] = Buffer.from(base64Credentials, "base64")
      .toString()
      .split(":");

    return (
      username === process.env.TRACKING_AUTH_USERNAME &&
      password === process.env.TRACKING_AUTH_PASSWORD
    );
  } catch {
    return false;
  }
};

/**
 * Middleware Next.js - Protège /tracking avec HTTP Basic Auth
 */
export const middleware = (request: NextRequest) => {
  if (request.nextUrl.pathname.startsWith("/tracking")) {
    const authHeader = request.headers.get("authorization");

    if (!validateBasicAuth(authHeader)) {
      return createUnauthorizedResponse();
    }
  }

  return NextResponse.next();
};

/**
 * Configuration du middleware
 * Matcher: applique le middleware uniquement sur /tracking
 */
export const config = {
  matcher: "/tracking/:path*",
};
