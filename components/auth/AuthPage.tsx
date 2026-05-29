"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Gem, Eye, EyeOff, Loader2 } from "lucide-react"
import { loginRequest, signupRequest } from "@/lib/client-api"
import { ThemeToggle } from "@/components/theme-toggle"

type AuthMode = "login" | "signup"

interface AuthPageProps {
  mode: AuthMode
}

export default function AuthPage({ mode }: AuthPageProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [inviteCode, setInviteCode] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [needs2FA, setNeeds2FA] = useState(false)
  const [totp, setTotp] = useState("")

  const isSignup = mode === "signup"

  useEffect(() => {
    const invite = searchParams.get("invite")
    if (invite) setInviteCode(invite)
  }, [searchParams])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)

    if (isSignup && password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setLoading(true)
    try {
      if (isSignup) {
        await signupRequest(email, password, inviteCode || undefined)
        router.push("/")
        router.refresh()
      } else {
        const result = await loginRequest(email, password, needs2FA ? totp : undefined)
        if ("requires2FA" in result && result.requires2FA) {
          setNeeds2FA(true)
          setError(null)
          return
        }
        router.push("/")
        router.refresh()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gold flex items-center justify-center shadow-lg shadow-gold/20">
            <Gem className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-foreground">NexEarn</span>
        </div>
        <ThemeToggle />
      </header>

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md">
          <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-xl">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-foreground">
                {isSignup ? "Create account" : "Welcome back"}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {isSignup
                  ? "Sign up to start earning with NexEarn"
                  : "Sign in to access your dashboard"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest block mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-gold/60 transition-colors"
                />
              </div>

              {needs2FA && !isSignup && (
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest block mb-1.5">
                    Authenticator code
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    value={totp}
                    onChange={(e) => setTotp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    required
                    placeholder="000000"
                    className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm text-foreground tracking-[0.3em] text-center focus:outline-none focus:border-gold/60 transition-colors"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1.5">
                    Enter the 6-digit code from your authenticator app.
                  </p>
                </div>
              )}

              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest block mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="••••••••"
                    className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-gold/60 transition-colors pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {isSignup && (
                <>
                  <div>
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest block mb-1.5">
                      Confirm password
                    </label>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                      placeholder="••••••••"
                      className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-gold/60 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest block mb-1.5">
                      Invitation code (optional)
                    </label>
                    <input
                      type="text"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value)}
                      placeholder="6-digit code"
                      className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-gold/60 transition-colors"
                    />
                  </div>
                </>
              )}

              {error && (
                <p className="text-sm text-destructive-foreground bg-destructive/10 border border-destructive/20 rounded-xl px-3 py-2">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl font-bold text-sm transition-all cursor-pointer disabled:opacity-50 bg-gradient-to-r from-gold to-gold-light text-primary-foreground shadow-lg shadow-gold/20 hover:opacity-90 active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {isSignup ? "Sign up" : "Sign in"}
              </button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-6">
              {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
              <Link
                href={isSignup ? "/login" : "/signup"}
                className="text-gold font-semibold hover:underline"
              >
                {isSignup ? "Sign in" : "Sign up"}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
