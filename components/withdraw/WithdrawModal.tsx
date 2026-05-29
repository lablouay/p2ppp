"use client"

import { useState } from "react"
import { X, ChevronLeft, Eye, EyeOff, ArrowUpRight, AlertCircle, CheckCircle2, Clock, Zap, Shield } from "lucide-react"
import { translations, type Language } from "@/lib/translations"
import { withdrawRequest } from "@/lib/client-api"

interface WithdrawModalProps {
  isOpen: boolean
  onClose: () => void
  language: Language
  onSuccess?: () => void
}

const USDT_NETWORKS = [
  {
    id: "trc20",
    name: "TRC20-USDT",
    network: "TRC20",
    color: "from-emerald-500 to-green-600",
    badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
    fee: "1 USDT",
    minAmount: "10",
    maxAmount: "1,000,000",
    arrivalTime: "1–3 min",
  },
  {
    id: "bep20",
    name: "BEP20-USDT",
    network: "BEP20",
    color: "from-amber-500 to-yellow-600",
    badge: "bg-amber-500/15 text-amber-400 border-amber-500/25",
    fee: "1 USDT",
    minAmount: "10",
    maxAmount: "1,000,000",
    arrivalTime: "1–3 min",
  },
  {
    id: "erc20",
    name: "ERC20-USDT",
    network: "ERC20",
    color: "from-blue-500 to-indigo-600",
    badge: "bg-blue-500/15 text-blue-400 border-blue-500/25",
    fee: "5 USDT",
    minAmount: "20",
    maxAmount: "1,000,000",
    arrivalTime: "1–5 min",
  },
  {
    id: "polygon",
    name: "POLYGON-USDT",
    network: "POLYGON",
    color: "from-violet-500 to-purple-600",
    badge: "bg-violet-500/15 text-violet-400 border-violet-500/25",
    fee: "1 USDT",
    minAmount: "10",
    maxAmount: "1,000,000",
    arrivalTime: "1–3 min",
  },
]

const NETWORK_ICONS: Record<string, string> = {
  TRC20: "T",
  BEP20: "B",
  ERC20: "E",
  POLYGON: "P",
}

const NETWORK_GRADIENTS: Record<string, string> = {
  TRC20: "from-emerald-500 to-green-600",
  BEP20: "from-amber-500 to-yellow-600",
  ERC20: "from-blue-500 to-indigo-600",
  POLYGON: "from-violet-500 to-purple-600",
}

export default function WithdrawModal({ isOpen, onClose, language, onSuccess }: WithdrawModalProps) {
  const [selectedNetwork, setSelectedNetwork] = useState(USDT_NETWORKS[0])
  const [amount, setAmount] = useState("")
  const [address, setAddress] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const t = translations[language]
  const isRTL = language === "ar"

  const fee = parseFloat(selectedNetwork.fee)
  const amountNum = parseFloat(amount) || 0
  const received = Math.max(0, amountNum - fee)

  const handleConfirm = async () => {
    if (!amount || !address || !password || submitted) return

    setError(null)
    setSubmitted(true)
    try {
      await withdrawRequest({
        amount: amountNum,
        address,
        network: selectedNetwork.network,
        password,
        fee,
      })
      onSuccess?.()
      setTimeout(() => {
        setSubmitted(false)
        setAmount("")
        setAddress("")
        setPassword("")
        onClose()
      }, 2000)
    } catch (err) {
      setSubmitted(false)
      setError(err instanceof Error ? err.message : "Withdrawal failed")
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-overlay backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full sm:max-w-lg mx-auto bg-background sm:rounded-2xl shadow-2xl shadow-black/60 border border-border flex flex-col max-h-[92vh] sm:max-h-[85vh] overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-4 border-b border-border bg-card shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-green/15 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4 text-green" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">
                {t.withdrawTitle}
              </h2>
              <p className="text-[10px] text-muted-foreground">{t.withdraw24h}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-secondary hover:bg-secondary/80 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1">

          {/* Balance card */}
          <div className="mx-4 sm:mx-5 mt-4 rounded-xl bg-gradient-to-br from-secondary to-card border border-border p-4">
            <p className="text-[10px] text-muted-foreground mb-1">{t.totalBalance}</p>
            <p className="text-2xl font-bold text-foreground">
              0 <span className="text-sm font-semibold text-gold">USDT</span>
            </p>
          </div>

          {/* Network selector */}
          <div className="px-4 sm:px-5 mt-4">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2.5">
              {t.withdrawMode}
            </p>
            <div className="flex flex-wrap gap-2">
              {USDT_NETWORKS.map((net) => {
                const isActive = selectedNetwork.id === net.id
                return (
                  <button
                    key={net.id}
                    onClick={() => setSelectedNetwork(net)}
                    className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold border transition-all cursor-pointer ${
                      isActive
                        ? "bg-gold text-primary-foreground border-gold shadow-md shadow-gold/20"
                        : "bg-secondary border-border text-muted-foreground hover:border-gold/40 hover:text-foreground"
                    }`}
                  >
                    <span className={`w-4 h-4 rounded-full bg-gradient-to-br ${NETWORK_GRADIENTS[net.network]} flex items-center justify-center text-[8px] font-bold text-white shrink-0`}>
                      {NETWORK_ICONS[net.network]}
                    </span>
                    {net.name}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Form */}
          <div className="px-4 sm:px-5 mt-4 flex flex-col gap-3">

            {/* Amount */}
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest block mb-1.5">
                {t.withdrawAmount}
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={`${selectedNetwork.minAmount} – ${selectedNetwork.maxAmount}`}
                  className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-gold/60 transition-colors pr-16"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gold">USDT</span>
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest block mb-1.5">
                {t.withdrawAddress}
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={t.withdrawAddressPlaceholder}
                className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-gold/60 transition-colors"
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest block mb-1.5">
                {t.withdrawPassword}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
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
            </div>

            {/* Fee & received summary */}
            <div className="bg-secondary/50 border border-border rounded-xl p-3 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{t.withdrawFee}</span>
                <span className="text-xs font-semibold text-foreground">{selectedNetwork.fee}</span>
              </div>
              <div className="h-px bg-border" />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{t.withdrawReceived}</span>
                <span className="text-xs font-bold text-gold">{received > 0 ? received.toFixed(2) : "0"} USDT</span>
              </div>
            </div>

            {error && (
              <p className="text-sm text-destructive-foreground bg-destructive/10 border border-destructive/20 rounded-xl px-3 py-2">
                {error}
              </p>
            )}

            {/* Confirm button */}
            <button
              onClick={handleConfirm}
              disabled={!amount || !address || !password || submitted}
              className="w-full py-3.5 rounded-xl font-bold text-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-gold to-gold-light text-primary-foreground shadow-lg shadow-gold/20 hover:shadow-gold/30 hover:opacity-90 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {submitted ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  {t.withdrawSuccess}
                </>
              ) : (
                t.withdrawConfirm
              )}
            </button>
          </div>

          {/* Info section */}
          <div className="mx-4 sm:mx-5 mt-4 mb-5 rounded-xl bg-secondary/40 border border-border p-4 flex flex-col gap-2.5">
            {[
              { icon: Shield, color: "text-gold", bold: t.withdrawInfo1Bold, rest: t.withdrawInfo1Rest },
              { icon: Zap, color: "text-blue-400", bold: t.withdrawInfo2Bold, rest: t.withdrawInfo2Rest },
              { icon: Clock, color: "text-green", bold: t.withdrawInfo3Bold, rest: t.withdrawInfo3Rest },
              { icon: AlertCircle, color: "text-muted-foreground", bold: t.withdrawInfo4Bold, rest: t.withdrawInfo4Rest },
            ].map(({ icon: Icon, color, bold, rest }, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <div className={`w-5 h-5 rounded-md bg-secondary flex items-center justify-center shrink-0 mt-0.5`}>
                  <Icon className={`w-3 h-3 ${color}`} />
                </div>
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  <span className="font-semibold text-foreground">{bold}</span> {rest}
                </p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  )
}
