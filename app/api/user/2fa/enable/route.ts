import { z } from "zod"
import { getSessionUser } from "@/lib/auth"
import { enableTwoFactor } from "@/lib/services/two-factor"
import { handleApiError, jsonOk, jsonError, sanitizeUser } from "@/lib/api-utils"

const schema = z.object({
  secret: z.string().min(16),
  token: z.string().length(6),
})

export async function POST(request: Request) {
  try {
    const user = await getSessionUser()
    if (!user) return jsonError("Unauthorized", 401)

    const body = schema.parse(await request.json())
    const updated = await enableTwoFactor(user.id, body.secret, body.token)

    return jsonOk({ user: sanitizeUser(updated) })
  } catch (error) {
    return handleApiError(error)
  }
}
