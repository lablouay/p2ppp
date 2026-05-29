"use client"

import { useState } from "react"
import { X, Shield, Loader2, QrCode } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"
import { translations, type Language } from "@/lib/translations"
import { setup2FARequest, enable2FARequest, disable2FARequest } from "@/lib/client-api"

interface TwoFactorModalProps {
  isOpen: boolean
  onClose: () => void
  language: Language
  enabled: boolean
  onSuccess: () => void
}

export default function TwoFactorModal({
  isOpen,
  onClose,
  language,
  enabled,
  onSuccess,
}: TwoFactorModalProps) {
  const [secret, setSecret] = useState("")
  const [otpauth, setOtpauth] = useState("")
  const [token, setToken] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const t = translations[language]

  const startSetup = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await setup2FARequest()
      setSecret(data.secret)
      setOtpauth(data.otpauth)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Setup failed")
    } finally {
      setLoading(false)
    }
  }

  const handleEnable = async () => {
    setLoading(true)
    setError(null)
    try {
      await enable2FARequest(secret, token)
      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid code")
    } finally {
      setLoading(false)
    }
  }

  const handleDisable = async () => {
    setLoading(true)
    setError(null)
    try {
      await disable2FARequest(password)
      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to disable")
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-overlay backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-md mx-auto bg-background sm:rounded-2xl border border-border p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-green" />
            <h2 className="text-sm font-bold">
              {language === "ar" ? "المصادقة الثنائية" : language === "fr" ? "2FA" : "Two-Factor Auth"}
            </h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>

        {enabled ? (
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground">
              {language === "ar"
                ? "أدخل كلمة المرور لتعطيل المصادقة الثنائية."
                : language === "fr"
                ? "Entrez votre mot de passe pour désactiver la 2FA."
                : "Enter your password to disable 2FA."}
            </p>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm"
              placeholder="••••••••"
            />
            <button
              onClick={handleDisable}
              disabled={loading || !password}
              className="w-full py-3 rounded-xl font-bold text-sm bg-destructive/20 text-destructive-foreground border border-destructive/30 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : language === "ar" ? "تعطيل" : language === "fr" ? "Désactiver" : "Disable 2FA"}
            </button>
          </div>
        ) : !otpauth ? (
          <div className="text-center space-y-4">
            <QrCode className="w-12 h-12 text-gold mx-auto" />
            <p className="text-xs text-muted-foreground">
              {language === "ar"
                ? "فعّل المصادقة الثنائية باستخدام تطبيق مثل Google Authenticator."
                : language === "fr"
                ? "Activez la 2FA avec Google Authenticator ou similaire."
                : "Enable 2FA using Google Authenticator or similar."}
            </p>
            <button
              onClick={startSetup}
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-sm bg-gold text-primary-foreground disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : language === "ar" ? "بدء الإعداد" : language === "fr" ? "Commencer" : "Start setup"}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-center bg-white p-3 rounded-xl">
              <QRCodeSVG value={otpauth} size={160} />
            </div>
            <p className="text-[10px] text-center text-muted-foreground break-all">{secret}</p>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={token}
              onChange={(e) => setToken(e.target.value.replace(/\D/g, ""))}
              placeholder="000000"
              className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm text-center tracking-widest"
            />
            <button
              onClick={handleEnable}
              disabled={loading || token.length !== 6}
              className="w-full py-3 rounded-xl font-bold text-sm bg-gold text-primary-foreground disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : language === "ar" ? "تفعيل" : language === "fr" ? "Activer" : "Enable 2FA"}
            </button>
          </div>
        )}

        {error && (
          <p className="text-sm text-destructive-foreground mt-3">{error}</p>
        )}
      </div>
    </div>
  )
}
