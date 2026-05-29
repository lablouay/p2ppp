import bcrypt from "bcryptjs"
import { z } from "zod"
import { prisma } from "@/lib/db"
import { attachSessionCookie, createSessionToken } from "@/lib/auth"
import { verifyUserTwoFactor } from "@/lib/services/two-factor"
import { handleApiError, jsonOk, sanitizeUser } from "@/lib/api-utils"
import { NextResponse } from "next/server"

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  totp: z.string().length(6).optional(),
})

export async function POST(request: Request) {
  try {
    const body = loginSchema.parse(await request.json())
    const email = body.email.trim().toLowerCase()

    const user = await prisma.user.findUnique({
      where: { email },
      include: { wallet: true },
    })

    if (!user) throw new Error("INVALID_CREDENTIALS")
    if (user.banned) throw new Error("BANNED")

    const valid = await bcrypt.compare(body.password, user.passwordHash)
    if (!valid) throw new Error("INVALID_CREDENTIALS")

    if (user.twoFactorEnabled) {
      if (!body.totp) {
        return jsonOk({ requires2FA: true })
      }
      await verifyUserTwoFactor(user.id, body.totp)
    }

    const token = await createSessionToken({ userId: user.id, email: user.email })
    const response = NextResponse.json({
      user: sanitizeUser(user),
      wallet: user.wallet,
    })
    return attachSessionCookie(response, token)
  } catch (error) {
    return handleApiError(error)
  }
}
