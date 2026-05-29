"use client"

import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

interface ThemeToggleProps {
  className?: string
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = resolvedTheme === "dark"

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      disabled={!mounted}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
      className={cn(
        "w-9 h-9 2xl:w-10 2xl:h-10 rounded-xl bg-secondary border border-border flex items-center justify-center hover:border-gold/40 transition-colors disabled:opacity-70",
        className,
      )}
    >
      {!mounted ? (
        <span className="w-4 h-4 2xl:w-5 2xl:h-5 rounded-full bg-muted-foreground/30" />
      ) : isDark ? (
        <Sun className="w-4 h-4 2xl:w-5 2xl:h-5 text-gold" />
      ) : (
        <Moon className="w-4 h-4 2xl:w-5 2xl:h-5 text-muted-foreground" />
      )}
    </button>
  )
}
