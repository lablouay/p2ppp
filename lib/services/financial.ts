import {
  startOfDay,
  startOfWeek,
  startOfMonth,
  subMonths,
  endOfMonth,
  format,
  eachDayOfInterval,
  eachWeekOfInterval,
  endOfWeek,
} from "date-fns"
import { prisma } from "@/lib/db"
import { distributeDailyReferralCommissions } from "@/lib/services/referral"

export const EARNING_TYPES = {
  TASK: "TASK",
  REFERRAL_A: "REFERRAL_A",
  REFERRAL_B: "REFERRAL_B",
  REFERRAL_C: "REFERRAL_C",
  DEPOSIT: "DEPOSIT",
  VIP_UPGRADE: "VIP_UPGRADE",
} as const

function sumAmount(records: { amount: number }[]) {
  return records.reduce((total, record) => total + record.amount, 0)
}

function round(value: number) {
  return Math.round(value * 100) / 100
}

export async function getFinancialDashboard(userId: string) {
  const now = new Date()
  const todayStart = startOfDay(now)
  const weekStart = startOfWeek(now, { weekStartsOn: 1 })
  const monthStart = startOfMonth(now)
  const lastMonthStart = startOfMonth(subMonths(now, 1))
  const lastMonthEnd = endOfMonth(subMonths(now, 1))
  const sixMonthsAgo = startOfMonth(subMonths(now, 5))

  const [allEarnings, wallet, referralCounts] = await Promise.all([
    prisma.earningRecord.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    }),
    prisma.wallet.findUnique({ where: { userId } }),
    Promise.all([
      prisma.user.count({ where: { referredById: userId } }),
      prisma.user.count({
        where: {
          referredBy: { referredById: userId },
        },
      }),
      prisma.user.count({
        where: {
          referredBy: {
            referredBy: { referredById: userId },
          },
        },
      }),
    ]),
  ])

  const taskRecords = allEarnings.filter((record) => record.type === EARNING_TYPES.TASK)
  const referralRecords = allEarnings.filter((record) => record.type.startsWith("REFERRAL_"))

  const todayTasks = sumAmount(taskRecords.filter((record) => record.createdAt >= todayStart))
  const weekTasks = sumAmount(taskRecords.filter((record) => record.createdAt >= weekStart))
  const monthTasks = sumAmount(taskRecords.filter((record) => record.createdAt >= monthStart))
  const weekReferral = sumAmount(referralRecords.filter((record) => record.createdAt >= weekStart))
  const monthReferral = sumAmount(referralRecords.filter((record) => record.createdAt >= monthStart))
  const earnedThisMonth = monthTasks + monthReferral
  const earnedLastMonth = sumAmount(
    allEarnings.filter(
      (record) => record.createdAt >= lastMonthStart && record.createdAt <= lastMonthEnd,
    ),
  )
  const totalAllTime = sumAmount(allEarnings)

  const weekDays = eachDayOfInterval({ start: weekStart, end: now })
  const weeklyEarnings = weekDays.map((day) => {
    const nextDay = new Date(day)
    nextDay.setDate(nextDay.getDate() + 1)
    const dayRecords = allEarnings.filter(
      (record) => record.createdAt >= day && record.createdAt < nextDay,
    )
    return {
      label: format(day, "EEE"),
      tasks: round(sumAmount(dayRecords.filter((record) => record.type === EARNING_TYPES.TASK))),
      referral: round(
        sumAmount(dayRecords.filter((record) => record.type.startsWith("REFERRAL_"))),
      ),
    }
  })

  const monthWeeks = eachWeekOfInterval({ start: monthStart, end: now }, { weekStartsOn: 1 })
  const monthlyEarnings = monthWeeks.map((week, index) => {
    const weekEnd = endOfWeek(week, { weekStartsOn: 1 })
    const weekRecords = allEarnings.filter(
      (record) => record.createdAt >= week && record.createdAt <= weekEnd,
    )
    return {
      label: `W${index + 1}`,
      tasks: round(sumAmount(weekRecords.filter((record) => record.type === EARNING_TYPES.TASK))),
      referral: round(
        sumAmount(weekRecords.filter((record) => record.type.startsWith("REFERRAL_"))),
      ),
    }
  })

  const referralLevelEarnings = [
    {
      level: "A" as const,
      amount: round(
        sumAmount(allEarnings.filter((record) => record.type === EARNING_TYPES.REFERRAL_A && record.createdAt >= monthStart)),
      ),
      count: referralCounts[0],
    },
    {
      level: "B" as const,
      amount: round(
        sumAmount(allEarnings.filter((record) => record.type === EARNING_TYPES.REFERRAL_B && record.createdAt >= monthStart)),
      ),
      count: referralCounts[1],
    },
    {
      level: "C" as const,
      amount: round(
        sumAmount(allEarnings.filter((record) => record.type === EARNING_TYPES.REFERRAL_C && record.createdAt >= monthStart)),
      ),
      count: referralCounts[2],
    },
  ]

  const monthStarts = eachWeekOfInterval(
    { start: sixMonthsAgo, end: now },
    { weekStartsOn: 1 },
  ).slice(0, 6)

  const monthlyPerformance = Array.from({ length: 6 }).map((_, index) => {
    const monthDate = subMonths(startOfMonth(now), 5 - index)
    const monthEnd = endOfMonth(monthDate)
    const monthRecords = allEarnings.filter(
      (record) => record.createdAt >= monthDate && record.createdAt <= monthEnd,
    )
    const tasks = round(sumAmount(monthRecords.filter((record) => record.type === EARNING_TYPES.TASK)))
    const referral = round(
      sumAmount(monthRecords.filter((record) => record.type.startsWith("REFERRAL_"))),
    )
    return {
      label: format(monthDate, "MMM"),
      total: round(tasks + referral),
      tasks,
      referral,
    }
  })

  return {
    wallet: {
      balance: round(wallet?.balance ?? 0),
      workDeposit: round(wallet?.workDeposit ?? 0),
    },
    earnings: {
      todayTasks: round(todayTasks),
      weekTasks: round(weekTasks),
      monthTasks: round(monthTasks),
      weekReferral: round(weekReferral),
      monthReferral: round(monthReferral),
      earnedToday: round(todayTasks),
      earnedThisMonth: round(earnedThisMonth),
      earnedLastMonth: round(earnedLastMonth),
      totalAllTime: round(totalAllTime),
    },
    weeklyEarnings,
    monthlyEarnings,
    referralLevelEarnings,
    monthlyPerformance,
  }
}

/** Task win: deduct from locked work deposit first, remainder to balance */
export async function recordTaskWin(userId: string, grossAmount: number, vipLevel?: number) {
  if (grossAmount <= 0) throw new Error("INVALID_AMOUNT")

  const wallet = await prisma.wallet.findUnique({ where: { userId } })
  if (!wallet) throw new Error("WALLET_NOT_FOUND")

  let toWorkDeposit = 0
  let toBalance = grossAmount

  if (wallet.workDeposit > 0) {
    toWorkDeposit = Math.min(grossAmount, wallet.workDeposit)
    toBalance = round(grossAmount - toWorkDeposit)
  }

  const result = await prisma.$transaction(async (tx) => {
    await tx.earningRecord.create({
      data: { userId, type: EARNING_TYPES.TASK, amount: grossAmount },
    })

    const updated = await tx.wallet.update({
      where: { userId },
      data: {
        workDeposit: { decrement: toWorkDeposit },
        balance: { increment: toBalance },
      },
    })

    return updated
  })

  let level = vipLevel
  if (level === undefined) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { vipLevel: true },
    })
    level = user?.vipLevel ?? 0
  }
  await distributeDailyReferralCommissions(userId, level)

  return result
}

export async function recordDeposit(userId: string, amount: number) {
  return prisma.$transaction(async (tx) => {
    await tx.earningRecord.create({
      data: { userId, type: EARNING_TYPES.DEPOSIT, amount },
    })
    return tx.wallet.update({
      where: { userId },
      data: {
        balance: { increment: amount },
      },
    })
  })
}

export async function recordWithdrawal(
  userId: string,
  data: { amount: number; address: string; network: string; fee: number },
) {
  return prisma.$transaction(async (tx) => {
    const wallet = await tx.wallet.findUnique({ where: { userId } })
    if (!wallet || wallet.balance < data.amount) {
      throw new Error("INSUFFICIENT_BALANCE")
    }

    await tx.wallet.update({
      where: { userId },
      data: { balance: { decrement: data.amount } },
    })

    return tx.withdrawalRequest.create({
      data: {
        userId,
        amount: data.amount,
        address: data.address,
        network: data.network,
        fee: data.fee,
        status: "PENDING",
      },
    })
  })
}
