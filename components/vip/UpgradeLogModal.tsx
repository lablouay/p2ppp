"use client"

import { useEffect, useState } from "react"
import { X, Loader2, History } from "lucide-react"
import { translations, type Language } from "@/lib/translations"
import { fetchVipUpgrades, formatUsdt } from "@/lib/client-api"
import type { VipUpgradeLogEntry } from "@/lib/types/api"

interface UpgradeLogModalProps {
  isOpen: boolean
  onClose: () => void
  language: Language
}

export default function UpgradeLogModal({ isOpen, onClose, language }: UpgradeLogModalProps) {
  const [logs, setLogs] = useState<VipUpgradeLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const t = translations[language]

  useEffect(() => {
    if (!isOpen) return
    setLoading(true)
    fetchVipUpgrades()
      .then((data) => setLogs(data.logs))
      .finally(() => setLoading(false))
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-overlay backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-md mx-auto bg-background sm:rounded-2xl border border-border max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-4 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-gold" />
            <h2 className="text-sm font-bold">{t.upgradeLog}</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-y-auto p-4 flex-1">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-8 h-8 text-gold animate-spin" />
            </div>
          ) : logs.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">{t.noData}</p>
          ) : (
            <div className="space-y-2">
              {logs.map((log) => (
                <div key={log.id} className="bg-card border border-border rounded-xl p-3">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <p className="text-sm font-bold text-foreground">{log.planName}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(log.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <p className="text-sm font-bold text-gold">{formatUsdt(log.totalPaid)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
