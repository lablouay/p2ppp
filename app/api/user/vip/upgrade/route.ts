import { z } from "zod"
import { getSessionUser } from "@/lib/auth"
import { upgradeToVipPlan } from "@/lib/services/vip"
import { handleApiError, jsonOk, jsonError, sanitizeUser } from "@/lib/api-utils"
import { getPlanTotalPrice, vipPlans } from "@/lib/vip-data"

const schema = z.object({
  vipLevel: z.number().int().min(1).max(10),
})

export async function POST(request: Request) {
  try {
    const user = await getSessionUser()
    if (!user) return jsonError("Unauthorized", 401)

    const { vipLevel } = schema.parse(await request.json())
    const result = await upgradeToVipPlan(user.id, vipLevel)
    const plan = vipPlans.find((p) => p.level === vipLevel)!

    return jsonOk({
      user: sanitizeUser(result.user!),
      wallet: {
        balance: result.wallet?.balance ?? 0,
        workDeposit: result.wallet?.workDeposit ?? 0,
      },
      upgrade: {
        id: result.log.id,
        vipLevel: result.log.vipLevel,
        planName: result.log.planName,
        totalPaid: result.log.totalPaid,
        createdAt: result.log.createdAt.toISOString(),
      },
      plan: {
        name: plan.name,
        totalPrice: getPlanTotalPrice(plan),
      },
    })
  } catch (error) {
    return handleApiError(error)
  }
}
