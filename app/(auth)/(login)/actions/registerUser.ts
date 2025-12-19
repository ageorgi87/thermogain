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
  projectIdToAssociate?: string | null
}): Promise<{ id: string; email: string }> => {
  try {
    const { email, password, firstName, lastName, company, projectIdToAssociate } = data

    console.log("[registerUser] Starting registration, projectIdToAssociate:", projectIdToAssociate)

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

    console.log("[registerUser] User created with ID:", user.id)

    // Associate orphan project if provided
    if (projectIdToAssociate) {
      console.log("[registerUser] Associating orphan project:", projectIdToAssociate)
      try {
        const project = await prisma.project.findUnique({
          where: { id: projectIdToAssociate },
          select: { id: true, userId: true },
        })

        if (project && project.userId === null) {
          await prisma.project.update({
            where: { id: projectIdToAssociate },
            data: { userId: user.id },
          })
          console.log("[registerUser] Project associated successfully")
        } else {
          console.log("[registerUser] Project not found or already has owner")
        }
      } catch (error) {
        console.error("[registerUser] Failed to associate project:", error)
        // Don't throw - user is created, just project association failed
      }
    }

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
