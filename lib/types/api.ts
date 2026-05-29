export interface ApiUser {
  id: string
  email: string
  avatarUrl: string | null
  avatarPreset: string
  inviteCode: string
  vipLevel: number
  twoFactorEnabled: boolean
  memberSince: string
}

export interface ApiWallet {
  balance: number
  workDeposit: number
}

export interface VipPlanOption {
  level: number
  name: string
  activationFee: number | null
  workDeposit: number | null
  totalPrice: number
  dailySalary: number
}

export interface VipUpgradePreview {
  state: "NO_BALANCE" | "INSUFFICIENT" | "SELECT_PLAN"
  minRequired: number
  affordable: VipPlanOption[]
  balance: number
  currentVipLevel: number
}

export interface VipUpgradeLogEntry {
  id: string
  vipLevel: number
  planName: string
  activationFee: number
  workDeposit: number
  totalPaid: number
  createdAt: string
}

export interface ApiEarnings {
  todayTasks: number
  weekTasks: number
  monthTasks: number
  weekReferral: number
  monthReferral: number
  earnedToday: number
  earnedThisMonth: number
  earnedLastMonth: number
  totalAllTime: number
}

export interface DailyEarningPoint {
  label: string
  tasks: number
  referral: number
}

export interface MonthlyPerformancePoint {
  label: string
  total: number
  tasks: number
  referral: number
}

export interface ReferralLevelEarning {
  level: "A" | "B" | "C"
  amount: number
  count: number
}

export interface TeamLevelStats {
  level: number
  label: string
  commissionRate: number
  dailyCommissionRate: number
  registered: number
  valid: number
  totalRevenue: number
}

export interface DashboardResponse {
  user: ApiUser
  wallet: ApiWallet
  earnings: ApiEarnings
  weeklyEarnings: DailyEarningPoint[]
  monthlyEarnings: DailyEarningPoint[]
  referralLevelEarnings: ReferralLevelEarning[]
  monthlyPerformance: MonthlyPerformancePoint[]
}

export interface FinancialResponse {
  wallet: ApiWallet
  earnings: ApiEarnings
  weeklyEarnings: DailyEarningPoint[]
  monthlyEarnings: DailyEarningPoint[]
  referralLevelEarnings: ReferralLevelEarning[]
  monthlyPerformance: MonthlyPerformancePoint[]
}
