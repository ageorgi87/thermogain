import { auth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function Home() {
  const session = await auth()

  return (
    <div className="flex min-h-screen items-center justify-center">
      <main className="flex flex-col items-center gap-8 text-center">
        <h1 className="text-4xl font-bold">Welcome to Thermogain</h1>

        {session ? (
          <div className="space-y-4">
            <p className="text-lg">Hello, {session.user?.email}!</p>
            <form action="/api/auth/signout" method="POST">
              <Button type="submit">Sign Out</Button>
            </form>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-lg">You are not signed in</p>
            <Button asChild>
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}
