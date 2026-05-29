import { NextResponse } from "next/server"
import { ZodError } from "zod"

export function jsonOk<T>(data: T, status = 200) {
  return NextResponse.json(data, { status })
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status })
}

export function handleApiError(error: unknown) {
  if (error instanceof ZodError) {
    return jsonError(error.errors[0]?.message ?? "Invalid request", 400)
  }
  if (error instanceof Error) {
    if (error.message === "UNAUTHORIZED") return jsonError("Unauthorized", 401)
    if (error.message === "INVALID_CREDENTIALS") return jsonError("Invalid email or password", 401)
    if (error.message === "BANNED") return jsonError("Your account has been suspended", 403)
    if (error.message === "INVALID_STATUS_TRANSITION") return jsonError("Invalid status change", 400)
    if (error.message === "EMAIL_EXISTS") return jsonError("Email already registered", 409)
    if (error.message === "INVALID_INVITE") return jsonError("Invalid invitation code", 400)
    if (error.message === "INVALID_PASSWORD") return jsonError("Incorrect password", 401)
    if (error.message === "INSUFFICIENT_BALANCE") return jsonError("Insufficient balance", 400)
    if (error.message === "INVALID_PLAN") return jsonError("Invalid VIP plan", 400)
    if (error.message === "ALREADY_AT_LEVEL") return jsonError("You already have this VIP level or higher", 400)
    if (error.message === "INVALID_2FA") return jsonError("Invalid verification code", 401)
    if (error.message === "2FA_REQUIRED") return jsonError("Two-factor code required", 401)
    if (error.message === "NOT_FOUND") return jsonError("Not found", 404)
    if (error.message === "ALREADY_REVIEWED") return jsonError("Request already reviewed", 400)
    if (error.message === "TASK_NOT_FOUND") return jsonError("Task not found", 404)
    if (error.message === "DAILY_LIMIT_REACHED") return jsonError("Daily task limit reached", 400)
    if (error.message === "TASK_ALREADY_COMPLETED") return jsonError("Task already completed today", 400)
    return jsonError(error.message, 500)
  }
  return jsonError("Internal server error", 500)
}

export function sanitizeUser(user: {
  id: string
  email: string
  avatarUrl: string | null
  avatarPreset: string
  inviteCode: string
  vipLevel: number
  twoFactorEnabled: boolean
  createdAt: Date
}) {
  return {
    id: user.id,
    email: user.email,
    avatarUrl: user.avatarUrl,
    avatarPreset: user.avatarPreset,
    inviteCode: user.inviteCode,
    vipLevel: user.vipLevel,
    twoFactorEnabled: user.twoFactorEnabled,
    memberSince: user.createdAt.toISOString(),
  }
}
