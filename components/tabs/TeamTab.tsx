"use client"

import { useEffect, useState, useCallback } from "react"
import {
  Copy,
  Check,
  Twitter,
  Facebook,
  Send,
  Linkedin,
  Instagram,
  CalendarDays,
  Info,
  Loader2,
} from "lucide-react"
import { translations, type Language } from "@/lib/translations"
import {
  depositCommissions,
  dailyCommissions,
  formatCurrency,
} from "@/lib/vip-data"
import { useUser } from "@/contexts/user-context"
import { fetchTeamStats } from "@/lib/client-api"

interface TeamTabProps {
  language: Language
}

export default function TeamTab({ language }: TeamTabProps) {
  const { data } = useUser()
  const inviteCode = data?.user.inviteCode ?? "------"
  const inviteLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/signup?invite=${inviteCode}`
      : `/signup?invite=${inviteCode}`
  const t = translations[language]
  const [codeCopied, setCodeCopied] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  const [activeCommissionTab, setActiveCommissionTab] = useState<"deposit" | "daily">("deposit")
  const [team, setTeam] = useState<Awaited<ReturnType<typeof fetchTeamStats>> | null>(null)
  const [loading, setLoading] = useState(true)

  const loadTeam = useCallback(async () => {
    setLoading(true)
    try {
      setTeam(await fetchTeamStats())
    } catch {
      setTeam(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadTeam()
  }, [loadTeam])

  const copyCode = () => {
    navigator.clipboard.writeText(inviteCode)
    setCodeCopied(true)
    setTimeout(() => setCodeCopied(false), 2000)
  }

  const copyLink = () => {
    navigator.clipboard.writeText(inviteLink)
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2000)
  }

  const levelLabels = [t.levelA, t.levelB, t.levelC]
  const levelColors = [
    { color: "from-gold/20 to-gold/5", border: "border-gold/30", badge: "text-gold bg-gold/10" },
    { color: "from-blue-400/10 to-blue-400/5", border: "border-blue-400/20", badge: "text-blue-400 bg-blue-400/10" },
    { color: "from-green/10 to-green/5", border: "border-green/20", badge: "text-green bg-green/10" },
  ]

  const levels =
    team?.levels.map((lvl, i) => ({
      level: levelLabels[i] ?? `${t.level} ${lvl.level}`,
      commission: `${lvl.commissionRate}%`,
      dailyCommission: `${lvl.dailyCommissionRate}%`,
      registered: lvl.registered,
      valid: lvl.valid,
      totalRevenue: lvl.totalRevenue,
      ...levelColors[i],
    })) ?? []

  return (
    <div className="flex flex-col gap-3 sm:gap-4 lg:gap-5 pb-4">
      <div className="bg-card border border-border rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-5 xl:p-6">
        <p className="text-[9px] sm:text-[10px] lg:text-xs text-muted-foreground uppercase tracking-widest font-semibold mb-2 sm:mb-3">
          {t.invitationCode}
        </p>
        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 flex-wrap">
          <span className="text-xl sm:text-2xl lg:text-4xl font-bold tracking-widest text-foreground">{inviteCode}</span>
          <button
            onClick={copyCode}
            className="flex items-center gap-1 sm:gap-1.5 bg-gold text-primary-foreground text-[9px] sm:text-[10px] lg:text-xs font-bold rounded-lg sm:rounded-xl px-2 sm:px-2.5 lg:px-3 py-1.5 sm:py-2 transition-all hover:bg-gold-light active:scale-95"
          >
            {codeCopied ? <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> : <Copy className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
            {codeCopied ? (language === "ar" ? "تم!" : language === "fr" ? "Copié!" : "Copied!") : t.copy}
          </button>
        </div>

        <p className="text-[9px] sm:text-[10px] lg:text-xs text-muted-foreground mb-1.5 sm:mb-2">{t.shareReferralLink}</p>
        <div className="flex items-center gap-2 bg-secondary rounded-lg sm:rounded-xl px-2 sm:px-2.5 lg:px-3 py-2 sm:py-2.5 border border-border">
          <p className="text-[9px] sm:text-[10px] lg:text-xs text-muted-foreground flex-1 truncate min-w-0">{inviteLink}</p>
          <button
            onClick={copyLink}
            className="shrink-0 flex items-center gap-1 text-gold text-[9px] sm:text-[10px] lg:text-xs font-semibold"
          >
            {linkCopied ? <Check className="w-2.5 h-2.5" /> : <Copy className="w-2.5 h-2.5" />}
            {linkCopied ? (language === "ar" ? "تم" : language === "fr" ? "Copié" : "Copied") : t.copy}
          </button>
        </div>

        <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-3 sm:mt-4">
          {[Twitter, Facebook, Send, Linkedin, Instagram].map((Icon, i) => (
            <button
              key={i}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-secondary border border-border flex items-center justify-center text-muted-foreground"
            >
              <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-2 sm:mb-3">
          <CalendarDays className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gold shrink-0" />
          <h3 className="text-[9px] sm:text-[10px] lg:text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            {t.selectionPeriod}
          </h3>
          {loading && <Loader2 className="w-3 h-3 animate-spin text-gold" />}
        </div>
        <div className="bg-card border border-border rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-5">
          <div className="mb-3 sm:mb-4 rounded-xl border border-gold/20 bg-gold/5 px-3 py-2.5 sm:px-4 sm:py-3">
            <p className="text-[9px] sm:text-[10px] lg:text-xs text-muted-foreground mb-1">{t.totalReferralEarnings}</p>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gold">
              ${formatCurrency(team?.totalReferralEarnings ?? 0, 2)}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
            <div>
              <p className="text-[9px] sm:text-[10px] lg:text-xs text-muted-foreground mb-1">{t.teamSize}</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">{team?.teamSize ?? 0}</p>
            </div>
            <div>
              <p className="text-[9px] sm:text-[10px] lg:text-xs text-muted-foreground mb-1">{t.teamRecharge}</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">
                ${formatCurrency(team?.teamRecharge ?? 0, 2)}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-border">
            <div className="text-center">
              <p className="text-sm sm:text-base lg:text-lg font-bold text-foreground">{team?.newTeam ?? 0}</p>
              <p className="text-[8px] sm:text-[9px] lg:text-xs text-muted-foreground mt-0.5 truncate">{t.newTeam}</p>
            </div>
            <div className="text-center">
              <p className="text-sm sm:text-base lg:text-lg font-bold text-foreground">{team?.firstRecharge ?? 0}</p>
              <p className="text-[8px] sm:text-[9px] lg:text-xs text-muted-foreground mt-0.5 truncate">{t.firstRecharge}</p>
            </div>
            <div className="text-center">
              <p className="text-sm sm:text-base lg:text-lg font-bold text-foreground">{team?.firstWithdrawal ?? 0}</p>
              <p className="text-[8px] sm:text-[9px] lg:text-xs text-muted-foreground mt-0.5 truncate">{t.firstWithdrawal}</p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-[9px] sm:text-[10px] lg:text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2 sm:mb-3">
          {language === "ar" ? "جداول العمولات" : language === "fr" ? "Tables des commissions" : "Commission Tables"}
        </h3>

        <div className="flex bg-secondary rounded-xl sm:rounded-2xl p-1 mb-3 sm:mb-4">
          <button
            onClick={() => setActiveCommissionTab("deposit")}
            className={`flex-1 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] lg:text-xs font-semibold transition-all truncate px-1 ${
              activeCommissionTab === "deposit"
                ? "bg-card text-foreground shadow-sm border border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.depositCommission}
          </button>
          <button
            onClick={() => setActiveCommissionTab("daily")}
            className={`flex-1 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] lg:text-xs font-semibold transition-all truncate px-1 ${
              activeCommissionTab === "daily"
                ? "bg-card text-foreground shadow-sm border border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.dailyEarningsCommission}
          </button>
        </div>

        {activeCommissionTab === "deposit" && (
          <div className="bg-card border border-border rounded-xl sm:rounded-2xl overflow-hidden">
            <div className="p-2.5 sm:p-3 lg:p-4 border-b border-border bg-secondary/30">
              <div className="flex items-start gap-2">
                <Info className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gold shrink-0 mt-0.5" />
                <p className="text-[9px] sm:text-[10px] lg:text-xs text-muted-foreground leading-relaxed">{t.depositCommissionDesc}</p>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-1 sm:gap-2 px-2.5 sm:px-3 lg:px-4 py-2 sm:py-3 bg-secondary/50 text-[9px] sm:text-[10px] lg:text-xs font-semibold text-muted-foreground">
              <div>VIP</div>
              <div className="text-center text-gold truncate">{t.levelA}</div>
              <div className="text-center text-blue-400 truncate">{t.levelB}</div>
              <div className="text-center text-green truncate">{t.levelC}</div>
            </div>
            <div className="max-h-40 sm:max-h-48 lg:max-h-64 overflow-y-auto">
              {depositCommissions.map((row, i) => (
                <div
                  key={row.level}
                  className={`grid grid-cols-4 gap-1 sm:gap-2 px-2.5 sm:px-3 lg:px-4 py-2 sm:py-2.5 text-[9px] sm:text-[10px] lg:text-xs ${
                    i % 2 === 0 ? "bg-background/30" : ""
                  }`}
                >
                  <div className="font-semibold text-foreground">VIP {row.level}</div>
                  <div className="text-center text-gold font-medium">${formatCurrency(row.levelA, 0)}</div>
                  <div className="text-center text-blue-400 font-medium">${formatCurrency(row.levelB, 0)}</div>
                  <div className="text-center text-green font-medium">${formatCurrency(row.levelC, 0)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeCommissionTab === "daily" && (
          <div className="bg-card border border-border rounded-xl sm:rounded-2xl overflow-hidden">
            <div className="p-2.5 sm:p-3 lg:px-4 border-b border-border bg-secondary/30">
              <p className="text-[9px] sm:text-[10px] lg:text-xs text-muted-foreground leading-relaxed px-1">{t.dailyEarningsCommissionDesc}</p>
            </div>
            <div className="grid grid-cols-4 gap-1 sm:gap-2 px-2.5 sm:px-3 lg:px-4 py-2 sm:py-3 bg-secondary/50 text-[9px] sm:text-[10px] lg:text-xs font-semibold text-muted-foreground">
              <div>VIP</div>
              <div className="text-center text-gold truncate">{t.levelA}</div>
              <div className="text-center text-blue-400 truncate">{t.levelB}</div>
              <div className="text-center text-green truncate">{t.levelC}</div>
            </div>
            <div className="max-h-40 sm:max-h-48 lg:max-h-64 overflow-y-auto">
              {dailyCommissions.map((row, i) => (
                <div
                  key={row.level}
                  className={`grid grid-cols-4 gap-1 sm:gap-2 px-2.5 sm:px-3 lg:px-4 py-2 sm:py-2.5 text-[9px] sm:text-[10px] lg:text-xs ${
                    i % 2 === 0 ? "bg-background/30" : ""
                  }`}
                >
                  <div className="font-semibold text-foreground">VIP {row.level}</div>
                  <div className="text-center text-gold font-medium">${formatCurrency(row.levelA, 2)}</div>
                  <div className="text-center text-blue-400 font-medium">${formatCurrency(row.levelB, 2)}</div>
                  <div className="text-center text-green font-medium">${formatCurrency(row.levelC, 3)}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div>
        <h3 className="text-[9px] sm:text-[10px] lg:text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2 sm:mb-3">
          {language === "ar" ? "ملخص مستويات العمولة" : language === "fr" ? "Résumé des niveaux" : "Commission Levels Summary"}
        </h3>
        <div className="space-y-3 sm:space-y-4">
          <div>
            <p className="text-[9px] sm:text-[10px] lg:text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2 sm:mb-3">
              {t.depositSummary}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
              {levels.map((lvl) => (
                <div
                  key={`deposit-${lvl.level}`}
                  className={`bg-gradient-to-br ${lvl.color} border ${lvl.border} rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-5`}
                >
                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <div className="min-w-0 flex-1">
                      <div className={`inline-block text-[9px] sm:text-[10px] lg:text-xs font-bold rounded-full px-2 sm:px-2.5 py-0.5 sm:py-1 mb-1 ${lvl.badge}`}>
                        {lvl.level}
                      </div>
                      <p className="text-[9px] sm:text-[10px] lg:text-xs text-muted-foreground">{t.commissionRate}</p>
                      <p className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">{lvl.commission}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[8px] sm:text-[9px] lg:text-xs text-muted-foreground">
                        {t.registered} / {t.validated}
                      </p>
                      <p className="text-base sm:text-lg lg:text-xl font-bold text-foreground">
                        {lvl.registered}/{lvl.valid}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-border/40 gap-2">
                    <div className="min-w-0">
                      <p className="text-[8px] sm:text-[9px] lg:text-xs text-muted-foreground">{t.totalWonUntilNow}</p>
                      <p className="text-sm sm:text-base lg:text-lg font-bold text-foreground">
                        ${formatCurrency(lvl.totalRevenue, 2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[9px] sm:text-[10px] lg:text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2 sm:mb-3">
              {t.dailyWinSummary}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
              {levels.map((lvl) => (
                <div
                  key={`daily-${lvl.level}`}
                  className={`bg-gradient-to-br ${lvl.color} border ${lvl.border} rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-5`}
                >
                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <div className="min-w-0 flex-1">
                      <div className={`inline-block text-[9px] sm:text-[10px] lg:text-xs font-bold rounded-full px-2 sm:px-2.5 py-0.5 sm:py-1 mb-1 ${lvl.badge}`}>
                        {lvl.level}
                      </div>
                      <p className="text-[9px] sm:text-[10px] lg:text-xs text-muted-foreground">{t.dailyWinPercent}</p>
                      <p className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">{lvl.dailyCommission}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[8px] sm:text-[9px] lg:text-xs text-muted-foreground">
                        {t.registered} / {t.validated}
                      </p>
                      <p className="text-base sm:text-lg lg:text-xl font-bold text-foreground">
                        {lvl.registered}/{lvl.valid}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-border/40 gap-2">
                    <div className="min-w-0">
                      <p className="text-[8px] sm:text-[9px] lg:text-xs text-muted-foreground">{t.totalWonUntilNow}</p>
                      <p className="text-sm sm:text-base lg:text-lg font-bold text-foreground">
                        ${formatCurrency(lvl.totalRevenue, 2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
