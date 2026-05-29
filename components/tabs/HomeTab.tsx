"use client"

import { useState } from "react"
import {
  Coins,
  ArrowUpRight,
  Download,
  Building2,
  Users,
  Volume2,
  TrendingUp,
  Shield,
  Zap,
  ChevronRight,
  Calendar,
  CalendarDays,
  CalendarRange,
} from "lucide-react"
import { translations, type Language } from "@/lib/translations"
import { formatUsdt } from "@/lib/client-api"
import { useUser } from "@/contexts/user-context"
import DepositModal from "@/components/deposit/DepositModal"
import WithdrawModal from "@/components/withdraw/WithdrawModal"

interface HomeTabProps {
  language: Language
  onNavigateToTeam?: () => void
}

export default function HomeTab({ language, onNavigateToTeam }: HomeTabProps) {
  const [showDepositModal, setShowDepositModal] = useState(false)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const { data, refresh } = useUser()
  const t = translations[language]
  const earnings = data?.earnings

  const announcements = {
    en: [
      "Next-generation blockchain platform is now open worldwide — digital technology is reshaping the future of finance",
      "New VIP tiers unlocked — earn up to 1,280 USDT daily with VIP 10 status",
      "Referral program: earn 8% commission on every deposit from your direct referrals",
    ],
    fr: [
      "La plateforme blockchain de nouvelle génération est désormais ouverte dans le monde entier — la technologie numérique redéfinit l'avenir de la finance",
      "Nouveaux niveaux VIP débloqués — gagnez jusqu'à 1 280 USDT par jour avec le statut VIP 10",
      "Programme de parrainage: gagnez 8% de commission sur chaque dépôt de vos filleuls directs",
    ],
    ar: [
      "منصة البلوكتشين من الجيل الجديد مفتوحة الآن في جميع أنحاء العالم — التكنولوجيا الرقمية تعيد تشكيل مستقبل التمويل",
      "تم فتح مستويات VIP جديدة — اربح حتى 1,280 USDT يوميًا مع حالة VIP 10",
      "برنامج الإحالة: اربح 8% عمولة على كل إيداع من إحالاتك المباشرة",
    ],
  }

  const earningsSummary = [
    { label: t.earnedToday, value: formatUsdt(earnings?.earnedToday ?? 0), icon: Calendar, iconColor: "text-gold" },
    { label: t.earnedThisMonth, value: formatUsdt(earnings?.earnedThisMonth ?? 0), icon: CalendarDays, iconColor: "text-green" },
    { label: t.earnedLastMonth, value: formatUsdt(earnings?.earnedLastMonth ?? 0), icon: CalendarRange, iconColor: "text-blue-400" },
  ]

  const quickActions = [
    { label: t.deposit, icon: Coins, color: "from-gold/20 to-gold/5", iconColor: "text-gold", action: () => setShowDepositModal(true) },
    { label: t.withdraw, icon: ArrowUpRight, color: "from-green/20 to-green/5", iconColor: "text-green", action: () => setShowWithdrawModal(true) },
    { label: t.application, icon: Download, color: "from-blue-400/20 to-blue-400/5", iconColor: "text-blue-400", action: () => {} },
    { label: t.companyProfile, icon: Building2, color: "from-muted-foreground/20 to-muted-foreground/5", iconColor: "text-muted-foreground", action: () => {} },
    { label: t.inviteFriends, icon: Users, color: "from-gold/20 to-gold/5", iconColor: "text-gold", action: () => onNavigateToTeam?.() },
  ]

  return (
    <>
    <div className="flex flex-col gap-3 sm:gap-4 md:gap-5 lg:gap-6 pb-4">
      {/* Hero banner */}
      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-hero-from to-hero-to border border-border p-4 sm:p-5 md:p-6 lg:p-8">
        <div className="absolute top-0 right-0 w-20 sm:w-24 md:w-32 lg:w-40 h-20 sm:h-24 md:h-32 lg:h-40 rounded-full bg-gold/5 -translate-y-8 translate-x-8" />
        <div className="absolute bottom-0 left-0 w-14 sm:w-16 md:w-20 lg:w-28 h-14 sm:h-16 md:h-20 lg:h-28 rounded-full bg-gold/5 translate-y-6 -translate-x-6" />
        <div className="flex items-center gap-1.5 sm:gap-2 mb-1 flex-wrap">
          <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-gold shrink-0" />
          <span className="text-[9px] sm:text-[10px] md:text-xs font-medium text-gold uppercase tracking-widest">{t.saveMoney}</span>
          <span className="mx-0.5 sm:mx-1 text-border">·</span>
          <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-green shrink-0" />
          <span className="text-[9px] sm:text-[10px] md:text-xs font-medium text-green uppercase tracking-widest">{t.saveTime}</span>
        </div>
        <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-foreground mt-2 leading-tight text-balance">
          {language === "ar" ? "اكسب بذكاء،" : language === "fr" ? "Gagnez malin," : "Earn Smarter,"}<br />
          <span className="gold-shimmer">{language === "ar" ? "كل يوم" : language === "fr" ? "Chaque jour" : "Every Single Day"}</span>
        </h2>
        <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mt-2 leading-relaxed max-w-xs sm:max-w-sm md:max-w-md">
          {language === "ar" 
            ? "دخل سلبي مدعوم بالبلوكتشين من خلال المهام والإحالات وتقدم مستوى VIP."
            : language === "fr"
            ? "Revenus passifs alimentés par la blockchain via des tâches, des parrainages et la progression VIP."
            : "Blockchain-powered passive income through tasks, referrals, and VIP tier progression."}
        </p>
      </div>

      {/* Announcement ticker */}
      <div className="flex items-center gap-2 sm:gap-3 bg-secondary/60 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 border border-border overflow-hidden">
        <Volume2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-gold shrink-0" />
        <div className="overflow-hidden flex-1">
          <div className="flex animate-marquee whitespace-nowrap">
            {[...announcements[language], ...announcements[language]].map((a, i) => (
              <span key={i} className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground mr-6 sm:mr-8 md:mr-12">{a}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <h3 className="text-[9px] sm:text-[10px] md:text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2 sm:mb-3">
          {language === "ar" ? "إجراءات سريعة" : language === "fr" ? "Actions rapides" : "Quick Actions"}
        </h3>
        <div className="grid grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={action.action}
              className={`flex flex-col items-center gap-1.5 sm:gap-2 bg-gradient-to-b ${action.color} border border-border rounded-xl sm:rounded-2xl p-2.5 sm:p-3 md:p-4 hover:border-gold/40 transition-all active:scale-95 ${quickActions.indexOf(action) >= 3 ? 'hidden md:flex' : ''}`}
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-lg sm:rounded-xl bg-secondary flex items-center justify-center">
                <action.icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 ${action.iconColor}`} />
              </div>
              <span className="text-[9px] sm:text-[10px] md:text-xs font-medium text-foreground text-center leading-tight line-clamp-2">{action.label}</span>
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2 mt-2 md:hidden">
          {quickActions.slice(3).map((action) => (
            <button
              key={action.label}
              onClick={action.action}
              className={`flex items-center gap-2 sm:gap-2.5 bg-gradient-to-r ${action.color} border border-border rounded-xl p-2.5 sm:p-3 hover:border-gold/40 transition-all active:scale-95`}
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                <action.icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${action.iconColor}`} />
              </div>
              <span className="text-[10px] sm:text-[11px] font-medium text-foreground flex-1 min-w-0 truncate">{action.label}</span>
              <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-muted-foreground shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* Earnings summary */}
      <div>
        <h3 className="text-[9px] sm:text-[10px] md:text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2 sm:mb-3">
          {t.myEarnings}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
          {earningsSummary.map((item) => (
            <div
              key={item.label}
              className="bg-card border border-border rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 hover:border-gold/30 transition-all"
            >
              <div className="flex items-center gap-2 sm:gap-2.5 mb-2 sm:mb-3">
                <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg sm:rounded-xl bg-secondary flex items-center justify-center shrink-0">
                  <item.icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 ${item.iconColor}`} />
                </div>
                <p className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground leading-tight">{item.label}</p>
              </div>
              <p className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">{item.value}</p>
              <p className="text-[9px] sm:text-[10px] text-muted-foreground mt-0.5">USDT</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4">
        {[
          { label: t.totalUsers, value: "128K+", icon: Users },
          { label: t.totalPaid, value: "$4.2M", icon: Coins },
          { label: t.uptime, value: "99.9%", icon: Shield },
        ].map((stat) => (
          <div key={stat.label} className="bg-card border border-border rounded-xl sm:rounded-2xl p-2.5 sm:p-3 md:p-4 text-center">
            <stat.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-gold mx-auto mb-1 sm:mb-1.5 md:mb-2" />
            <p className="text-sm sm:text-base md:text-lg font-bold text-foreground">{stat.value}</p>
            <p className="text-[8px] sm:text-[10px] md:text-xs text-muted-foreground truncate">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>

      <DepositModal
        isOpen={showDepositModal}
        onClose={() => setShowDepositModal(false)}
        language={language}
        onSuccess={refresh}
      />
      <WithdrawModal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        language={language}
        onSuccess={refresh}
      />
    </>
  )
}
