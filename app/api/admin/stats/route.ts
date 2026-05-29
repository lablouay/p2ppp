import { adminGuard } from "@/lib/admin-api"
import { getAdminStats } from "@/lib/services/admin"
import { handleApiError, jsonOk } from "@/lib/api-utils"

export async function GET() {
  try {
    const denied = await adminGuard()
    if (denied) return denied
    const stats = await getAdminStats()
    return jsonOk(stats)
  } catch (error) {
    return handleApiError(error)
  }
}
