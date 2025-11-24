import { auth } from "../lib/auth"

async function main() {
  console.log("Fetching current session...")

  const session = await auth()

  if (!session?.user?.id) {
    console.error("❌ No active session found. Please log in first.")
    process.exit(1)
  }

  console.log("✅ Session found!")
  console.log("User ID:", session.user.id)
  console.log("Email:", session.user.email)
  console.log("Name:", session.user.name)

  console.log("\n📋 Run this command to seed the user:")
  console.log(`DATABASE_URL='postgresql://neondb_owner:npg_5lYb8SEFPsha@ep-withered-silence-ag2n2oek-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require' npx tsx scripts/seed-current-user.ts ${session.user.id} ${session.user.email}`)
}

main()
  .catch((e) => {
    console.error("❌ Error:", e)
    process.exit(1)
  })
