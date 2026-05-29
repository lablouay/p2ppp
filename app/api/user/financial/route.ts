import { getSessionUser } from "@/lib/auth"
import { getFinancialDashboard } from "@/lib/services/financial"
import { handleApiError, jsonOk, jsonError } from "@/lib/api-utils"

export async function GET() {
  try {
    const user = await getSessionUser()
    if (!user) return jsonError("Unauthorized", 401)

    const financial = await getFinancialDashboard(user.id)
    return jsonOk(financial)
  } catch (error) {
    return handleApiError(error)
  }
}
