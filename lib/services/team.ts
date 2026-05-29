import { startOfMonth } from "date-fns"
import { prisma } from "@/lib/db"
import { EARNING_TYPES } from "@/lib/services/financial"
import { depositCommissionRates, dailyEarningsCommissionRates } from "@/lib/vip-data"

function round(value: number) {
  return Math.round(value * 100) / 100
}

function sumAmount(records: { amount: number }[]) {
  return records.reduce((total, r) => total + r.amount, 0)
}

export async function getTeamStats(userId: string) {
  const monthStart = startOfMonth(new Date())

  const [levelAUsers, levelBUsers, levelCUsers] = await Promise.all([
    prisma.user.findMany({
      where: { referredById: userId },
      select: { id: true, vipLevel: true, createdAt: true },
    }),
    prisma.user.findMany({
      where: { referredBy: { referredById: userId } },
      select: { id: true, vipLevel: true, createdAt: true },
    }),
    prisma.user.findMany({
      where: {
        referredBy: {
          referredBy: { referredById: userId },
        },
      },
      select: { id: true, vipLevel: true, createdAt: true },
    }),
  ])

  const downlineIds = [
    ...levelAUsers.map((u) => u.id),
    ...levelBUsers.map((u) => u.id),
    ...levelCUsers.map((u) => u.id),
  ]

  const teamSize = downlineIds.length

  const [
    teamRechargeAgg,
    newTeamCount,
    firstRechargeCount,
    firstWithdrawalCount,
    referralEarnings,
  ] = await Promise.all([
    downlineIds.length > 0
      ? prisma.vipUpgradeLog.aggregate({
          where: { userId: { in: downlineIds } },
          _sum: { totalPaid: true },
        })
      : Promise.resolve({ _sum: { totalPaid: 0 } }),
    downlineIds.length > 0
      ? prisma.user.count({
          where: { id: { in: downlineIds }, createdAt: { gte: monthStart } },
        })
      : Promise.resolve(0),
    downlineIds.length > 0
      ? prisma.user.count({
          where: {
            id: { in: downlineIds },
            OR: [
              { vipUpgrades: { some: {} } },
              { depositRequests: { some: { status: "APPROVED" } } },
            ],
          },
        })
      : Promise.resolve(0),
    downlineIds.length > 0
      ? prisma.user.count({
          where: {
            id: { in: downlineIds },
            withdrawals: { some: { status: "APPROVED" } },
          },
        })
      : Promise.resolve(0),
    prisma.earningRecord.findMany({
      where: {
        userId,
        type: { in: [EARNING_TYPES.REFERRAL_A, EARNING_TYPES.REFERRAL_B, EARNING_TYPES.REFERRAL_C] },
      },
    }),
  ])

  const revenueByType = {
    A: round(sumAmount(referralEarnings.filter((r) => r.type === EARNING_TYPES.REFERRAL_A))),
    B: round(sumAmount(referralEarnings.filter((r) => r.type === EARNING_TYPES.REFERRAL_B))),
    C: round(sumAmount(referralEarnings.filter((r) => r.type === EARNING_TYPES.REFERRAL_C))),
  }
  const totalReferralEarnings = round(revenueByType.A + revenueByType.B + revenueByType.C)

  const levelStats = [
    {
      level: 1 as const,
      label: "A",
      commissionRate: depositCommissionRates.levelA,
      dailyCommissionRate: dailyEarningsCommissionRates.levelA,
      registered: levelAUsers.length,
      valid: levelAUsers.filter((u) => u.vipLevel > 0).length,
      totalRevenue: revenueByType.A,
    },
    {
      level: 2 as const,
      label: "B",
      commissionRate: depositCommissionRates.levelB,
      dailyCommissionRate: dailyEarningsCommissionRates.levelB,
      registered: levelBUsers.length,
      valid: levelBUsers.filter((u) => u.vipLevel > 0).length,
      totalRevenue: revenueByType.B,
    },
    {
      level: 3 as const,
      label: "C",
      commissionRate: depositCommissionRates.levelC,
      dailyCommissionRate: dailyEarningsCommissionRates.levelC,
      registered: levelCUsers.length,
      valid: levelCUsers.filter((u) => u.vipLevel > 0).length,
      totalRevenue: revenueByType.C,
    },
  ]

  return {
    teamSize,
    teamRecharge: round(teamRechargeAgg._sum.totalPaid ?? 0),
    newTeam: newTeamCount,
    firstRecharge: firstRechargeCount,
    firstWithdrawal: firstWithdrawalCount,
    totalReferralEarnings,
    depositRates: depositCommissionRates,
    dailyRates: dailyEarningsCommissionRates,
    levels: levelStats,
  }
}
