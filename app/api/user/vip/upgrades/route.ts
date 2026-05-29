import { getSessionUser } from "@/lib/auth"
import { getUpgradeLogs } from "@/lib/services/vip"
import { handleApiError, jsonOk, jsonError } from "@/lib/api-utils"

export async function GET() {
  try {
    const user = await getSessionUser()
    if (!user) return jsonError("Unauthorized", 401)

    const logs = await getUpgradeLogs(user.id)

    return jsonOk({
      logs: logs.map((log) => ({
        id: log.id,
        vipLevel: log.vipLevel,
        planName: log.planName,
        activationFee: log.activationFee,
        workDeposit: log.workDeposit,
        totalPaid: log.totalPaid,
        createdAt: log.createdAt.toISOString(),
      })),
    })
  } catch (error) {
    return handleApiError(error)
  }
}
