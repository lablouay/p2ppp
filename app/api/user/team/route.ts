import { getSessionUser } from "@/lib/auth"
import { getTeamStats } from "@/lib/services/team"
import { handleApiError, jsonOk, jsonError } from "@/lib/api-utils"

export async function GET() {
  try {
    const user = await getSessionUser()
    if (!user) return jsonError("Unauthorized", 401)
    if (user.banned) return jsonError("Account suspended", 403)

    const team = await getTeamStats(user.id)
    return jsonOk(team)
  } catch (error) {
    return handleApiError(error)
  }
}
