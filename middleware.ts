import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

const PUBLIC_PATHS = ["/login", "/signup"]
const ADMIN_PUBLIC = ["/admin/login"]

function getSecret() {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error("JWT_SECRET is not configured")
  return new TextEncoder().encode(secret)
}

async function verifyAdminToken(token: string) {
  const { payload } = await jwtVerify(token, getSecret())
  return payload.role === "admin"
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    return NextResponse.next()
  }

  if (pathname.startsWith("/admin")) {
    const adminToken = request.cookies.get("nexearn_admin_session")?.value
    const isAdminPublic = ADMIN_PUBLIC.includes(pathname)

    if (!adminToken) {
      if (isAdminPublic) return NextResponse.next()
      return NextResponse.redirect(new URL("/admin/login", request.url))
    }

    try {
      const valid = await verifyAdminToken(adminToken)
      if (!valid) throw new Error("invalid")
      if (isAdminPublic) return NextResponse.redirect(new URL("/admin", request.url))
      return NextResponse.next()
    } catch {
      const response = isAdminPublic
        ? NextResponse.next()
        : NextResponse.redirect(new URL("/admin/login", request.url))
      response.cookies.delete("nexearn_admin_session")
      return response
    }
  }

  const token = request.cookies.get("nexearn_session")?.value
  const isPublic = PUBLIC_PATHS.includes(pathname)

  if (!token) {
    if (isPublic) return NextResponse.next()
    return NextResponse.redirect(new URL("/login", request.url))
  }

  try {
    await jwtVerify(token, getSecret())
    if (isPublic) return NextResponse.redirect(new URL("/", request.url))
    return NextResponse.next()
  } catch {
    const response = isPublic
      ? NextResponse.next()
      : NextResponse.redirect(new URL("/login", request.url))
    response.cookies.delete("nexearn_session")
    return response
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
