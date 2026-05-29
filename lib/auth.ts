import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

const SESSION_COOKIE = "nexearn_session"
const SESSION_MAX_AGE = 60 * 60 * 24 * 7

function getJwtSecret() {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error("JWT_SECRET is not configured")
  }
  return new TextEncoder().encode(secret)
}

export interface SessionPayload {
  userId: string
  email: string
  [key: string]: unknown
}

export async function createSessionToken(payload: SessionPayload) {
  return new SignJWT({ userId: payload.userId, email: payload.email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getJwtSecret())
}

export async function verifySessionToken(token: string): Promise<SessionPayload> {
  const { payload } = await jwtVerify(token, getJwtSecret())
  return {
    userId: String(payload.userId),
    email: String(payload.email),
  }
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  })
}

export async function clearSessionCookie() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}

export async function getSessionUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (!token) return null

  try {
    const payload = await verifySessionToken(token)
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { wallet: true },
    })
    return user
  } catch {
    return null
  }
}

export function attachSessionCookie(response: NextResponse, token: string) {
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  })
  return response
}

export function clearSessionOnResponse(response: NextResponse) {
  response.cookies.delete(SESSION_COOKIE)
  return response
}

export async function requireSessionUser() {
  const user = await getSessionUser()
  if (!user) {
    throw new Error("UNAUTHORIZED")
  }
  return user
}

export function generateInviteCode() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function createUniqueInviteCode() {
  for (let attempt = 0; attempt < 10; attempt++) {
    const inviteCode = generateInviteCode()
    const existing = await prisma.user.findUnique({ where: { inviteCode } })
    if (!existing) return inviteCode
  }
  throw new Error("Could not generate invite code")
}
