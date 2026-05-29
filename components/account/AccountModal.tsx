"use client"

import { useEffect, useRef, useState } from "react"
import { X, User, Eye, EyeOff, CheckCircle2, Camera, Upload } from "lucide-react"
import { translations, type Language } from "@/lib/translations"
import { updateProfileRequest } from "@/lib/client-api"

export const AVATAR_PRESETS = [
  { id: "gold", gradient: "from-gold to-amber-600" },
  { id: "blue", gradient: "from-blue-400 to-blue-600" },
  { id: "green", gradient: "from-emerald-400 to-green-600" },
  { id: "violet", gradient: "from-violet-400 to-purple-600" },
  { id: "rose", gradient: "from-rose-400 to-pink-600" },
  { id: "cyan", gradient: "from-cyan-400 to-teal-600" },
] as const

export type AvatarPresetId = (typeof AVATAR_PRESETS)[number]["id"]

export interface AccountProfile {
  email: string
  avatarUrl: string | null
  avatarPreset: AvatarPresetId
}

interface AccountModalProps {
  isOpen: boolean
  onClose: () => void
  language: Language
  profile: AccountProfile
  onSuccess?: () => void
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

export function ProfileAvatar({
  email,
  avatarUrl,
  avatarPreset,
  size = "md",
}: AccountProfile & { size?: "sm" | "md" | "lg" }) {
  const preset = AVATAR_PRESETS.find((item) => item.id === avatarPreset) ?? AVATAR_PRESETS[0]
  const initial = email.trim().charAt(0).toUpperCase() || "U"

  const sizeClasses = {
    sm: "w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 text-xs",
    md: "w-16 h-16 sm:w-20 sm:h-20 text-xl",
    lg: "w-24 h-24 text-2xl",
  }

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={email}
        className={`${sizeClasses[size]} rounded-full object-cover border border-border shrink-0`}
      />
    )
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-gradient-to-br ${preset.gradient} flex items-center justify-center font-bold text-primary-foreground border border-border shrink-0`}
    >
      {initial}
    </div>
  )
}

export default function AccountModal({
  isOpen,
  onClose,
  language,
  profile,
  onSuccess,
}: AccountModalProps) {
  const [email, setEmail] = useState(profile.email)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile.avatarUrl)
  const [avatarPreset, setAvatarPreset] = useState<AvatarPresetId>(profile.avatarPreset)
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const t = translations[language]
  const isRTL = language === "ar"
  const emailValid = isValidEmail(email)

  useEffect(() => {
    if (isOpen) {
      setEmail(profile.email)
      setAvatarUrl(profile.avatarUrl)
      setAvatarPreset(profile.avatarPreset)
      setPassword("")
      setShowPassword(false)
      setSubmitted(false)
    }
  }, [isOpen, profile])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      setAvatarUrl(reader.result as string)
    }
    reader.readAsDataURL(file)
    event.target.value = ""
  }

  const handlePresetSelect = (presetId: AvatarPresetId) => {
    setAvatarPreset(presetId)
    setAvatarUrl(null)
  }

  const handleClose = () => {
    setPassword("")
    setSubmitted(false)
    onClose()
  }

  const handleSave = async () => {
    if (!emailValid || !password.trim() || submitted) return

    setError(null)
    setSubmitted(true)
    try {
      await updateProfileRequest({
        email: email.trim(),
        avatarUrl,
        avatarPreset,
        password,
      })
      onSuccess?.()
      setTimeout(() => {
        setSubmitted(false)
        setPassword("")
        onClose()
      }, 1500)
    } catch (err) {
      setSubmitted(false)
      setError(err instanceof Error ? err.message : "Update failed")
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
            <div className="w-8 h-8 rounded-lg bg-blue-400/15 flex items-center justify-center">
              <User className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">{t.accountSettings}</h2>
              <p className="text-[10px] text-muted-foreground">{t.accountSettingsDesc}</p>
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
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest block mb-3">
                {t.changeAvatar}
              </label>

              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <ProfileAvatar
                    email={email}
                    avatarUrl={avatarUrl}
                    avatarPreset={avatarPreset}
                    size="lg"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-gold text-primary-foreground flex items-center justify-center border-2 border-background shadow-md hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 text-xs font-medium text-gold hover:text-gold/80 transition-colors cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  {t.uploadPhoto}
                </button>

                <div className="w-full">
                  <p className="text-[10px] text-muted-foreground text-center mb-2">{t.chooseAvatarColor}</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {AVATAR_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handlePresetSelect(preset.id)}
                        className={`w-9 h-9 rounded-full bg-gradient-to-br ${preset.gradient} transition-all cursor-pointer ${
                          !avatarUrl && avatarPreset === preset.id
                            ? "ring-2 ring-gold ring-offset-2 ring-offset-background scale-110"
                            : "hover:scale-105 opacity-80 hover:opacity-100"
                        }`}
                        aria-label={preset.id}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest block mb-1.5">
                {t.email}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.emailPlaceholder}
                className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-gold/60 transition-colors"
              />
              {!emailValid && email.length > 0 && (
                <p className="text-[10px] text-destructive-foreground mt-1.5">{t.invalidEmail}</p>
              )}
            </div>

            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest block mb-1.5">
                {t.confirmPassword}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.confirmPasswordPlaceholder}
                  className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-gold/60 transition-colors pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1.5">{t.passwordRequiredHint}</p>
            </div>

            {error && (
              <p className="text-sm text-destructive-foreground bg-destructive/10 border border-destructive/20 rounded-xl px-3 py-2">
                {error}
              </p>
            )}

            <button
              onClick={handleSave}
              disabled={!emailValid || !password.trim() || submitted}
              className="w-full py-3.5 rounded-xl font-bold text-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-gold to-gold-light text-primary-foreground shadow-lg shadow-gold/20 hover:shadow-gold/30 hover:opacity-90 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {submitted ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  {t.accountUpdateSuccess}
                </>
              ) : (
                t.saveChanges
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
