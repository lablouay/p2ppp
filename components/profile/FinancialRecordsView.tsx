"use client"

import { useEffect, useState } from "react"
import {
  ArrowLeft,
  BarChart3,
  ClipboardList,
  Users,
  TrendingUp,
  Wallet,
  Loader2,
} from "lucide-react"
import { Area, AreaChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import { translations, type Language } from "@/lib/translations"
import { fetchFinancial, formatUsdt } from "@/lib/client-api"
import type { FinancialResponse } from "@/lib/types/api"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

interface FinancialRecordsViewProps {
  language: Language
  onBack: () => void
}

const earningsChartConfig = {
  tasks: { label: "Tasks", color: "var(--chart-1)" },
  referral: { label: "Referral", color: "var(--chart-2)" },
} satisfies ChartConfig

const performanceChartConfig = {
  total: { label: "Total", color: "var(--chart-1)" },
  tasks: { label: "Tasks", color: "var(--chart-2)" },
  referral: { label: "Referral", color: "var(--chart-3)" },
} satisfies ChartConfig

export default function FinancialRecordsView({ language, onBack }: FinancialRecordsViewProps) {
  const [period, setPeriod] = useState<"week" | "month">("week")
  const [financial, setFinancial] = useState<FinancialResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const t = translations[language]
  const isRTL = language === "ar"

  useEffect(() => {
    let active = true
    fetchFinancial()
      .then((data) => {
        if (active) setFinancial(data)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  if (loading || !financial) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-gold animate-spin" />
      </div>
    )
  }

  const { earnings, weeklyEarnings, monthlyEarnings, referralLevelEarnings, monthlyPerformance } = financial
  const periodData = period === "week" ? weeklyEarnings : monthlyEarnings
  const totalReferral = referralLevelEarnings.reduce((sum, item) => sum + item.amount, 0)

  const referralLevels = [
    { key: "A" as const, label: t.levelA, amount: referralLevelEarnings[0]?.amount ?? 0, count: referralLevelEarnings[0]?.count ?? 0, color: "text-gold", bg: "from-gold/15 to-gold/5", border: "border-gold/20" },
    { key: "B" as const, label: t.levelB, amount: referralLevelEarnings[1]?.amount ?? 0, count: referralLevelEarnings[1]?.count ?? 0, color: "text-blue-400", bg: "from-blue-400/15 to-blue-400/5", border: "border-blue-400/20" },
    { key: "C" as const, label: t.levelC, amount: referralLevelEarnings[2]?.amount ?? 0, count: referralLevelEarnings[2]?.count ?? 0, color: "text-green", bg: "from-green/15 to-green/5", border: "border-green/20" },
  ]

  const localizedChartConfig: ChartConfig = {
    tasks: { ...earningsChartConfig.tasks, label: t.taskEarnings },
    referral: { ...earningsChartConfig.referral, label: t.referralEarnings },
  }

  const localizedPerformanceConfig: ChartConfig = {
    total: { ...performanceChartConfig.total, label: t.totalEarnings },
    tasks: { ...performanceChartConfig.tasks, label: t.taskEarnings },
    referral: { ...performanceChartConfig.referral, label: t.referralEarnings },
  }

  return (
    <div className="flex flex-col gap-3 sm:gap-4 lg:gap-5 pb-4" dir={isRTL ? "rtl" : "ltr"}>
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-secondary border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-gold/40 transition-all cursor-pointer shrink-0"
        >
          <ArrowLeft className={`w-4 h-4 ${isRTL ? "rotate-180" : ""}`} />
        </button>
        <div className="min-w-0 flex-1">
          <h2 className="text-base sm:text-lg font-bold text-foreground">{t.financialRecords}</h2>
          <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{t.financialRecordsDesc}</p>
        </div>
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gold/15 flex items-center justify-center shrink-0">
          <BarChart3 className="w-4 h-4 text-gold" />
        </div>
      </div>

      <div className="bg-gradient-to-br from-card-highlight-from to-card border border-border rounded-xl sm:rounded-2xl p-4 sm:p-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-gold/5 -translate-y-8 translate-x-8" />
        <div className="flex items-start justify-between gap-3 relative">
          <div>
            <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-widest mb-1">{t.totalEarnings}</p>
            <p className="text-2xl sm:text-3xl font-bold text-foreground">{formatUsdt(earnings.totalAllTime)}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">USDT</p>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gold/15 flex items-center justify-center shrink-0">
            <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-gold" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:gap-3 mt-4 pt-4 border-t border-border/60">
          <div>
            <p className="text-[9px] sm:text-[10px] text-muted-foreground mb-0.5">{t.taskEarnings}</p>
            <p className="text-sm sm:text-base font-bold text-foreground">{formatUsdt(earnings.monthTasks)}</p>
          </div>
          <div>
            <p className="text-[9px] sm:text-[10px] text-muted-foreground mb-0.5">{t.referralEarnings}</p>
            <p className="text-sm sm:text-base font-bold text-green">{formatUsdt(earnings.monthReferral)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {[
          { label: t.earnedTodayTasks, value: earnings.todayTasks, icon: ClipboardList, color: "text-gold" },
          { label: t.thisWeek, value: earnings.weekTasks + earnings.weekReferral, icon: TrendingUp, color: "text-blue-400" },
          { label: t.thisMonth, value: earnings.monthTasks + earnings.monthReferral, icon: BarChart3, color: "text-green" },
        ].map((stat) => (
          <div key={stat.label} className="bg-card border border-border rounded-xl sm:rounded-2xl p-2.5 sm:p-3 text-center">
            <stat.icon className={`w-4 h-4 mx-auto mb-1.5 ${stat.color}`} />
            <p className="text-sm sm:text-base font-bold text-foreground">{formatUsdt(stat.value)}</p>
            <p className="text-[8px] sm:text-[9px] text-muted-foreground mt-0.5 line-clamp-2">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-5">
        <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4">
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-foreground">{t.taskEarningsChart}</h3>
            <p className="text-[10px] text-muted-foreground">{t.taskEarningsChartDesc}</p>
          </div>
          <div className="flex bg-secondary rounded-lg p-0.5 shrink-0">
            {(["week", "month"] as const).map((key) => (
              <button
                key={key}
                onClick={() => setPeriod(key)}
                className={`px-2.5 sm:px-3 py-1.5 rounded-md text-[10px] sm:text-xs font-semibold transition-all cursor-pointer ${
                  period === key ? "bg-gold text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {key === "week" ? t.weeklyView : t.monthlyView}
              </button>
            ))}
          </div>
        </div>

        <ChartContainer config={localizedChartConfig} className="aspect-[2/1] sm:aspect-[2.2/1] w-full min-h-[180px]">
          <AreaChart data={periodData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="fillTasks" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-tasks)" stopOpacity={0.35} />
                <stop offset="95%" stopColor="var(--color-tasks)" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="fillReferral" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-referral)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--color-referral)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} width={36} tickFormatter={(v) => `$${v}`} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area type="monotone" dataKey="tasks" stroke="var(--color-tasks)" fill="url(#fillTasks)" strokeWidth={2} />
            <Area type="monotone" dataKey="referral" stroke="var(--color-referral)" fill="url(#fillReferral)" strokeWidth={2} />
          </AreaChart>
        </ChartContainer>
      </div>

      <div>
        <div className="mb-2 sm:mb-3">
          <h3 className="text-xs sm:text-sm font-bold text-foreground">{t.referralBreakdown}</h3>
          <p className="text-[10px] text-muted-foreground">{t.referralBreakdownDesc}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
          {referralLevels.map((level) => (
            <div
              key={level.key}
              className={`bg-gradient-to-br ${level.bg} border ${level.border} rounded-xl sm:rounded-2xl p-3 sm:p-4`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Users className={`w-4 h-4 ${level.color}`} />
                <span className={`text-[10px] sm:text-xs font-semibold ${level.color}`}>{level.label}</span>
              </div>
              <p className="text-lg sm:text-xl font-bold text-foreground">{formatUsdt(level.amount)}</p>
              <p className="text-[9px] sm:text-[10px] text-muted-foreground mt-1">
                {level.count} {t.referrals}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-2 sm:mt-3 bg-card border border-border rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between">
          <span className="text-[10px] sm:text-xs text-muted-foreground">{t.referralEarningsTotal}</span>
          <span className="text-sm sm:text-base font-bold text-green">{formatUsdt(totalReferral)}</span>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-5">
        <div className="mb-3 sm:mb-4">
          <h3 className="text-xs sm:text-sm font-bold text-foreground">{t.monthlyPerformance}</h3>
          <p className="text-[10px] text-muted-foreground">{t.monthlyPerformanceDesc}</p>
        </div>

        <ChartContainer config={localizedPerformanceConfig} className="aspect-[2/1] sm:aspect-[2.2/1] w-full min-h-[180px]">
          <LineChart data={monthlyPerformance} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} width={40} tickFormatter={(v) => `$${v}`} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line type="monotone" dataKey="total" stroke="var(--color-total)" strokeWidth={2.5} dot={{ r: 3, fill: "var(--color-total)" }} activeDot={{ r: 5 }} />
            <Line type="monotone" dataKey="tasks" stroke="var(--color-tasks)" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
            <Line type="monotone" dataKey="referral" stroke="var(--color-referral)" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
          </LineChart>
        </ChartContainer>

        <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mt-3 pt-3 border-t border-border">
          {[
            { key: "total", color: "bg-chart-1", label: t.totalEarnings },
            { key: "tasks", color: "bg-chart-2", label: t.taskEarnings },
            { key: "referral", color: "bg-chart-3", label: t.referralEarnings },
          ].map((item) => (
            <div key={item.key} className="flex items-center gap-1.5">
              <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
              <span className="text-[10px] text-muted-foreground">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
