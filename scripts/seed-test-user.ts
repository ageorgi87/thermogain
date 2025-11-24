import { prisma } from "../lib/prisma"
import bcrypt from "bcryptjs"

async function main() {
  const email = "test@thermogain.com"
  const password = "test123"

  console.log("🌱 Seeding test user...")

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email }
  })

  if (existingUser) {
    console.log("✅ Test user already exists")
    console.log("Email:", email)
    console.log("Password:", password)
    return
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10)

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name: "Test User",
      firstName: "Test",
      lastName: "User",
    }
  })

  console.log("✅ Test user created successfully!")
  console.log("Email:", email)
  console.log("Password:", password)
  console.log("User ID:", user.id)
}

main()
  .catch((e) => {
    console.error("❌ Error:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
