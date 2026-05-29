import bcrypt from "bcryptjs"
import { prisma } from "@/lib/db"

export async function listUsersForAdmin() {
  return prisma.user.findMany({
    select: {
      id: true,
      email: true,
      vipLevel: true,
      banned: true,
      inviteCode: true,
      createdAt: true,
      wallet: { select: { balance: true, workDeposit: true } },
      _count: { select: { referrals: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function updateUserAdmin(
  userId: string,
  data: {
    email?: string
    vipLevel?: number
    balance?: number
    workDeposit?: number
    banned?: boolean
    password?: string
  },
) {
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { wallet: true } })
  if (!user) throw new Error("NOT_FOUND")

  if (data.email && data.email !== user.email) {
    const exists = await prisma.user.findUnique({ where: { email: data.email.trim().toLowerCase() } })
    if (exists && exists.id !== userId) throw new Error("EMAIL_EXISTS")
  }

  await prisma.$transaction(async (tx) => {
    const userUpdate: Record<string, unknown> = {}
    if (data.email) userUpdate.email = data.email.trim().toLowerCase()
    if (data.vipLevel !== undefined) userUpdate.vipLevel = data.vipLevel
    if (data.banned !== undefined) userUpdate.banned = data.banned
    if (data.password) {
      userUpdate.passwordHash = await bcrypt.hash(data.password, 12)
    }

    if (Object.keys(userUpdate).length > 0) {
      await tx.user.update({ where: { id: userId }, data: userUpdate })
    }

    if (user.wallet && (data.balance !== undefined || data.workDeposit !== undefined)) {
      await tx.wallet.update({
        where: { userId },
        data: {
          ...(data.balance !== undefined ? { balance: data.balance } : {}),
          ...(data.workDeposit !== undefined ? { workDeposit: data.workDeposit } : {}),
        },
      })
    }
  })

  return prisma.user.findUnique({
    where: { id: userId },
    include: { wallet: true },
  })
}

export async function deleteUserAdmin(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw new Error("NOT_FOUND")
  await prisma.user.delete({ where: { id: userId } })
  return { success: true }
}

export async function setUserBanned(userId: string, banned: boolean) {
  return prisma.user.update({
    where: { id: userId },
    data: { banned },
  })
}
