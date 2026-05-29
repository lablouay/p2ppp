import { getSessionUser } from "@/lib/auth"
import { getUserTasksDashboard } from "@/lib/services/tasks"
import { handleApiError, jsonOk, jsonError } from "@/lib/api-utils"

export async function GET() {
  try {
    const user = await getSessionUser()
    if (!user) return jsonError("Unauthorized", 401)

    const dashboard = await getUserTasksDashboard(user.id, user.vipLevel)
    return jsonOk(dashboard)
  } catch (error) {
    return handleApiError(error)
  }
}
