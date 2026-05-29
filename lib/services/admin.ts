import { eachDayOfInterval, format, startOfDay, subDays, startOfMonth } from "date-fns"
import { prisma } from "@/lib/db"
import { vipPlans } from "@/lib/vip-data"
import { EARNING_TYPES } from "@/lib/services/financial"
import { todayKey } from "@/lib/services/tasks"

function round(value: number) {
  return Math.round(value * 100) / 100
}

function buildDailySeries(
  days: Date[],
  records: { createdAt: Date; amount?: number }[],
  mode: "count" | "sum",
) {
  return days.map((day) => {
    const next = new Date(day)
    next.setDate(next.getDate() + 1)
    const inDay = records.filter((r) => r.createdAt >= day && r.createdAt < next)
    return {
      label: format(day, "MMM d"),
      value: mode === "count" ? inDay.length : round(inDay.reduce((s, r) => s + (r.amount ?? 0), 0)),
    }
  })
}

export async function getAdminStats() {
  const todayStart = startOfDay(new Date())
  const dayKey = todayKey()
  const last7Start = startOfDay(subDays(new Date(), 6))
  const days7 = eachDayOfInterval({ start: last7Start, end: todayStart })
  const monthStart = startOfMonth(new Date())

  const [
    userCount,
    bannedCount,
    vipUsersCount,
    approvedDeposits,
    approvedWithdrawals,
    pendingDeposits,
    pendingWithdrawals,
    rejectedDeposits,
    tasksToday,
    users,
    todayCompletions,
    todayTaskEarnings,
    signups7d,
    deposits7d,
    withdrawals7d,
    vipUpgrades7d,
    referralEarningsMonth,
    totalReferralPaid,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { banned: true } }),
    prisma.user.count({ where: { vipLevel: { gt: 0 } } }),
    prisma.depositRequest.aggregate({
      where: { status: "APPROVED" },
      _sum: { amount: true },
    }),
    prisma.withdrawalRequest.aggregate({
      where: { status: "APPROVED" },
      _sum: { amount: true },
    }),
    prisma.depositRequest.count({ where: { status: "PENDING" } }),
    prisma.withdrawalRequest.count({ where: { status: "PENDING" } }),
    prisma.depositRequest.count({ where: { status: "REJECTED" } }),
    prisma.taskCompletion.count({
      where: { completedAt: { gte: todayStart } },
    }),
    prisma.user.findMany({
      select: {
        id: true,
        email: true,
        vipLevel: true,
        banned: true,
        createdAt: true,
        wallet: { select: { balance: true, workDeposit: true } },
        _count: { select: { referrals: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.taskCompletion.findMany({
      where: { dayKey },
      select: { userId: true, earnAmount: true },
    }),
    prisma.earningRecord.aggregate({
      where: { type: EARNING_TYPES.TASK, createdAt: { gte: todayStart } },
      _sum: { amount: true },
    }),
    prisma.user.findMany({
      where: { createdAt: { gte: last7Start } },
      select: { createdAt: true },
    }),
    prisma.depositRequest.findMany({
      where: { createdAt: { gte: last7Start }, status: "APPROVED" },
      select: { createdAt: true, amount: true },
    }),
    prisma.withdrawalRequest.findMany({
      where: { createdAt: { gte: last7Start }, status: "APPROVED" },
      select: { createdAt: true, amount: true },
    }),
    prisma.vipUpgradeLog.findMany({
      where: { createdAt: { gte: last7Start } },
      select: { createdAt: true, totalPaid: true },
    }),
    prisma.earningRecord.aggregate({
      where: {
        type: { startsWith: "REFERRAL_" },
        createdAt: { gte: monthStart },
      },
      _sum: { amount: true },
    }),
    prisma.earningRecord.aggregate({
      where: { type: { startsWith: "REFERRAL_" } },
      _sum: { amount: true },
    }),
  ])

  const completionsByUser = new Map<string, { count: number; earned: number }>()
  for (const row of todayCompletions) {
    const current = completionsByUser.get(row.userId) ?? { count: 0, earned: 0 }
    current.count += 1
    current.earned += row.earnAmount
    completionsByUser.set(row.userId, current)
  }

  let nextMonthPayout = 0
  for (const user of users) {
    const plan = vipPlans.find((p) => p.level === user.vipLevel)
    if (plan && plan.level > 0) nextMonthPayout += plan.salary30Days
  }

  const userRows = users.map((user) => {
    const activity = completionsByUser.get(user.id) ?? { count: 0, earned: 0 }
    const plan = vipPlans.find((p) => p.level === user.vipLevel)
    return {
      id: user.id,
      email: user.email,
      vipLevel: user.vipLevel,
      banned: user.banned,
      planName: plan?.name ?? `VIP ${user.vipLevel}`,
      balance: round(user.wallet?.balance ?? 0),
      workDeposit: round(user.wallet?.workDeposit ?? 0),
      directReferrals: user._count.referrals,
      tasksToday: activity.count,
      earnedToday: round(activity.earned),
      memberSince: user.createdAt.toISOString(),
    }
  })

  const charts = {
    signups: buildDailySeries(
      days7,
      signups7d.map((u) => ({ createdAt: u.createdAt })),
      "count",
    ),
    deposits: buildDailySeries(
      days7,
      deposits7d.map((d) => ({ createdAt: d.createdAt, amount: d.amount })),
      "sum",
    ),
    withdrawals: buildDailySeries(
      days7,
      withdrawals7d.map((w) => ({ createdAt: w.createdAt, amount: w.amount })),
      "sum",
    ),
    vipUpgrades: buildDailySeries(
      days7,
      vipUpgrades7d.map((v) => ({ createdAt: v.createdAt, amount: v.totalPaid })),
      "sum",
    ),
  }

  return {
    overview: {
      userCount,
      bannedCount,
      vipUsersCount,
      totalDeposited: round(approvedDeposits._sum.amount ?? 0),
      totalWithdrawn: round(approvedWithdrawals._sum.amount ?? 0),
      netBalance: round((approvedDeposits._sum.amount ?? 0) - (approvedWithdrawals._sum.amount ?? 0)),
      nextMonthPayout: round(nextMonthPayout),
      tasksCompletedToday: tasksToday,
      taskEarningsToday: round(todayTaskEarnings._sum.amount ?? 0),
      pendingDeposits,
      pendingWithdrawals,
      rejectedDeposits,
      referralPaidThisMonth: round(referralEarningsMonth._sum.amount ?? 0),
      totalReferralPaid: round(totalReferralPaid._sum.amount ?? 0),
    },
    charts,
    users: userRows,
  }
}
