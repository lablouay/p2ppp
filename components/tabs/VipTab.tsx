"use client"

import { useState, useRef } from "react"
import { Crown, Zap, TrendingUp, Star } from "lucide-react"
import { translations, type Language } from "@/lib/translations"
import { vipPlans, formatNumber, formatCurrency, getPlanTotalPrice } from "@/lib/vip-data"
import { useUser } from "@/contexts/user-context"
import VipUpgradeModal from "@/components/vip/VipUpgradeModal"
import UpgradeLogModal from "@/components/vip/UpgradeLogModal"
import DepositModal from "@/components/deposit/DepositModal"

interface VipTabProps {
  language: Language
}

const tierColors: Record<number, { bg: string; border: string; badge: string }> = {
  0:  { bg: "from-secondary to-card dark:from-zinc-800/60 dark:to-zinc-900", border: "border-border dark:border-zinc-700/40", badge: "bg-secondary text-muted-foreground dark:bg-zinc-600/30 dark:text-zinc-300" },
  1:  { bg: "from-secondary to-card dark:from-zinc-800/80 dark:to-zinc-900", border: "border-border dark:border-zinc-600/40", badge: "bg-secondary text-muted-foreground dark:bg-zinc-600/30 dark:text-zinc-300" },
  2:  { bg: "from-blue-100/80 to-card dark:from-blue-900/40 dark:to-zinc-900", border: "border-blue-200 dark:border-blue-600/30", badge: "bg-blue-100 text-blue-700 dark:bg-blue-600/20 dark:text-blue-300" },
  3:  { bg: "from-green/10 to-card dark:to-zinc-900", border: "border-green/20", badge: "bg-green/10 text-green" },
  4:  { bg: "from-amber-100/80 to-card dark:from-yellow-800/30 dark:to-zinc-900", border: "border-amber-200 dark:border-yellow-600/30", badge: "bg-amber-100 text-amber-800 dark:bg-yellow-600/20 dark:text-yellow-300" },
  5:  { bg: "from-orange-100/80 to-card dark:from-orange-800/30 dark:to-zinc-900", border: "border-orange-200 dark:border-orange-500/30", badge: "bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-300" },
  6:  { bg: "from-red-100/80 to-card dark:from-red-900/30 dark:to-zinc-900", border: "border-red-200 dark:border-red-500/30", badge: "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300" },
  7:  { bg: "from-pink-100/80 to-card dark:from-pink-900/30 dark:to-zinc-900", border: "border-pink-200 dark:border-pink-500/30", badge: "bg-pink-100 text-pink-800 dark:bg-pink-500/20 dark:text-pink-300" },
  8:  { bg: "from-gold/10 to-card dark:to-zinc-900", border: "border-gold/30", badge: "bg-gold/10 text-gold" },
  9:  { bg: "from-gold/15 to-card dark:to-zinc-900", border: "border-gold/40", badge: "bg-gold/15 text-gold" },
  10: { bg: "from-gold/20 to-card dark:to-zinc-900", border: "border-gold/50", badge: "bg-gold/20 text-gold" },
}

export default function VipTab({ language }: VipTabProps) {
  const { data, refresh } = useUser()
  const t = translations[language]
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [showUpgradeLog, setShowUpgradeLog] = useState(false)
  const [showDeposit, setShowDeposit] = useState(false)
  const [preselectedLevel, setPreselectedLevel] = useState<number | null>(null)
  const [depositMin, setDepositMin] = useState<number | undefined>(undefined)
  const presetHandled = useRef(false)

  const vipLevel = data?.user.vipLevel ?? 0
  const currentPlan = vipPlans.find((p) => p.level === vipLevel) ?? vipPlans[0]

  const openUpgrade = (level?: number) => {
    presetHandled.current = false
    setPreselectedLevel(level ?? null)
    setShowUpgrade(true)
  }

  const handleUpgradeSuccess = () => {
    presetHandled.current = false
    setPreselectedLevel(null)
    void refresh()
  }

  return (
    <>
      <div className="flex flex-col gap-3 sm:gap-4 lg:gap-5 pb-4">
        <div className="flex items-start sm:items-center justify-between gap-2 flex-wrap">
          <div className="min-w-0 flex-1">
            <h2 className="text-sm sm:text-base lg:text-lg font-bold text-foreground">
              {language === "ar" ? "مستويات VIP" : language === "fr" ? "Niveaux VIP" : "VIP Tiers"}
            </h2>
            <p className="text-[9px] sm:text-[10px] lg:text-xs text-muted-foreground mt-0.5">
              {language === "ar"
                ? "افتح مستويات أعلى لعوائد يومية أكبر"
                : language === "fr"
                ? "Débloquez des niveaux supérieurs pour des rendements plus élevés"
                : "Unlock higher tiers for greater daily returns"}
            </p>
          </div>
          <button
            onClick={() => setShowUpgradeLog(true)}
            className="text-[9px] sm:text-[10px] lg:text-xs text-gold font-medium bg-gold/10 border border-gold/20 rounded-lg sm:rounded-xl px-2 sm:px-2.5 lg:px-3 py-1 sm:py-1.5 shrink-0"
          >
            {t.upgradeLog}
          </button>
        </div>

        <div className="bg-card border border-border rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-5 flex items-center gap-3 sm:gap-4">
          <div className="w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg sm:rounded-xl bg-secondary flex items-center justify-center shrink-0">
            <Star className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-gold" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[9px] sm:text-[10px] lg:text-xs text-muted-foreground">{t.currentStatus}</p>
            <p className="text-xs sm:text-sm lg:text-base font-bold text-foreground truncate">
              {currentPlan.name} {vipLevel === 0 ? `(${t.free})` : ""}
            </p>
          </div>
          <button
            onClick={() => openUpgrade()}
            className="text-[9px] sm:text-[10px] lg:text-xs font-bold text-primary-foreground bg-gold hover:bg-gold-light rounded-lg sm:rounded-xl px-2.5 sm:px-3 lg:px-4 py-1.5 sm:py-2 lg:py-2.5 transition-all active:scale-95 shrink-0"
          >
            {language === "ar" ? "ترقية" : language === "fr" ? "Améliorer" : "Upgrade"}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {vipPlans.map((plan) => {
            const colors = tierColors[plan.level]
            const isTopTier = plan.level >= 8
            const isFree = plan.level === 0
            const totalPrice = getPlanTotalPrice(plan)
            const isCurrent = plan.level === vipLevel

            return (
              <div
                key={plan.level}
                className={`bg-gradient-to-br ${colors.bg} border ${colors.border} rounded-xl sm:rounded-2xl overflow-hidden`}
              >
                <div className="p-3 sm:p-4 lg:p-5">
                  <div className="flex items-center gap-2 mb-3 sm:mb-4 flex-wrap">
                    <Crown className={`w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 shrink-0 ${isTopTier ? "text-gold" : "text-muted-foreground"}`} />
                    <span className={`text-[10px] sm:text-xs lg:text-sm font-bold rounded-full px-1.5 sm:px-2 lg:px-2.5 py-0.5 ${colors.badge}`}>
                      {plan.name}
                    </span>
                    {isCurrent && (
                      <span className="text-[9px] sm:text-[10px] lg:text-xs font-semibold text-green ml-auto">
                        {t.currentPlan}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:gap-4 mb-3 sm:mb-4">
                    <div>
                      <p className="text-[9px] sm:text-[10px] lg:text-xs text-muted-foreground mb-0.5 sm:mb-1 flex items-center gap-1">
                        <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
                        <span className="truncate">{t.dailyProfit}</span>
                      </p>
                      <p className="text-base sm:text-lg lg:text-xl font-bold text-foreground">
                        {formatCurrency(plan.dailySalary, plan.dailySalary % 1 === 0 ? 0 : 1)}
                        <span className="text-[9px] sm:text-[10px] lg:text-xs text-muted-foreground font-normal ml-1">USDT</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] sm:text-[10px] lg:text-xs text-muted-foreground mb-0.5 sm:mb-1 truncate">{t.salary30Days}</p>
                      <p className="text-base sm:text-lg lg:text-xl font-bold text-foreground">
                        {formatNumber(plan.salary30Days)}
                        <span className="text-[9px] sm:text-[10px] lg:text-xs text-muted-foreground font-normal ml-1">USDT</span>
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-1 sm:gap-2 pt-2 sm:pt-3 border-t border-border/30">
                    <div className="text-center">
                      <p className="text-[8px] sm:text-[9px] lg:text-[10px] text-muted-foreground mb-0.5 truncate">{t.dailyTasks}</p>
                      <p className="text-[10px] sm:text-xs lg:text-sm font-bold text-foreground">{plan.tasksPerDay}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[8px] sm:text-[9px] lg:text-[10px] text-muted-foreground mb-0.5 truncate">{t.annualSalary}</p>
                      <p className="text-[10px] sm:text-xs lg:text-sm font-bold text-foreground">{formatNumber(plan.annualSalary)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[8px] sm:text-[9px] lg:text-[10px] text-muted-foreground mb-0.5 truncate">{t.activationFee}</p>
                      <p className="text-[10px] sm:text-xs lg:text-sm font-bold text-foreground">
                        {plan.activationFee ? `$${formatNumber(plan.activationFee)}` : "—"}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-[8px] sm:text-[9px] lg:text-[10px] text-muted-foreground mb-0.5 truncate">{t.workDeposit}</p>
                      <p className="text-[10px] sm:text-xs lg:text-sm font-bold text-foreground">
                        {plan.workDeposit ? `$${formatNumber(plan.workDeposit)}` : "—"}
                      </p>
                    </div>
                  </div>
                </div>

                {!isFree && !isCurrent && (
                  <button
                    onClick={() => openUpgrade(plan.level)}
                    className="w-full flex items-center justify-center gap-2 py-2 sm:py-2.5 lg:py-3 border-t border-border/30 text-[10px] sm:text-xs lg:text-sm font-bold bg-gold/10 hover:bg-gold/20 text-gold transition-all"
                  >
                    ${formatNumber(totalPrice)} USDT — {t.unlockNow}
                  </button>
                )}
                {isCurrent && (
                  <div className="w-full flex items-center justify-center gap-2 py-2 sm:py-2.5 lg:py-3 border-t border-border/30 text-[10px] sm:text-xs lg:text-sm font-medium bg-green/10 text-green">
                    {t.currentPlan}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <VipUpgradeModal
        isOpen={showUpgrade}
        onClose={() => {
          setShowUpgrade(false)
          setPreselectedLevel(null)
        }}
        language={language}
        preselectedLevel={preselectedLevel}
        onContinueDeposit={(min) => {
          setDepositMin(min)
          setShowDeposit(true)
        }}
        onSuccess={handleUpgradeSuccess}
      />
      <UpgradeLogModal isOpen={showUpgradeLog} onClose={() => setShowUpgradeLog(false)} language={language} />
      <DepositModal
        isOpen={showDeposit}
        onClose={() => setShowDeposit(false)}
        language={language}
        minAmount={depositMin}
        onSuccess={refresh}
      />
    </>
  )
}
