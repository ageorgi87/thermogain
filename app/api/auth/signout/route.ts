import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST() {
  // Delete NextAuth session cookies
  const cookieStore = await cookies()

  // NextAuth v5 uses these cookie names
  cookieStore.delete('authjs.session-token')
  cookieStore.delete('__Secure-authjs.session-token')
  cookieStore.delete('authjs.csrf-token')
  cookieStore.delete('__Secure-authjs.csrf-token')
  cookieStore.delete('authjs.callback-url')
  cookieStore.delete('__Secure-authjs.callback-url')

  return NextResponse.json({ success: true })
}
