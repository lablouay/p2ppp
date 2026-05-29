import { prisma } from "@/lib/db"
import { recordDeposit } from "@/lib/services/financial"

export async function createDepositRequest(
  userId: string,
  data: { amount: number; address: string; network: string },
) {
  return prisma.depositRequest.create({
    data: {
      userId,
      amount: data.amount,
      address: data.address,
      network: data.network,
      status: "PENDING",
    },
  })
}

async function debitWalletIfPossible(userId: string, amount: number) {
  const wallet = await prisma.wallet.findUnique({ where: { userId } })
  if (!wallet || wallet.balance < amount) throw new Error("INSUFFICIENT_BALANCE")
  await prisma.wallet.update({
    where: { userId },
    data: { balance: { decrement: amount } },
  })
}

export async function setDepositRequestStatus(id: string, newStatus: string) {
  const request = await prisma.depositRequest.findUnique({ where: { id } })
  if (!request) throw new Error("NOT_FOUND")

  const oldStatus = request.status
  if (oldStatus === newStatus) {
    return prisma.depositRequest.findUnique({
      where: { id },
      include: { user: { select: { id: true, email: true, vipLevel: true } } },
    })
  }

  if (oldStatus === "PENDING" && newStatus === "APPROVED") {
    await prisma.depositRequest.update({
      where: { id },
      data: { status: "APPROVED", reviewedAt: new Date() },
    })
    await recordDeposit(request.userId, request.amount)
  } else if (oldStatus === "PENDING" && newStatus === "REJECTED") {
    await prisma.depositRequest.update({
      where: { id },
      data: { status: "REJECTED", reviewedAt: new Date() },
    })
  } else if (oldStatus === "APPROVED" && newStatus === "REJECTED") {
    await debitWalletIfPossible(request.userId, request.amount)
    await prisma.depositRequest.update({
      where: { id },
      data: { status: "REJECTED", reviewedAt: new Date() },
    })
  } else if (oldStatus === "REJECTED" && newStatus === "APPROVED") {
    await prisma.depositRequest.update({
      where: { id },
      data: { status: "APPROVED", reviewedAt: new Date() },
    })
    await recordDeposit(request.userId, request.amount)
  } else if (oldStatus === "APPROVED" && newStatus === "PENDING") {
    await debitWalletIfPossible(request.userId, request.amount)
    await prisma.depositRequest.update({
      where: { id },
      data: { status: "PENDING", reviewedAt: null },
    })
  } else if (oldStatus === "REJECTED" && newStatus === "PENDING") {
    await prisma.depositRequest.update({
      where: { id },
      data: { status: "PENDING", reviewedAt: null },
    })
  } else {
    throw new Error("INVALID_STATUS_TRANSITION")
  }

  return prisma.depositRequest.findUnique({
    where: { id },
    include: { user: { select: { id: true, email: true, vipLevel: true } } },
  })
}

export async function approveDepositRequest(id: string) {
  return setDepositRequestStatus(id, "APPROVED")
}

export async function rejectDepositRequest(id: string) {
  return setDepositRequestStatus(id, "REJECTED")
}

export async function listDepositRequests(status?: string) {
  return prisma.depositRequest.findMany({
    where: status && status !== "ALL" ? { status } : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, email: true, vipLevel: true } },
    },
    take: 200,
  })
}
