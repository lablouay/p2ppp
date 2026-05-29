import { authenticator } from "otplib"
import { prisma } from "@/lib/db"

authenticator.options = { window: 1 }

export function generateTwoFactorSecret(email: string) {
  const secret = authenticator.generateSecret()
  const otpauth = authenticator.keyuri(email, "NexEarn", secret)
  return { secret, otpauth }
}

export function verifyTwoFactorToken(secret: string, token: string) {
  return authenticator.verify({ token, secret })
}

export async function enableTwoFactor(userId: string, secret: string, token: string) {
  if (!verifyTwoFactorToken(secret, token)) {
    throw new Error("INVALID_2FA")
  }

  return prisma.user.update({
    where: { id: userId },
    data: { twoFactorSecret: secret, twoFactorEnabled: true },
  })
}

export async function disableTwoFactor(userId: string, password: string, passwordHash: string) {
  const bcrypt = await import("bcryptjs")
  const valid = await bcrypt.compare(password, passwordHash)
  if (!valid) throw new Error("INVALID_PASSWORD")

  return prisma.user.update({
    where: { id: userId },
    data: { twoFactorSecret: null, twoFactorEnabled: false },
  })
}

export async function verifyUserTwoFactor(userId: string, token: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user?.twoFactorEnabled || !user.twoFactorSecret) return true
  if (!verifyTwoFactorToken(user.twoFactorSecret, token)) {
    throw new Error("INVALID_2FA")
  }
  return true
}
