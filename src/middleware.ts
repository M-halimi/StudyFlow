import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const publicRoutes = new Set([
  "/",
  "/login",
  "/register",
  "/forgot-password",
])

const authApiPrefix = "/api/auth"
const SESSION_COOKIE = "authjs.session-token"
const SECURE_SESSION_COOKIE = "__Secure-authjs.session-token"

function getSessionToken(req: NextRequest): string | undefined {
  return (
    req.cookies.get(SESSION_COOKIE)?.value
    ?? req.cookies.get(SECURE_SESSION_COOKIE)?.value
  )
}

export default function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (publicRoutes.has(pathname) || pathname.startsWith(authApiPrefix)) {
    return NextResponse.next()
  }

  if (getSessionToken(req)) {
    return NextResponse.next()
  }

  const loginUrl = new URL("/login", req.url)
  loginUrl.searchParams.set("callbackUrl", pathname)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|file\\.svg|globe\\.svg|next\\.svg|vercel\\.svg|window\\.svg).*)",
  ],
}
