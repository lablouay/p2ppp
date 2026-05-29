import { prisma } from "@/lib/db"
import {
  vipPlans,
  getPlanTotalPrice,
  getLowestPaidPlan,
  getAffordablePlans,
} from "@/lib/vip-data"
import { distributeVipUpgradeReferralCommissions } from "@/lib/services/referral"
import { EARNING_TYPES } from "@/lib/services/financial"

export type UpgradePreviewState = "NO_BALANCE" | "INSUFFICIENT" | "SELECT_PLAN"

export function getUpgradePreview(balance: number, currentVipLevel: number) {
  const lowest = getLowestPaidPlan()
  const minRequired = getPlanTotalPrice(lowest)
  const affordable = getAffordablePlans(balance, currentVipLevel)

  if (balance <= 0) {
    return {
      state: "NO_BALANCE" as UpgradePreviewState,
      minRequired,
      affordable: [] as typeof vipPlans,
      balance,
      currentVipLevel,
    }
  }

  if (affordable.length === 0) {
    return {
      state: "INSUFFICIENT" as UpgradePreviewState,
      minRequired,
      affordable: [],
      balance,
      currentVipLevel,
    }
  }

  return {
    state: "SELECT_PLAN" as UpgradePreviewState,
    minRequired,
    affordable,
    balance,
    currentVipLevel,
  }
}

export async function upgradeToVipPlan(userId: string, targetLevel: number) {
  const plan = vipPlans.find((p) => p.level === targetLevel)
  if (!plan || plan.level === 0) {
    throw new Error("INVALID_PLAN")
  }

  const totalPrice = getPlanTotalPrice(plan)
  if (totalPrice <= 0) {
    throw new Error("INVALID_PLAN")
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { wallet: true },
  })

  if (!user?.wallet) throw new Error("WALLET_NOT_FOUND")
  if (user.vipLevel === targetLevel) throw new Error("ALREADY_AT_LEVEL")
  if (user.wallet.balance < totalPrice) throw new Error("INSUFFICIENT_BALANCE")

  const result = await prisma.$transaction(async (tx) => {
    await tx.wallet.update({
      where: { userId },
      data: {
        balance: { decrement: totalPrice },
        workDeposit: plan.workDeposit ?? 0,
      },
    })

    await tx.user.update({
      where: { id: userId },
      data: { vipLevel: targetLevel },
    })

    const log = await tx.vipUpgradeLog.create({
      data: {
        userId,
        vipLevel: targetLevel,
        planName: plan.name,
        activationFee: plan.activationFee ?? 0,
        workDeposit: plan.workDeposit ?? 0,
        totalPaid: totalPrice,
      },
    })

    await tx.earningRecord.create({
      data: {
        userId,
        type: "VIP_UPGRADE",
        amount: -totalPrice,
      },
    })

    return log
  })

  await distributeVipUpgradeReferralCommissions(userId, targetLevel)

  const wallet = await prisma.wallet.findUnique({ where: { userId } })
  const updatedUser = await prisma.user.findUnique({ where: { id: userId } })

  return {
    log: result,
    user: updatedUser,
    wallet,
    plan,
  }
}

export async function getUpgradeLogs(userId: string) {
  return prisma.vipUpgradeLog.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  })
}
