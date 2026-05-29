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

export const financialSummary = {
  todayTasks: 12.5,
  weekTasks: 86.4,
  monthTasks: 342.8,
  weekReferral: 28.6,
  monthReferral: 112.4,
  totalAllTime: 1847.25,
}

export const weeklyEarnings: DailyEarningPoint[] = [
  { label: "Mon", tasks: 8.2, referral: 2.1 },
  { label: "Tue", tasks: 11.5, referral: 3.4 },
  { label: "Wed", tasks: 9.8, referral: 1.8 },
  { label: "Thu", tasks: 14.2, referral: 4.2 },
  { label: "Fri", tasks: 12.0, referral: 5.6 },
  { label: "Sat", tasks: 15.6, referral: 6.1 },
  { label: "Sun", tasks: 15.1, referral: 5.4 },
]

export const monthlyEarnings: DailyEarningPoint[] = [
  { label: "W1", tasks: 68.4, referral: 22.5 },
  { label: "W2", tasks: 74.2, referral: 26.8 },
  { label: "W3", tasks: 82.6, referral: 28.4 },
  { label: "W4", tasks: 117.6, referral: 34.7 },
]

export const referralLevelEarnings: ReferralLevelEarning[] = [
  { level: "A", amount: 68.4, count: 12 },
  { level: "B", amount: 28.6, count: 34 },
  { level: "C", amount: 15.4, count: 58 },
]

export const monthlyPerformance: MonthlyPerformancePoint[] = [
  { label: "Jan", total: 420, tasks: 310, referral: 110 },
  { label: "Feb", total: 385, tasks: 278, referral: 107 },
  { label: "Mar", total: 512, tasks: 368, referral: 144 },
  { label: "Apr", total: 468, tasks: 332, referral: 136 },
  { label: "May", total: 455.2, tasks: 342.8, referral: 112.4 },
  { label: "Jun", total: 0, tasks: 0, referral: 0 },
]

export function formatUsdt(value: number) {
  return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
