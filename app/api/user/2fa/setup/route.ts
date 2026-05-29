import { getSessionUser } from "@/lib/auth"
import { generateTwoFactorSecret } from "@/lib/services/two-factor"
import { handleApiError, jsonOk, jsonError } from "@/lib/api-utils"

export async function POST() {
  try {
    const user = await getSessionUser()
    if (!user) return jsonError("Unauthorized", 401)

    const { secret, otpauth } = generateTwoFactorSecret(user.email)

    return jsonOk({ secret, otpauth })
  } catch (error) {
    return handleApiError(error)
  }
}
