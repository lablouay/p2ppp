import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export const ADMIN_COOKIE = "nexearn_admin_session"
const ADMIN_MAX_AGE = 60 * 60 * 24

function getJwtSecret() {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error("JWT_SECRET is not configured")
  return new TextEncoder().encode(secret)
}

export function getAdminCredentials() {
  return {
    username: process.env.ADMIN_USERNAME ?? "admin",
    password: process.env.ADMIN_PASSWORD ?? "admin",
  }
}

export function verifyAdminLogin(username: string, password: string) {
  const creds = getAdminCredentials()
  return username === creds.username && password === creds.password
}

export async function createAdminToken() {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${ADMIN_MAX_AGE}s`)
    .sign(getJwtSecret())
}

export async function verifyAdminToken(token: string) {
  const { payload } = await jwtVerify(token, getJwtSecret())
  if (payload.role !== "admin") throw new Error("INVALID_ADMIN")
  return true
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies()
  const token = cookieStore.get(ADMIN_COOKIE)?.value
  if (!token) return false
  try {
    await verifyAdminToken(token)
    return true
  } catch {
    return false
  }
}

export function attachAdminCookie(response: NextResponse, token: string) {
  response.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_MAX_AGE,
  })
  return response
}

export function clearAdminCookie(response: NextResponse) {
  response.cookies.delete(ADMIN_COOKIE)
  return response
}
