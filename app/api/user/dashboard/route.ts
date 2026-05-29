import { getSessionUser } from "@/lib/auth"
import { getFinancialDashboard } from "@/lib/services/financial"
import { handleApiError, jsonOk, jsonError, sanitizeUser } from "@/lib/api-utils"

export async function GET() {
  try {
    const user = await getSessionUser()
    if (!user) return jsonError("Unauthorized", 401)
    if (user.banned) return jsonError("Account suspended", 403)

    const dashboard = await getFinancialDashboard(user.id)

    return jsonOk({
      user: sanitizeUser(user),
      ...dashboard,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
