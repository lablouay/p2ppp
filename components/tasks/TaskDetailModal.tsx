"use client"

import { X, ExternalLink, Loader2 } from "lucide-react"
import { translations, type Language } from "@/lib/translations"
import { formatUsdt } from "@/lib/client-api"

interface TaskDetailModalProps {
  isOpen: boolean
  onClose: () => void
  language: Language
  title: string
  content: string
  link: string
  earnAmount: number
  loading?: boolean
  onContinue: () => void
}

export default function TaskDetailModal({
  isOpen,
  onClose,
  language,
  title,
  content,
  link,
  earnAmount,
  loading,
  onContinue,
}: TaskDetailModalProps) {
  const t = translations[language]
  const isRTL = language === "ar"

  if (!isOpen) return null

  const handleContinue = () => {
    const url = link.startsWith("http") ? link : `https://${link}`
    window.open(url, "_blank", "noopener,noreferrer")
    onContinue()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" dir={isRTL ? "rtl" : "ltr"}>
      <div className="absolute inset-0 bg-overlay backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-md mx-auto bg-background sm:rounded-2xl border border-border shadow-2xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-4 py-4 border-b border-border shrink-0">
          <h2 className="text-sm font-bold text-foreground pr-8">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-4 overflow-y-auto flex-1">
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{content}</p>
          <p className="text-xs text-gold mt-4 font-semibold">
            {language === "ar"
              ? `المكافأة: ${formatUsdt(earnAmount)}`
              : language === "fr"
              ? `Récompense: ${formatUsdt(earnAmount)}`
              : `Reward: ${formatUsdt(earnAmount)}`}
          </p>
        </div>
        <div className="p-4 border-t border-border shrink-0">
          <button
            onClick={handleContinue}
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-gold to-gold-light text-primary-foreground flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <ExternalLink className="w-4 h-4" />
                {language === "ar" ? "متابعة" : language === "fr" ? "Continuer" : "Continue"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
