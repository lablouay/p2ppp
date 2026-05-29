"use client"

import { useEffect, useState } from "react"
import { X, KeyRound, Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react"
import { translations, type Language } from "@/lib/translations"
import { updatePasswordRequest } from "@/lib/client-api"

interface ChangePasswordModalProps {
  isOpen: boolean
  onClose: () => void
  language: Language
}

const MIN_PASSWORD_LENGTH = 6

function PasswordField({
  label,
  value,
  onChange,
  placeholder,
  show,
  onToggleShow,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  show: boolean
  onToggleShow: () => void
}) {
  return (
    <div>
      <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest block mb-1.5">
        {label}
      </label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-gold/60 transition-colors pr-12"
        />
        <button
          type="button"
          onClick={onToggleShow}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  )
}

export default function ChangePasswordModal({
  isOpen,
  onClose,
  language,
}: ChangePasswordModalProps) {
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const t = translations[language]
  const isRTL = language === "ar"

  const newPasswordValid = newPassword.length >= MIN_PASSWORD_LENGTH
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0
  const canSubmit =
    oldPassword.trim().length > 0 &&
    newPasswordValid &&
    passwordsMatch &&
    oldPassword !== newPassword &&
    !submitted

  useEffect(() => {
    if (isOpen) {
      setOldPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setShowOldPassword(false)
      setShowNewPassword(false)
      setShowConfirmPassword(false)
      setSubmitted(false)
    }
  }, [isOpen])

  const handleClose = () => {
    setOldPassword("")
    setNewPassword("")
    setConfirmPassword("")
    setSubmitted(false)
    onClose()
  }

  const handleSave = async () => {
    if (!canSubmit) return

    setError(null)
    setSubmitted(true)
    try {
      await updatePasswordRequest({
        oldPassword,
        newPassword,
        confirmPassword,
      })
      setTimeout(() => {
        setSubmitted(false)
        handleClose()
      }, 1500)
    } catch (err) {
      setSubmitted(false)
      setError(err instanceof Error ? err.message : "Password update failed")
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div
        className="absolute inset-0 bg-overlay backdrop-blur-sm"
        onClick={handleClose}
      />

      <div className="relative w-full sm:max-w-lg mx-auto bg-background sm:rounded-2xl shadow-2xl shadow-black/60 border border-border flex flex-col max-h-[92vh] sm:max-h-[85vh] overflow-hidden">
        <div className="flex items-center justify-between px-4 sm:px-5 py-4 border-b border-border bg-card shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
              <KeyRound className="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">{t.changePassword}</h2>
              <p className="text-[10px] text-muted-foreground">{t.changePasswordDesc}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          <div className="px-4 sm:px-5 py-4 sm:py-5 flex flex-col gap-4">
            <PasswordField
              label={t.oldPassword}
              value={oldPassword}
              onChange={setOldPassword}
              placeholder={t.oldPasswordPlaceholder}
              show={showOldPassword}
              onToggleShow={() => setShowOldPassword(!showOldPassword)}
            />

            <PasswordField
              label={t.newPassword}
              value={newPassword}
              onChange={setNewPassword}
              placeholder={t.newPasswordPlaceholder}
              show={showNewPassword}
              onToggleShow={() => setShowNewPassword(!showNewPassword)}
            />
            {newPassword.length > 0 && !newPasswordValid && (
              <p className="text-[10px] text-destructive-foreground -mt-2">{t.passwordTooShort}</p>
            )}
            {oldPassword.length > 0 && newPassword.length > 0 && oldPassword === newPassword && (
              <p className="text-[10px] text-destructive-foreground -mt-2">{t.newPasswordSameAsOld}</p>
            )}

            <PasswordField
              label={t.confirmNewPassword}
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder={t.confirmNewPasswordPlaceholder}
              show={showConfirmPassword}
              onToggleShow={() => setShowConfirmPassword(!showConfirmPassword)}
            />
            {confirmPassword.length > 0 && !passwordsMatch && (
              <p className="text-[10px] text-destructive-foreground -mt-2">{t.passwordsDoNotMatch}</p>
            )}
            {passwordsMatch && (
              <p className="text-[10px] text-green -mt-2 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                {t.passwordsMatch}
              </p>
            )}

            <div className="rounded-xl bg-secondary/40 border border-border p-3 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed text-muted-foreground">{t.changePasswordHint}</p>
            </div>

            {error && (
              <p className="text-sm text-destructive-foreground bg-destructive/10 border border-destructive/20 rounded-xl px-3 py-2">
                {error}
              </p>
            )}

            <button
              onClick={handleSave}
              disabled={!canSubmit}
              className="w-full py-3.5 rounded-xl font-bold text-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-gold to-gold-light text-primary-foreground shadow-lg shadow-gold/20 hover:shadow-gold/30 hover:opacity-90 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {submitted ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  {t.passwordChangeSuccess}
                </>
              ) : (
                t.updatePassword
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
