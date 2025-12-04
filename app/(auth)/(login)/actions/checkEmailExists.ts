"use server"

import { prisma } from "@/lib/prisma"

export const checkEmailExists = async (email: string): Promise<{ exists: boolean }> => {
  try {
    if (!email) {
      throw new Error("Email requis")
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true },
    })

    return { exists: !!user }
  } catch (error) {
    console.error("[checkEmailExists] Error:", error)
    throw error
  }
}
