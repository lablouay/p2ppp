import bcrypt from "bcryptjs"
import { z } from "zod"
import { prisma } from "@/lib/db"
import { getSessionUser } from "@/lib/auth"
import { handleApiError, jsonOk, jsonError, sanitizeUser } from "@/lib/api-utils"

const profileSchema = z.object({
  email: z.string().email("Invalid email address"),
  avatarUrl: z.string().nullable().optional(),
  avatarPreset: z.enum(["gold", "blue", "green", "violet", "rose", "cyan"]),
  password: z.string().min(1, "Password is required"),
})

export async function PATCH(request: Request) {
  try {
    const user = await getSessionUser()
    if (!user) return jsonError("Unauthorized", 401)

    const body = profileSchema.parse(await request.json())
    const valid = await bcrypt.compare(body.password, user.passwordHash)
    if (!valid) throw new Error("INVALID_PASSWORD")

    const email = body.email.trim().toLowerCase()
    if (email !== user.email) {
      const existing = await prisma.user.findUnique({ where: { email } })
      if (existing) throw new Error("EMAIL_EXISTS")
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        email,
        avatarUrl: body.avatarUrl ?? null,
        avatarPreset: body.avatarPreset,
      },
    })

    return jsonOk({ user: sanitizeUser(updated) })
  } catch (error) {
    return handleApiError(error)
  }
}
