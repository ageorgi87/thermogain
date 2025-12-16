"use server"

import { hash } from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { sendVerificationWorkflow } from "@/email/lib/workflows/sendVerificationWorkflow"

export const registerUser = async (data: {
  email: string
  password: string
  firstName?: string
  lastName?: string
  company?: string
}): Promise<{ id: string; email: string }> => {
  try {
    const { email, password, firstName, lastName, company } = data

    // Validate input
    if (!email || !password) {
      throw new Error("Email et mot de passe requis")
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      throw new Error("Cet utilisateur existe déjà")
    }

    // Hash password
    const hashedPassword = await hash(password, 12)

    // Create user (emailVerified is null until verified)
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        company,
        emailVerified: null, // Email not verified yet
      },
    })

    // Send verification email
    try {
      await sendVerificationWorkflow(email, firstName)
    } catch (error) {
      console.error("Failed to send verification email:", error)
      // Don't throw error - user is created, just email failed
    }

    return {
      id: user.id,
      email: user.email as string,
    }
  } catch (error) {
    console.error("[registerUser] Error:", error)
    throw error
  }
}
