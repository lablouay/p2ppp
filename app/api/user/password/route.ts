import bcrypt from "bcryptjs"
import { z } from "zod"
import { prisma } from "@/lib/db"
import { getSessionUser } from "@/lib/auth"
import { handleApiError, jsonOk, jsonError } from "@/lib/api-utils"

const passwordSchema = z
  .object({
    oldPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm password is required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.oldPassword !== data.newPassword, {
    message: "New password must be different",
    path: ["newPassword"],
  })

export async function PATCH(request: Request) {
  try {
    const user = await getSessionUser()
    if (!user) return jsonError("Unauthorized", 401)

    const body = passwordSchema.parse(await request.json())
    const valid = await bcrypt.compare(body.oldPassword, user.passwordHash)
    if (!valid) throw new Error("INVALID_PASSWORD")

    const passwordHash = await bcrypt.hash(body.newPassword, 12)
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    })

    return jsonOk({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}
