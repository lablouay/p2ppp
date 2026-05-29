"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  Coins,
  ArrowUpRight,
  User,
  BarChart3,
  KeyRound,
  LogOut,
  ChevronRight,
  Crown,
  Shield,
} from "lucide-react"
import { translations, type Language } from "@/lib/translations"
import { formatUsdt, logoutRequest } from "@/lib/client-api"
import { useUser } from "@/contexts/user-context"
import DepositModal from "@/components/deposit/DepositModal"
import WithdrawModal from "@/components/withdraw/WithdrawModal"
import AccountModal, { ProfileAvatar, type AccountProfile, type AvatarPresetId } from "@/components/account/AccountModal"
import ChangePasswordModal from "@/components/account/ChangePasswordModal"
import TwoFactorModal from "@/components/account/TwoFactorModal"
import FinancialRecordsView from "@/components/profile/FinancialRecordsView"

interface ProfileTabProps {
  language: Language
}

export default function ProfileTab({ language }: ProfileTabProps) {
  const router = useRouter()
  const { data, refresh } = useUser()
  const [showDepositModal, setShowDepositModal] = useState(false)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [showAccountModal, setShowAccountModal] = useState(false)
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false)
  const [showFinancialRecords, setShowFinancialRecords] = useState(false)
  const [showTwoFactor, setShowTwoFactor] = useState(false)
  const t = translations[language]

  const profile: AccountProfile = useMemo(
    () => ({
      email: data?.user.email ?? "",
      avatarUrl: data?.user.avatarUrl ?? null,
      avatarPreset: (data?.user.avatarPreset ?? "gold") as AvatarPresetId,
    }),
    [data?.user],
  )

  const memberYear = data?.user.memberSince
    ? new Date(data.user.memberSince).getFullYear()
    : new Date().getFullYear()

  const handleSignOut = async () => {
    await logoutRequest()
    router.push("/login")
    router.refresh()
  }

  const quickActions = [
    { label: t.deposit, icon: Coins, color: "from-gold/15 to-gold/5", iconColor: "text-gold", border: "border-gold/20", action: () => setShowDepositModal(true) },
    { label: t.withdraw, icon: ArrowUpRight, color: "from-green/15 to-green/5", iconColor: "text-green", border: "border-green/20", action: () => setShowWithdrawModal(true) },
    { label: t.account, icon: User, color: "from-blue-400/15 to-blue-400/5", iconColor: "text-blue-400", border: "border-blue-400/20", action: () => setShowAccountModal(true) },
    { label: t.financialRecords, icon: BarChart3, color: "from-muted-foreground/10 to-muted-foreground/5", iconColor: "text-muted-foreground", border: "border-border", action: () => setShowFinancialRecords(true) },
  ]

  const menuItems = [
    { label: t.changePassword, icon: KeyRound, danger: false, action: () => setShowChangePasswordModal(true) },
    { label: t.signOut, icon: LogOut, danger: true, action: handleSignOut },
  ]

  if (showFinancialRecords) {
    return (
      <FinancialRecordsView
        language={language}
        onBack={() => setShowFinancialRecords(false)}
      />
    )
  }

  return (
    <>
      <div className="flex flex-col gap-3 sm:gap-4 lg:gap-5 pb-4">
        <div className="bg-gradient-to-br from-card-highlight-from to-card border border-border rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 sm:w-20 lg:w-24 h-16 sm:h-20 lg:h-24 rounded-full bg-gold/5 -translate-y-6 translate-x-6" />
          <div className="flex items-start justify-between mb-4 sm:mb-5 gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <ProfileAvatar {...profile} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] sm:text-xs lg:text-sm font-semibold text-foreground leading-tight truncate">{t.hello}, {profile.email}</p>
                  <p className="text-[9px] sm:text-[10px] lg:text-xs text-muted-foreground truncate">
                    {language === "ar" ? `عضو منذ ${memberYear}` : language === "fr" ? `Membre depuis ${memberYear}` : `Member since ${memberYear}`}
                  </p>
                </div>
              </div>
            </div>
            <span className="flex items-center gap-1 text-[9px] sm:text-[10px] lg:text-xs font-bold text-gold bg-gold/10 border border-gold/20 rounded-full px-1.5 sm:px-2 lg:px-2.5 py-0.5 sm:py-1 shrink-0">
              <Crown className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> VIP {data?.user.vipLevel ?? 0}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:gap-4">
            <div className="bg-secondary/50 dark:bg-background/30 rounded-lg sm:rounded-xl p-2.5 sm:p-3">
              <p className="text-[9px] sm:text-[10px] lg:text-xs text-muted-foreground mb-0.5 sm:mb-1 truncate">{t.totalBalance}</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">{formatUsdt(data?.wallet.balance ?? 0)}</p>
            </div>
            <div className="bg-secondary/50 dark:bg-background/30 rounded-lg sm:rounded-xl p-2.5 sm:p-3">
            <p className="text-[9px] sm:text-[10px] lg:text-xs text-muted-foreground mb-0.5 sm:mb-1 truncate">{t.workDepositLocked}</p>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">{formatUsdt(data?.wallet.workDeposit ?? 0)}</p>
            <p className="text-[8px] sm:text-[9px] text-muted-foreground mt-1 leading-snug">{t.workDepositHelp}</p>
            </div>
          </div>
        </div>

      <button
        type="button"
        onClick={() => setShowTwoFactor(true)}
        className="w-full flex items-center gap-2 sm:gap-2.5 lg:gap-3 bg-card border border-border rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 hover:border-gold/30 transition-colors text-left"
      >
        <Shield className="w-4 h-4 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-green shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-[10px] sm:text-xs lg:text-sm font-semibold text-foreground">
            {language === "ar" ? "الأمان — 2FA" : language === "fr" ? "Sécurité — 2FA" : "Security — 2FA"}
          </p>
          <p className="text-[9px] sm:text-[10px] lg:text-xs text-muted-foreground truncate">
            {data?.user.twoFactorEnabled
              ? language === "ar"
                ? "المصادقة الثنائية مفعّلة"
                : language === "fr"
                ? "2FA activée"
                : "Two-factor authentication enabled"
              : language === "ar"
              ? "اضغط لإعداد المصادقة الثنائية"
              : language === "fr"
              ? "Appuyez pour configurer la 2FA"
              : "Tap to set up two-factor authentication"}
          </p>
        </div>
        <span className={`text-[9px] sm:text-[10px] lg:text-xs font-semibold rounded-full px-1.5 sm:px-2 py-0.5 shrink-0 ${
          data?.user.twoFactorEnabled ? "text-green bg-green/10" : "text-muted-foreground bg-secondary"
        }`}>
          {data?.user.twoFactorEnabled ? t.verified : language === "ar" ? "إعداد" : language === "fr" ? "Configurer" : "Setup"}
        </span>
      </button>

        <div>
          <h3 className="text-[9px] sm:text-[10px] lg:text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2 sm:mb-3">
            {language === "ar" ? "إجراءات الحساب" : language === "fr" ? "Actions du compte" : "Account Actions"}
          </h3>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={action.action}
                className={`flex items-center gap-2 sm:gap-2.5 lg:gap-3 bg-gradient-to-br ${action.color} border ${action.border} rounded-xl sm:rounded-2xl p-2.5 sm:p-3 lg:p-4 hover:opacity-90 transition-all active:scale-95 text-left`}
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9 rounded-lg sm:rounded-xl bg-secondary/60 dark:bg-background/30 flex items-center justify-center shrink-0">
                  <action.icon className={`w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 ${action.iconColor}`} />
                </div>
                <span className="text-[10px] sm:text-xs lg:text-sm font-medium text-foreground leading-tight truncate">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl sm:rounded-2xl overflow-hidden">
          {menuItems.map((item, index) => (
            <button
              key={item.label}
              onClick={item.action}
              className={`w-full flex items-center gap-3 sm:gap-4 px-3 sm:px-4 lg:px-5 py-3 sm:py-3.5 lg:py-4 hover:bg-secondary/50 transition-colors text-left ${
                index < menuItems.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <div className={`w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 ${
                item.danger ? "bg-destructive/10" : "bg-secondary"
              }`}>
                <item.icon className={`w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 ${item.danger ? "text-destructive-foreground" : "text-muted-foreground"}`} />
              </div>
              <span className={`text-[10px] sm:text-xs lg:text-sm font-medium flex-1 min-w-0 truncate ${item.danger ? "text-destructive-foreground" : "text-foreground"}`}>
                {item.label}
              </span>
              <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 text-muted-foreground shrink-0" />
            </button>
          ))}
        </div>

        <p className="text-center text-[9px] sm:text-[10px] lg:text-xs text-muted-foreground">NexEarn v2.0.0 &middot; {language === "ar" ? "جميع الحقوق محفوظة" : language === "fr" ? "Tous droits réservés" : "All rights reserved"}</p>
      </div>

      <DepositModal
        isOpen={showDepositModal}
        onClose={() => setShowDepositModal(false)}
        language={language}
        onSuccess={refresh}
      />
      <TwoFactorModal
        isOpen={showTwoFactor}
        onClose={() => setShowTwoFactor(false)}
        language={language}
        enabled={data?.user.twoFactorEnabled ?? false}
        onSuccess={refresh}
      />
      <WithdrawModal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        language={language}
        onSuccess={refresh}
      />
      <AccountModal
        isOpen={showAccountModal}
        onClose={() => setShowAccountModal(false)}
        language={language}
        profile={profile}
        onSuccess={refresh}
      />
      <ChangePasswordModal
        isOpen={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
        language={language}
      />
    </>
  )
}
