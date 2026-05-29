"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Copy, Check, AlertCircle, X } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"
import { translations, type Language } from "@/lib/translations"
import { depositRequest, formatUsdt } from "@/lib/client-api"
import { Loader2 } from "lucide-react"

interface DepositModalProps {
  isOpen: boolean
  onClose: () => void
  language: Language
  minAmount?: number
  onSuccess?: () => void
}

// USDT networks with their wallet addresses
const usdtNetworks = [
  {
    id: "trc20",
    name: "TRC20-USDT",
    network: "Tron (TRC20)",
    iconBg: "from-emerald-500 to-emerald-600",
    address: "TBs2eym1f2PtPheF5QELgZbxQPZtE7JaLT",
    minDeposit: 10,
  },
  {
    id: "bep20",
    name: "BEP20-USDT",
    network: "BNB Smart Chain (BEP20)",
    iconBg: "from-amber-400 to-amber-500",
    address: "0x742d35Cc6634C0532925a3b844Bc9e7595f2bD20",
    minDeposit: 10,
  },
  {
    id: "erc20",
    name: "ETH-USDT",
    network: "Ethereum (ERC20)",
    iconBg: "from-blue-500 to-blue-600",
    address: "0x742d35Cc6634C0532925a3b844Bc9e7595f2bD20",
    minDeposit: 50,
  },
  {
    id: "polygon",
    name: "POLYGON-USDT",
    network: "Polygon",
    iconBg: "from-violet-500 to-violet-600",
    address: "0x742d35Cc6634C0532925a3b844Bc9e7595f2bD20",
    minDeposit: 10,
  },
]

export default function DepositModal({ isOpen, onClose, language, minAmount, onSuccess }: DepositModalProps) {
  const [selectedNetwork, setSelectedNetwork] = useState<typeof usdtNetworks[0] | null>(null)
  const [copied, setCopied] = useState(false)
  const [depositAmount, setDepositAmount] = useState("")
  const [userAddress, setUserAddress] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [depositError, setDepositError] = useState<string | null>(null)
  const t = translations[language]

  const effectiveMin = minAmount ?? selectedNetwork?.minDeposit ?? 10

  const handleCopy = async () => {
    if (selectedNetwork) {
      await navigator.clipboard.writeText(selectedNetwork.address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleBack = () => {
    setSelectedNetwork(null)
  }

  const handleClose = () => {
    setSelectedNetwork(null)
    setDepositAmount("")
    setUserAddress("")
    setSubmitted(false)
    setDepositError(null)
    onClose()
  }

  const handleConfirmDeposit = async () => {
    if (!selectedNetwork) return
    const amount = parseFloat(depositAmount)
    const address = userAddress.trim()
    if (!address || address.length < 10) {
      setDepositError(
        language === "ar"
          ? "أدخل عنوان محفظة USDT الخاص بك"
          : language === "fr"
          ? "Entrez votre adresse portefeuille USDT"
          : "Enter your USDT wallet address",
      )
      return
    }
    if (!amount || amount < effectiveMin) {
      setDepositError(
        language === "ar"
          ? `الحد الأدنى ${effectiveMin} USDT`
          : language === "fr"
          ? `Minimum ${effectiveMin} USDT`
          : `Minimum ${effectiveMin} USDT`,
      )
      return
    }
    setSubmitting(true)
    setDepositError(null)
    try {
      await depositRequest(amount, address, selectedNetwork.network)
      setSubmitted(true)
      onSuccess?.()
    } catch (err) {
      setDepositError(err instanceof Error ? err.message : "Deposit failed")
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-overlay backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full sm:max-w-md sm:mx-4 max-h-[85vh] sm:max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300">
        {/* Header */}
        <div className="bg-card border-b border-border rounded-t-2xl sm:rounded-t-2xl px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={selectedNetwork ? handleBack : handleClose}
              className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-foreground font-semibold text-base">
              {selectedNetwork 
                ? t.depositUSDT
                : t.selectNetwork
              }
            </h2>
            <button
              onClick={handleClose}
              className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content area */}
        <div className="bg-background rounded-b-2xl sm:rounded-b-2xl max-h-[75vh] overflow-y-auto pb-safe-area-bottom">
          {!selectedNetwork ? (
            // Network Selection List
            <div className="p-4">
              <div className="space-y-2">
                {usdtNetworks.map((network) => (
                  <button
                    key={network.id}
                    onClick={() => setSelectedNetwork(network)}
                    className="w-full flex items-center justify-between px-4 py-4 bg-card hover:bg-secondary border border-border hover:border-gold/30 rounded-xl transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${network.iconBg} flex items-center justify-center shadow-lg`}>
                        <span className="text-white text-sm font-bold">₮</span>
                      </div>
                      <div className="text-left">
                        <span className="text-foreground font-medium text-sm block">{network.name}</span>
                        <span className="text-muted-foreground text-xs">{network.network}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-gold transition-colors" />
                  </button>
                ))}
              </div>
              
              {/* Info note */}
              <div className="mt-4 flex items-start gap-2 p-3 bg-gold/5 border border-gold/20 rounded-xl">
                <AlertCircle className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                <p className="text-muted-foreground text-xs leading-relaxed">
                  {language === "fr" 
                    ? "Sélectionnez un réseau pour afficher l'adresse de dépôt USDT"
                    : language === "ar"
                    ? "حدد شبكة لعرض عنوان إيداع USDT"
                    : "Select a network to view the USDT deposit address"
                  }
                </p>
              </div>
            </div>
          ) : (
            // Deposit Details View
            <div className="p-4 space-y-4">
              {/* Network Badge */}
              <div className="flex items-center justify-center">
                <div className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-full">
                  <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${selectedNetwork.iconBg} flex items-center justify-center`}>
                    <span className="text-white text-xs font-bold">₮</span>
                  </div>
                  <span className="text-gold font-semibold text-sm">{selectedNetwork.name}</span>
                </div>
              </div>

              {/* QR Code Card */}
              <div className="bg-card border border-border rounded-2xl p-5">
                <div className="flex justify-center mb-5">
                  <div className="bg-white p-4 rounded-xl shadow-lg">
                    <QRCodeSVG 
                      value={selectedNetwork.address}
                      size={160}
                      level="H"
                      includeMargin={false}
                    />
                  </div>
                </div>

                {/* Address Label */}
                <h3 className="text-center text-muted-foreground text-sm mb-3">{t.address}</h3>

                {/* Address Box */}
                <div className="flex items-center gap-2 bg-secondary rounded-xl px-3 py-3 border border-border">
                  <span className="flex-1 text-foreground text-xs font-mono break-all leading-relaxed">
                    {selectedNetwork.address}
                  </span>
                  <button
                    onClick={handleCopy}
                    className={`shrink-0 px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      copied 
                        ? "bg-green text-primary-foreground" 
                        : "bg-gold text-primary-foreground hover:bg-gold-light"
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        {t.copied}
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        {t.copy}
                      </>
                    )}
                  </button>
                </div>
              </div>

              {submitted ? (
                <div className="bg-green/10 border border-green/20 rounded-xl p-4 text-center space-y-2">
                  <p className="text-sm font-semibold text-green">
                    {language === "ar"
                      ? "تم إرسال طلب الإيداع"
                      : language === "fr"
                      ? "Demande de dépôt envoyée"
                      : "Deposit request submitted"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {language === "ar"
                      ? "سيتم إضافة المبلغ إلى حسابك بعد تأكيد المسؤول."
                      : language === "fr"
                      ? "Le montant sera crédité après validation par l'admin."
                      : "Funds will be added after admin confirms your deposit."}
                  </p>
                  <button
                    onClick={handleClose}
                    className="mt-2 w-full py-3 rounded-xl bg-gold text-primary-foreground font-semibold text-sm"
                  >
                    {language === "ar" ? "إغلاق" : language === "fr" ? "Fermer" : "Close"}
                  </button>
                </div>
              ) : (
                <>
                  <div className="bg-card border border-border rounded-xl p-4 space-y-3">
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                      {language === "ar" ? "عنوان محفظتك (USDT)" : language === "fr" ? "Votre adresse portefeuille" : "Your wallet address"} (USDT)
                    </label>
                    <input
                      type="text"
                      value={userAddress}
                      onChange={(e) => setUserAddress(e.target.value)}
                      placeholder={language === "ar" ? "العنوان الذي أرسلت منه" : "Address you sent from"}
                      className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm font-mono"
                    />
                  </div>

                  <div className="bg-card border border-border rounded-xl p-4 space-y-3">
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                      {language === "ar" ? "مبلغ الإيداع" : language === "fr" ? "Montant du dépôt" : "Deposit amount"} (USDT)
                    </label>
                    <input
                      type="number"
                      min={effectiveMin}
                      step="0.01"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      placeholder={String(effectiveMin)}
                      className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm"
                    />
                    {minAmount != null && (
                      <p className="text-[10px] text-gold">
                        {language === "ar"
                          ? `مطلوب على الأقل ${formatUsdt(minAmount)} للتسجيل في VIP`
                          : language === "fr"
                          ? `Minimum ${formatUsdt(minAmount)} requis pour VIP`
                          : `At least ${formatUsdt(minAmount)} required for VIP enrollment`}
                      </p>
                    )}
                  </div>

                  {depositError && (
                    <p className="text-sm text-destructive-foreground bg-destructive/10 rounded-xl px-3 py-2">{depositError}</p>
                  )}

                  <button
                    onClick={handleConfirmDeposit}
                    disabled={submitting}
                    className="w-full bg-gradient-to-r from-gold to-gold-light text-primary-foreground font-semibold py-4 rounded-xl shadow-lg transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : t.depositComplete}
                  </button>
                </>
              )}

              {/* Instructions Card */}
              <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
                <div className="flex gap-3">
                  <span className="w-5 h-5 rounded-full bg-gold/20 text-gold text-xs font-semibold flex items-center justify-center shrink-0">1</span>
                  <span className="text-muted-foreground text-xs leading-relaxed">
                    {t.depositInstructions1.replace("{network}", selectedNetwork.network)}
                  </span>
                </div>
                <div className="flex gap-3">
                  <span className="w-5 h-5 rounded-full bg-gold/20 text-gold text-xs font-semibold flex items-center justify-center shrink-0">2</span>
                  <span className="text-muted-foreground text-xs leading-relaxed">
                    {t.depositInstructions2.replace("{network}", selectedNetwork.network)}
                  </span>
                </div>
                <div className="flex gap-3">
                  <span className="w-5 h-5 rounded-full bg-gold/20 text-gold text-xs font-semibold flex items-center justify-center shrink-0">3</span>
                  <span className="text-muted-foreground text-xs leading-relaxed">
                    {t.depositInstructions3}
                  </span>
                </div>
                
                {/* Minimum Deposit Notice */}
                <div className="flex items-center gap-2 pt-3 mt-3 border-t border-border">
                  <AlertCircle className="w-4 h-4 text-gold shrink-0" />
                  <span className="text-gold text-xs font-medium">
                    {t.minimumDeposit}: ${selectedNetwork.minDeposit} USDT
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
