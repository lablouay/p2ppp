import { prisma } from "@/lib/db"
import {
  depositCommissions,
  dailyCommissions,
} from "@/lib/vip-data"
import { EARNING_TYPES } from "@/lib/services/financial"

function round(value: number) {
  return Math.round(value * 100) / 100
}

export async function getReferralChain(userId: string) {
  const chain: { id: string }[] = []
  let user = await prisma.user.findUnique({
    where: { id: userId },
    select: { referredById: true },
  })
  let referrerId = user?.referredById ?? null

  for (let depth = 0; depth < 3 && referrerId; depth++) {
    const referrer = await prisma.user.findUnique({
      where: { id: referrerId },
      select: { id: true, referredById: true },
    })
    if (!referrer) break
    chain.push({ id: referrer.id })
    referrerId = referrer.referredById
  }

  return chain
}

async function creditReferrer(
  referrerId: string,
  type: string,
  amount: number,
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
) {
  if (amount <= 0) return

  await tx.earningRecord.create({
    data: { userId: referrerId, type, amount },
  })
  await tx.wallet.update({
    where: { userId: referrerId },
    data: { balance: { increment: amount } },
  })
}

/** VIP plan purchase — fixed commission from site table per VIP tier */
export async function distributeVipUpgradeReferralCommissions(
  payerUserId: string,
  purchasedVipLevel: number,
) {
  const row = depositCommissions.find((c) => c.level === purchasedVipLevel)
  if (!row) return

  const chain = await getReferralChain(payerUserId)
  const amounts = [row.levelA, row.levelB, row.levelC]
  const types = [
    EARNING_TYPES.REFERRAL_A,
    EARNING_TYPES.REFERRAL_B,
    EARNING_TYPES.REFERRAL_C,
  ]

  await prisma.$transaction(async (tx) => {
    for (let i = 0; i < chain.length; i++) {
      await creditReferrer(chain[i].id, types[i], round(amounts[i]), tx)
    }
  })
}

/** Task earnings — fixed daily commission from table based on earner VIP level */
export async function distributeDailyReferralCommissions(
  earnerUserId: string,
  earnerVipLevel: number,
) {
  const level = Math.max(1, earnerVipLevel)
  const row = dailyCommissions.find((c) => c.level === level) ?? dailyCommissions[0]
  if (!row) return

  const chain = await getReferralChain(earnerUserId)
  const amounts = [row.levelA, row.levelB, row.levelC]
  const types = [
    EARNING_TYPES.REFERRAL_A,
    EARNING_TYPES.REFERRAL_B,
    EARNING_TYPES.REFERRAL_C,
  ]

  await prisma.$transaction(async (tx) => {
    for (let i = 0; i < chain.length; i++) {
      await creditReferrer(chain[i].id, types[i], round(amounts[i]), tx)
    }
  })
}

/** @deprecated Use distributeVipUpgradeReferralCommissions */
export async function distributeDepositReferralCommissions(
  payerUserId: string,
  purchasedVipLevel: number,
) {
  return distributeVipUpgradeReferralCommissions(payerUserId, purchasedVipLevel)
}
