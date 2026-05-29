import { prisma } from "@/lib/db"

export async function setWithdrawalRequestStatus(id: string, newStatus: string) {
  const request = await prisma.withdrawalRequest.findUnique({ where: { id } })
  if (!request) throw new Error("NOT_FOUND")

  const oldStatus = request.status
  if (oldStatus === newStatus) {
    return prisma.withdrawalRequest.findUnique({
      where: { id },
      include: { user: { select: { id: true, email: true, vipLevel: true } } },
    })
  }

  if (oldStatus === "PENDING" && newStatus === "APPROVED") {
    return prisma.withdrawalRequest.update({
      where: { id },
      data: { status: "APPROVED", reviewedAt: new Date() },
      include: { user: { select: { id: true, email: true, vipLevel: true } } },
    })
  }

  if (oldStatus === "PENDING" && newStatus === "REJECTED") {
    return prisma.$transaction(async (tx) => {
      await tx.wallet.update({
        where: { userId: request.userId },
        data: { balance: { increment: request.amount } },
      })
      return tx.withdrawalRequest.update({
        where: { id },
        data: { status: "REJECTED", reviewedAt: new Date() },
        include: { user: { select: { id: true, email: true, vipLevel: true } } },
      })
    })
  }

  if (oldStatus === "APPROVED" && newStatus === "REJECTED") {
    return prisma.$transaction(async (tx) => {
      await tx.wallet.update({
        where: { userId: request.userId },
        data: { balance: { increment: request.amount } },
      })
      return tx.withdrawalRequest.update({
        where: { id },
        data: { status: "REJECTED", reviewedAt: new Date() },
        include: { user: { select: { id: true, email: true, vipLevel: true } } },
      })
    })
  }

  if (oldStatus === "REJECTED" && newStatus === "APPROVED") {
    const wallet = await prisma.wallet.findUnique({ where: { userId: request.userId } })
    if (!wallet || wallet.balance < request.amount) throw new Error("INSUFFICIENT_BALANCE")
    return prisma.$transaction(async (tx) => {
      await tx.wallet.update({
        where: { userId: request.userId },
        data: { balance: { decrement: request.amount } },
      })
      return tx.withdrawalRequest.update({
        where: { id },
        data: { status: "APPROVED", reviewedAt: new Date() },
        include: { user: { select: { id: true, email: true, vipLevel: true } } },
      })
    })
  }

  if (oldStatus === "APPROVED" && newStatus === "PENDING") {
    return prisma.$transaction(async (tx) => {
      await tx.wallet.update({
        where: { userId: request.userId },
        data: { balance: { increment: request.amount } },
      })
      return tx.withdrawalRequest.update({
        where: { id },
        data: { status: "PENDING", reviewedAt: null },
        include: { user: { select: { id: true, email: true, vipLevel: true } } },
      })
    })
  }

  if (oldStatus === "REJECTED" && newStatus === "PENDING") {
    const wallet = await prisma.wallet.findUnique({ where: { userId: request.userId } })
    if (!wallet || wallet.balance < request.amount) throw new Error("INSUFFICIENT_BALANCE")
    return prisma.$transaction(async (tx) => {
      await tx.wallet.update({
        where: { userId: request.userId },
        data: { balance: { decrement: request.amount } },
      })
      return tx.withdrawalRequest.update({
        where: { id },
        data: { status: "PENDING", reviewedAt: null },
        include: { user: { select: { id: true, email: true, vipLevel: true } } },
      })
    })
  }

  throw new Error("INVALID_STATUS_TRANSITION")
}

export async function approveWithdrawalRequest(id: string) {
  return setWithdrawalRequestStatus(id, "APPROVED")
}

export async function rejectWithdrawalRequest(id: string) {
  return setWithdrawalRequestStatus(id, "REJECTED")
}

export async function listWithdrawalRequests(status?: string) {
  return prisma.withdrawalRequest.findMany({
    where: status && status !== "ALL" ? { status } : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, email: true, vipLevel: true } },
    },
    take: 200,
  })
}
