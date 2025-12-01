"use server";

import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createVerificationToken } from "@/email/email-verification";

export async function registerUser(data: {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  company?: string;
}) {
  const { email, password, firstName, lastName, company } = data;

  // Validate input
  if (!email || !password) {
    throw new Error("Email et mot de passe requis");
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error("Cet utilisateur existe déjà");
  }

  // Hash password
  const hashedPassword = await hash(password, 12);

  // Create user (emailVerified is null until verified)
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      company,
      name: `${firstName} ${lastName}`.trim() || email,
      emailVerified: null, // Email not verified yet
    },
  });

  // Send verification email
  try {
    await createVerificationToken(email, firstName);
  } catch (error) {
    console.error("Failed to send verification email:", error);
    // Don't throw error - user is created, just email failed
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
  };
}

export async function checkEmailExists(email: string) {
  if (!email) {
    throw new Error("Email requis");
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true },
  });

  return { exists: !!user };
}
