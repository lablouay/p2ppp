// VIP Plan data based on the provided tables
export interface VIPPlan {
  level: number
  name: string
  tasksPerDay: number
  dailySalary: number
  salary30Days: number
  annualSalary: number
  activationFee: number | null
  workDeposit: number | null
}

// Commission rates for referral deposits (when referral buys a VIP plan)
// You earn % of their deposit amount
export const depositCommissionRates = {
  levelA: 8, // Direct referral - 8%
  levelB: 4, // Level 2 - 4%
  levelC: 1, // Level 3 - 1%
}

// Commission on deposit amounts per VIP level (راتب التوظيف)
export interface DepositCommission {
  level: number
  levelA: number
  levelB: number
  levelC: number
}

export const depositCommissions: DepositCommission[] = [
  { level: 1, levelA: 8, levelB: 4, levelC: 1 },
  { level: 2, levelA: 16, levelB: 8, levelC: 2 },
  { level: 3, levelA: 32, levelB: 16, levelC: 4 },
  { level: 4, levelA: 64, levelB: 32, levelC: 8 },
  { level: 5, levelA: 128, levelB: 64, levelC: 16 },
  { level: 6, levelA: 256, levelB: 128, levelC: 32 },
  { level: 7, levelA: 512, levelB: 256, levelC: 64 },
  { level: 8, levelA: 1024, levelB: 512, levelC: 128 },
  { level: 9, levelA: 2048, levelB: 1024, levelC: 256 },
  { level: 10, levelA: 4096, levelB: 2048, levelC: 512 },
]

// Commission rates for daily earnings (when referral earns daily)
// You earn % of their daily earnings
export const dailyEarningsCommissionRates = {
  levelA: 4, // Direct referral - 4%
  levelB: 2, // Level 2 - 2%
  levelC: 1, // Level 3 - 1%
}

// Daily earnings commission amounts per VIP level (إدارة الرواتب)
export interface DailyCommission {
  level: number
  levelA: number
  levelB: number
  levelC: number
}

export const dailyCommissions: DailyCommission[] = [
  { level: 1, levelA: 0.10, levelB: 0.05, levelC: 0.025 },
  { level: 2, levelA: 0.20, levelB: 0.10, levelC: 0.05 },
  { level: 3, levelA: 0.40, levelB: 0.20, levelC: 0.10 },
  { level: 4, levelA: 0.80, levelB: 0.40, levelC: 0.20 },
  { level: 5, levelA: 1.60, levelB: 0.80, levelC: 0.40 },
  { level: 6, levelA: 3.20, levelB: 1.60, levelC: 0.80 },
  { level: 7, levelA: 6.40, levelB: 3.20, levelC: 1.60 },
  { level: 8, levelA: 12.80, levelB: 6.40, levelC: 3.20 },
  { level: 9, levelA: 25.60, levelB: 12.80, levelC: 6.40 },
  { level: 10, levelA: 51.20, levelB: 25.60, levelC: 12.80 },
]

// VIP Plans data from the table
export const vipPlans: VIPPlan[] = [
  {
    level: 0,
    name: 'VIP 0',
    tasksPerDay: 2,
    dailySalary: 2,
    salary30Days: 0,
    annualSalary: 0,
    activationFee: null,
    workDeposit: null,
  },
  {
    level: 1,
    name: 'VIP 1',
    tasksPerDay: 5,
    dailySalary: 2.5,
    salary30Days: 75,
    annualSalary: 912.5,
    activationFee: 25,
    workDeposit: 100,
  },
  {
    level: 2,
    name: 'VIP 2',
    tasksPerDay: 10,
    dailySalary: 5,
    salary30Days: 150,
    annualSalary: 1825,
    activationFee: 50,
    workDeposit: 200,
  },
  {
    level: 3,
    name: 'VIP 3',
    tasksPerDay: 20,
    dailySalary: 10,
    salary30Days: 300,
    annualSalary: 3650,
    activationFee: 100,
    workDeposit: 400,
  },
  {
    level: 4,
    name: 'VIP 4',
    tasksPerDay: 40,
    dailySalary: 20,
    salary30Days: 600,
    annualSalary: 7300,
    activationFee: 200,
    workDeposit: 800,
  },
  {
    level: 5,
    name: 'VIP 5',
    tasksPerDay: 80,
    dailySalary: 40,
    salary30Days: 1200,
    annualSalary: 14600,
    activationFee: 400,
    workDeposit: 1600,
  },
  {
    level: 6,
    name: 'VIP 6',
    tasksPerDay: 160,
    dailySalary: 80,
    salary30Days: 2400,
    annualSalary: 29200,
    activationFee: 800,
    workDeposit: 3200,
  },
  {
    level: 7,
    name: 'VIP 7',
    tasksPerDay: 320,
    dailySalary: 160,
    salary30Days: 4800,
    annualSalary: 58400,
    activationFee: 1600,
    workDeposit: 6400,
  },
  {
    level: 8,
    name: 'VIP 8',
    tasksPerDay: 640,
    dailySalary: 320,
    salary30Days: 9600,
    annualSalary: 116800,
    activationFee: 3200,
    workDeposit: 12800,
  },
  {
    level: 9,
    name: 'VIP 9',
    tasksPerDay: 1280,
    dailySalary: 640,
    salary30Days: 19200,
    annualSalary: 233600,
    activationFee: 6400,
    workDeposit: 25600,
  },
  {
    level: 10,
    name: 'VIP 10',
    tasksPerDay: 2560,
    dailySalary: 1280,
    salary30Days: 38400,
    annualSalary: 467200,
    activationFee: 12800,
    workDeposit: 51200,
  },
]

export function formatNumber(num: number): string {
  return new Intl.NumberFormat().format(num)
}

export function formatCurrency(num: number, decimals = 2): string {
  return num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

export function getPlanTotalPrice(plan: VIPPlan) {
  if (plan.level === 0 || plan.activationFee == null || plan.workDeposit == null) {
    return 0
  }
  return plan.activationFee + plan.workDeposit
}

export function getLowestPaidPlan() {
  return vipPlans.find((plan) => plan.level === 1)!
}

export function getAffordablePlans(balance: number, currentLevel: number) {
  return vipPlans.filter(
    (plan) =>
      plan.level !== currentLevel &&
      plan.level > 0 &&
      getPlanTotalPrice(plan) > 0 &&
      getPlanTotalPrice(plan) <= balance,
  )
}
