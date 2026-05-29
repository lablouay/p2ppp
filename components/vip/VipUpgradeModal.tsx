"use client"

import { useEffect, useState } from "react"
import { X, Crown, Wallet, Loader2, ChevronRight } from "lucide-react"
import { translations, type Language } from "@/lib/translations"
import { fetchVipPreview, upgradeVipRequest, formatUsdt } from "@/lib/client-api"
import type { VipUpgradePreview, VipPlanOption } from "@/lib/types/api"

interface VipUpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  language: Language
  preselectedLevel?: number | null
  onContinueDeposit: (minAmount: number) => void
  onSuccess: () => void
}

export default function VipUpgradeModal({
  isOpen,
  onClose,
  language,
  preselectedLevel,
  onContinueDeposit,
  onSuccess,
}: VipUpgradeModalProps) {
  const [preview, setPreview] = useState<VipUpgradePreview | null>(null)
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const t = translations[language]
  const isRTL = language === "ar"

  useEffect(() => {
    if (!isOpen) return
    setLoading(true)
    setError(null)
    fetchVipPreview()
      .then(setPreview)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"))
      .finally(() => setLoading(false))
  }, [isOpen])

  const handleUpgrade = async (level: number) => {
    setUpgrading(true)
    setError(null)
    try {
      await upgradeVipRequest(level)
      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upgrade failed")
    } finally {
      setUpgrading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" dir={isRTL ? "rtl" : "ltr"}>
      <div className="absolute inset-0 bg-overlay backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-md mx-auto bg-background sm:rounded-2xl border border-border shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-4 py-4 border-b border-border bg-card shrink-0">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-gold" />
            <h2 className="text-sm font-bold text-foreground">
              {language === "ar" ? "ترقية VIP" : language === "fr" ? "Mise à niveau VIP" : "VIP Upgrade"}
            </h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 text-gold animate-spin" />
            </div>
          ) : preview ? (
            <>
              {(preview.state === "NO_BALANCE" || preview.state === "INSUFFICIENT") && (
                <div className="space-y-4">
                  <div className="bg-secondary/50 border border-border rounded-xl p-4 text-center">
                    <Wallet className="w-10 h-10 text-gold mx-auto mb-3" />
                    <p className="text-sm font-semibold text-foreground mb-1">
                      {language === "ar"
                        ? "رصيد غير كافٍ"
                        : language === "fr"
                        ? "Solde insuffisant"
                        : "Insufficient balance"}
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {language === "ar"
                        ? `يجب إيداع ما لا يقل عن ${formatUsdt(preview.minRequired)} للتسجيل في أدنى خطة VIP.`
                        : language === "fr"
                        ? `Déposez au moins ${formatUsdt(preview.minRequired)} pour vous inscrire au plan VIP minimum.`
                        : `Deposit at least ${formatUsdt(preview.minRequired)} to enroll in the lowest VIP plan.`}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-2">
                      {language === "ar" ? "رصيدك:" : language === "fr" ? "Votre solde:" : "Your balance:"}{" "}
                      <span className="text-foreground font-semibold">{formatUsdt(preview.balance)}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onClose()
                      onContinueDeposit(preview.minRequired)
                    }}
                    className="w-full py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-gold to-gold-light text-primary-foreground shadow-lg shadow-gold/20"
                  >
                    {language === "ar" ? "متابعة الإيداع" : language === "fr" ? "Continuer le dépôt" : "Continue to deposit"}
                  </button>
                </div>
              )}

              {preview.state === "SELECT_PLAN" &&
                preselectedLevel &&
                !preview.affordable.some((p) => p.level === preselectedLevel) && (
                <div className="space-y-4">
                  <div className="bg-secondary/50 border border-border rounded-xl p-4 text-center">
                    <p className="text-sm font-semibold text-foreground mb-1">
                      {language === "ar"
                        ? "رصيد غير كافٍ لهذه الخطة"
                        : language === "fr"
                        ? "Solde insuffisant pour ce plan"
                        : "Insufficient balance for this plan"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {language === "ar" ? "رصيدك:" : language === "fr" ? "Votre solde:" : "Your balance:"}{" "}
                      <span className="text-foreground font-semibold">{formatUsdt(preview.balance)}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onClose()
                      onContinueDeposit(preview.minRequired)
                    }}
                    className="w-full py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-gold to-gold-light text-primary-foreground"
                  >
                    {language === "ar" ? "متابعة الإيداع" : language === "fr" ? "Continuer le dépôt" : "Continue to deposit"}
                  </button>
                </div>
              )}

              {preview.state === "SELECT_PLAN" &&
                (!preselectedLevel ||
                  preview.affordable.some((p) => p.level === preselectedLevel)) && (
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground">
                    {preselectedLevel
                      ? language === "ar"
                        ? "تأكيد التسجيل في الخطة:"
                        : language === "fr"
                        ? "Confirmer l'inscription:"
                        : "Confirm enrollment:"
                      : language === "ar"
                      ? `رصيدك: ${formatUsdt(preview.balance)} — اختر خطة:`
                      : language === "fr"
                      ? `Solde: ${formatUsdt(preview.balance)} — Choisissez un plan:`
                      : `Balance: ${formatUsdt(preview.balance)} — Choose a plan:`}
                  </p>
                  {(preselectedLevel
                    ? preview.affordable.filter((p) => p.level === preselectedLevel)
                    : preview.affordable
                  ).map((plan) => (
                    <PlanRow
                      key={plan.level}
                      plan={plan}
                      upgrading={upgrading}
                      onUpgrade={() => handleUpgrade(plan.level)}
                      language={language}
                    />
                  ))}
                </div>
              )}
            </>
          ) : null}

          {error && (
            <p className="text-sm text-destructive-foreground bg-destructive/10 border border-destructive/20 rounded-xl px-3 py-2 mt-3">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function PlanRow({
  plan,
  onUpgrade,
  upgrading,
  language,
}: {
  plan: VipPlanOption
  onUpgrade: () => void
  upgrading: boolean
  language: Language
}) {
  return (
    <button
      onClick={onUpgrade}
      disabled={upgrading}
      className="w-full flex items-center justify-between gap-3 bg-card border border-border hover:border-gold/40 rounded-xl p-3 transition-all text-left disabled:opacity-50"
    >
      <div>
        <p className="text-sm font-bold text-foreground">{plan.name}</p>
        <p className="text-[10px] text-muted-foreground">
          {formatUsdt(plan.totalPrice)} USDT · {plan.dailySalary} USDT/
          {language === "ar" ? "يوم" : language === "fr" ? "jour" : "day"}
        </p>
      </div>
      <ChevronRight className="w-4 h-4 text-gold shrink-0" />
    </button>
  )
}
