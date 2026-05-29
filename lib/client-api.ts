import type {
  DashboardResponse,
  FinancialResponse,
  ApiUser,
  VipUpgradePreview,
  VipUpgradeLogEntry,
  TeamLevelStats,
} from "@/lib/types/api"

async function parseJson<T>(response: Response): Promise<T> {
  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.error ?? "Request failed")
  }
  return data as T
}

export async function loginRequest(email: string, password: string, totp?: string) {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, totp }),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data.error ?? "Request failed")
  if (data.requires2FA) return { requires2FA: true as const }
  return data as { user: ApiUser; wallet: { balance: number; workDeposit: number } }
}

export async function signupRequest(
  email: string,
  password: string,
  inviteCode?: string,
) {
  const response = await fetch("/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, inviteCode: inviteCode || undefined }),
  })
  return parseJson<{ user: ApiUser; wallet: { balance: number; workDeposit: number } }>(response)
}

export async function logoutRequest() {
  await fetch("/api/auth/logout", { method: "POST" })
}

export async function fetchDashboard() {
  const response = await fetch("/api/user/dashboard", { cache: "no-store" })
  return parseJson<DashboardResponse>(response)
}

export async function fetchFinancial() {
  const response = await fetch("/api/user/financial", { cache: "no-store" })
  return parseJson<FinancialResponse>(response)
}

export async function updateProfileRequest(data: {
  email: string
  avatarUrl: string | null
  avatarPreset: string
  password: string
}) {
  const response = await fetch("/api/user/profile", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  return parseJson<{ user: ApiUser }>(response)
}

export async function updatePasswordRequest(data: {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}) {
  const response = await fetch("/api/user/password", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  return parseJson<{ success: boolean }>(response)
}

export async function withdrawRequest(data: {
  amount: number
  address: string
  network: string
  password: string
  fee: number
}) {
  const response = await fetch("/api/user/withdraw", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  return parseJson(response)
}

export async function depositRequest(amount: number, address: string, network: string) {
  const response = await fetch("/api/user/deposit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount, address, network }),
  })
  return parseJson<{
    deposit: { id: string; amount: number; status: string; createdAt: string }
    message: string
  }>(response)
}

export async function fetchTeamStats() {
  const response = await fetch("/api/user/team", { cache: "no-store" })
  return parseJson<{
    teamSize: number
    teamRecharge: number
    newTeam: number
    firstRecharge: number
    firstWithdrawal: number
    totalReferralEarnings: number
    levels: TeamLevelStats[]
  }>(response)
}

export async function fetchUserTasks() {
  const response = await fetch("/api/user/tasks", { cache: "no-store" })
  return parseJson<{
    plan: { level: number; name: string; tasksPerDay: number; dailySalary: number }
    tasks: Array<{
      id: string
      title: string
      content: string
      link: string
      completed: boolean
      earnAmount: number
    }>
    stats: {
      totalToday: number
      completedToday: number
      remainingToday: number
      earnedToday: number
      rewardPerTask: number
    }
  }>(response)
}

export async function completeTaskRequest(taskId: string) {
  const response = await fetch(`/api/user/tasks/${taskId}/complete`, {
    method: "POST",
  })
  return parseJson<Awaited<ReturnType<typeof fetchUserTasks>>>(response)
}

export async function fetchVipPreview() {
  const response = await fetch("/api/user/vip/preview", { cache: "no-store" })
  return parseJson<VipUpgradePreview>(response)
}

export async function upgradeVipRequest(vipLevel: number) {
  const response = await fetch("/api/user/vip/upgrade", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ vipLevel }),
  })
  return parseJson<{ user: ApiUser; wallet: { balance: number; workDeposit: number } }>(response)
}

export async function fetchVipUpgrades() {
  const response = await fetch("/api/user/vip/upgrades", { cache: "no-store" })
  return parseJson<{ logs: VipUpgradeLogEntry[] }>(response)
}

export async function setup2FARequest() {
  const response = await fetch("/api/user/2fa/setup", { method: "POST" })
  return parseJson<{ secret: string; otpauth: string }>(response)
}

export async function enable2FARequest(secret: string, token: string) {
  const response = await fetch("/api/user/2fa/enable", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ secret, token }),
  })
  return parseJson<{ user: ApiUser }>(response)
}

export async function disable2FARequest(password: string) {
  const response = await fetch("/api/user/2fa/disable", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  })
  return parseJson<{ user: ApiUser }>(response)
}

export function formatUsdt(value: number) {
  return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
