import { z } from "zod"
import { getSessionUser } from "@/lib/auth"
import { disableTwoFactor } from "@/lib/services/two-factor"
import { handleApiError, jsonOk, jsonError, sanitizeUser } from "@/lib/api-utils"

const schema = z.object({
  password: z.string().min(1),
})

export async function POST(request: Request) {
  try {
    const user = await getSessionUser()
    if (!user) return jsonError("Unauthorized", 401)

    const body = schema.parse(await request.json())
    const updated = await disableTwoFactor(user.id, body.password, user.passwordHash)

    return jsonOk({ user: sanitizeUser(updated) })
  } catch (error) {
    return handleApiError(error)
  }
}
