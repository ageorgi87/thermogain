import { prisma } from "../lib/prisma"

async function main() {
  // Get user ID from command line argument
  const userId = process.argv[2]
  const userEmail = process.argv[3] || "user@example.com"

  if (!userId) {
    console.error("Usage: npx tsx scripts/seed-current-user.ts <userId> [email]")
    process.exit(1)
  }

  console.log(`Creating user with ID: ${userId}`)

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { id: userId }
  })

  if (existingUser) {
    console.log("✅ User already exists in database")
    return
  }

  // Create user
  const user = await prisma.user.create({
    data: {
      id: userId,
      email: userEmail,
      name: "Test User",
    }
  })

  console.log("✅ User created successfully:", user)
}

main()
  .catch((e) => {
    console.error("❌ Error:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
