import bcrypt from "bcryptjs"
import { z } from "zod"
import { prisma } from "@/lib/db"
import {
  attachSessionCookie,
  createSessionToken,
  createUniqueInviteCode,
} from "@/lib/auth"
import { handleApiError, jsonOk, sanitizeUser } from "@/lib/api-utils"
import { NextResponse } from "next/server"

const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  inviteCode: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    const body = signupSchema.parse(await request.json())
    const email = body.email.trim().toLowerCase()

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) throw new Error("EMAIL_EXISTS")

    let referredById: string | undefined
    if (body.inviteCode?.trim()) {
      const referrer = await prisma.user.findUnique({
        where: { inviteCode: body.inviteCode.trim() },
      })
      if (!referrer) throw new Error("INVALID_INVITE")
      referredById = referrer.id
    }

    const passwordHash = await bcrypt.hash(body.password, 12)
    const inviteCode = await createUniqueInviteCode()

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        inviteCode,
        referredById,
        wallet: { create: {} },
      },
      include: { wallet: true },
    })

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
