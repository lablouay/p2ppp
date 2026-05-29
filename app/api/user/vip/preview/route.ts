import { getSessionUser } from "@/lib/auth"
import { getUpgradePreview } from "@/lib/services/vip"
import { getPlanTotalPrice, vipPlans } from "@/lib/vip-data"
import { handleApiError, jsonOk, jsonError } from "@/lib/api-utils"

export async function GET() {
  try {
    const user = await getSessionUser()
    if (!user) return jsonError("Unauthorized", 401)

    const balance = user.wallet?.balance ?? 0
    const preview = getUpgradePreview(balance, user.vipLevel)

    return jsonOk({
      ...preview,
      affordable: preview.affordable.map((plan) => ({
        level: plan.level,
        name: plan.name,
        activationFee: plan.activationFee,
        workDeposit: plan.workDeposit,
        totalPrice: getPlanTotalPrice(plan),
        dailySalary: plan.dailySalary,
      })),
      allPlans: vipPlans
        .filter((p) => p.level > 0)
        .map((plan) => ({
          level: plan.level,
          name: plan.name,
          totalPrice: getPlanTotalPrice(plan),
        })),
    })
  } catch (error) {
    return handleApiError(error)
  }
}
