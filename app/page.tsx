"use client"

import { useState, useEffect } from "react"
import { Home, ClipboardList, Users, Gem, User, MessageCircle, Globe, ChevronDown, Bell, Loader2 } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserProvider, useUser } from "@/contexts/user-context"
import HomeTab from "@/components/tabs/HomeTab"
import TaskTab from "@/components/tabs/TaskTab"
import TeamTab from "@/components/tabs/TeamTab"
import VipTab from "@/components/tabs/VipTab"
import ProfileTab from "@/components/tabs/ProfileTab"
import { ProfileAvatar } from "@/components/account/AccountModal"
import { translations, type Language } from "@/lib/translations"
import { vipPlans } from "@/lib/vip-data"

const languages: { code: Language; label: string; flag: string }[] = [
  { code: "en", label: "English", flag: "EN" },
  { code: "fr", label: "Français", flag: "FR" },
  { code: "ar", label: "العربية", flag: "AR" },
]

function DashboardPage() {
  const [activeTab, setActiveTab] = useState("home")
  const [language, setLanguage] = useState<Language>("en")
  const [showLangMenu, setShowLangMenu] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { data, loading } = useUser()

  useEffect(() => {
    setMounted(true)
  }, [])

  const t = translations[language]
  const isRTL = language === "ar"

  const tabs = [
    { id: "home", label: t.home, icon: Home },
    { id: "task", label: t.tasks, icon: ClipboardList },
    { id: "team", label: t.team, icon: Users },
    { id: "vip", label: t.vip, icon: Gem },
    { id: "profile", label: t.profile, icon: User },
  ]

  const getPageDescription = () => {
    switch (activeTab) {
      case "home":
        return language === "ar" ? "نظرة عامة على أرباحك" : language === "fr" ? "Aperçu de vos gains" : "Your earnings overview"
      case "task":
        return language === "ar" ? "المهام اليومية والإنجازات" : language === "fr" ? "Tâches quotidiennes" : "Daily tasks & completions"
      case "team":
        return language === "ar" ? "الإحالات وعمولات الفريق" : language === "fr" ? "Parrainages et commissions" : "Referrals & team commissions"
      case "vip":
        return language === "ar" ? "ترقية المستوى المميز" : language === "fr" ? "Progression VIP" : "Premium tier progression"
      case "profile":
        return language === "ar" ? "الحساب والإعدادات" : language === "fr" ? "Compte et paramètres" : "Account & settings"
      default:
        return ""
    }
  }

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-gold animate-spin" />
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-background ${isRTL ? "rtl" : "ltr"}`} dir={isRTL ? "rtl" : "ltr"}>
      <div className="flex min-h-screen">
        <aside className={`hidden xl:flex flex-col w-64 2xl:w-72 border-border bg-sidebar fixed top-0 bottom-0 z-40 ${isRTL ? "right-0 border-l" : "left-0 border-r"}`}>
          <div className="p-4 2xl:p-6 border-b border-sidebar-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 2xl:w-12 2xl:h-12 rounded-xl bg-gold flex items-center justify-center shadow-lg shadow-gold/20 shrink-0">
                <Gem className="w-5 h-5 2xl:w-6 2xl:h-6 text-primary-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-lg 2xl:text-xl font-bold tracking-tight text-sidebar-foreground block truncate">{t.appName}</span>
                <p className="text-[10px] 2xl:text-xs text-muted-foreground truncate">{language === "ar" ? "منصة الأرباح" : language === "fr" ? "Plateforme de gains" : "Earnings Platform"}</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-3 2xl:p-4 overflow-y-auto">
            <ul className="space-y-1 2xl:space-y-2">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id
                return (
                  <li key={tab.id}>
                    <button
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-3 2xl:px-4 py-2.5 2xl:py-3 rounded-xl transition-all text-sm 2xl:text-base ${
                        isActive
                          ? "bg-gold text-primary-foreground shadow-md shadow-gold/20"
                          : "text-sidebar-foreground hover:bg-sidebar-accent"
                      }`}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <tab.icon className={`w-4 h-4 2xl:w-5 2xl:h-5 shrink-0 ${isActive ? "text-primary-foreground" : "text-muted-foreground"}`} />
                      <span className="font-medium truncate">{tab.label}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </nav>

          <div className="p-3 2xl:p-4 border-t border-sidebar-border space-y-2 2xl:space-y-3">
            <div className="relative">
              <button
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="w-full flex items-center justify-between gap-2 bg-sidebar-accent rounded-xl px-3 2xl:px-4 py-2.5 2xl:py-3 hover:bg-sidebar-accent/80 transition-colors"
              >
                <div className="flex items-center gap-2 2xl:gap-3 min-w-0">
                  <Globe className="w-4 h-4 2xl:w-5 2xl:h-5 text-muted-foreground shrink-0" />
                  <span className="text-xs 2xl:text-sm font-medium text-sidebar-foreground truncate">
                    {languages.find((l) => l.code === language)?.label}
                  </span>
                </div>
                <ChevronDown className={`w-3 h-3 2xl:w-4 2xl:h-4 text-muted-foreground transition-transform shrink-0 ${showLangMenu ? "rotate-180" : ""}`} />
              </button>

              {showLangMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowLangMenu(false)} />
                  <div className={`absolute bottom-full mb-2 z-50 bg-card border border-border rounded-xl shadow-xl overflow-hidden w-full ${isRTL ? "right-0" : "left-0"}`}>
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code)
                          setShowLangMenu(false)
                        }}
                        className={`w-full px-3 2xl:px-4 py-2.5 2xl:py-3 text-left text-xs 2xl:text-sm flex items-center gap-2 2xl:gap-3 hover:bg-secondary transition-colors ${
                          language === lang.code ? "text-gold bg-gold/10" : "text-foreground"
                        }`}
                      >
                        <span className="font-semibold">{lang.flag}</span>
                        <span>{lang.label}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center gap-2 2xl:gap-3 bg-sidebar-accent/50 rounded-xl p-2.5 2xl:p-3">
              {data?.user ? (
                <ProfileAvatar
                  email={data.user.email}
                  avatarUrl={data.user.avatarUrl}
                  avatarPreset={data.user.avatarPreset as "gold" | "blue" | "green" | "violet" | "rose" | "cyan"}
                  size="sm"
                />
              ) : (
                <div className="w-8 h-8 2xl:w-10 2xl:h-10 rounded-full bg-gold/20 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 2xl:w-5 2xl:h-5 text-gold" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs 2xl:text-sm font-medium text-sidebar-foreground truncate">{data?.user.email}</p>
                <p className="text-[10px] 2xl:text-xs text-gold font-semibold">
                  {vipPlans.find((p) => p.level === (data?.user.vipLevel ?? 0))?.name ?? `VIP ${data?.user.vipLevel ?? 0}`}
                </p>
              </div>
            </div>
          </div>
        </aside>

        <div className={`flex-1 flex flex-col min-h-screen w-full ${isRTL ? "xl:mr-64 2xl:mr-72" : "xl:ml-64 2xl:ml-72"}`}>
          <header className="hidden xl:flex sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border items-center justify-between px-4 2xl:px-8 py-3 2xl:py-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl 2xl:text-2xl font-bold text-foreground truncate">
                {activeTab === "home" ? (
                  <span className="gold-shimmer">{language === "ar" ? "لوحة التحكم" : language === "fr" ? "Tableau de bord" : "Dashboard"}</span>
                ) : (
                  tabs.find((tab) => tab.id === activeTab)?.label
                )}
              </h1>
              <p className="text-xs 2xl:text-sm text-muted-foreground mt-0.5 truncate">{getPageDescription()}</p>
            </div>

            <div className="flex items-center gap-2 2xl:gap-3 shrink-0">
              <button className="w-9 h-9 2xl:w-10 2xl:h-10 rounded-xl bg-secondary border border-border flex items-center justify-center hover:border-gold/40 transition-colors">
                <Bell className="w-4 h-4 2xl:w-5 2xl:h-5 text-muted-foreground" />
              </button>
              <ThemeToggle />
            </div>
          </header>

          <header className="xl:hidden sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
            <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 gap-2">
              <button
                aria-label="Messages"
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-secondary border border-border flex items-center justify-center hover:border-gold/40 transition-colors shrink-0"
              >
                <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
              </button>

              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gold flex items-center justify-center shadow-lg shadow-gold/20 shrink-0">
                  <Gem className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-foreground" />
                </div>
                <span className="text-base sm:text-lg font-bold tracking-tight text-foreground truncate">{t.appName}</span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <ThemeToggle className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg" />
                <div className="relative">
                  <button
                    onClick={() => setShowLangMenu(!showLangMenu)}
                    className="flex items-center gap-1 sm:gap-1.5 bg-secondary border border-border rounded-lg px-2 sm:px-2.5 py-1.5 sm:py-2 hover:border-gold/40 transition-colors"
                  >
                    <Globe className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-muted-foreground" />
                    <span className="text-[10px] sm:text-xs font-medium text-muted-foreground">
                      {languages.find((l) => l.code === language)?.flag}
                    </span>
                    <ChevronDown className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-muted-foreground" />
                  </button>

                  {showLangMenu && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowLangMenu(false)} />
                      <div className={`absolute top-full mt-1 z-50 bg-card border border-border rounded-lg shadow-xl overflow-hidden min-w-[110px] sm:min-w-[120px] ${isRTL ? "left-0" : "right-0"}`}>
                        {languages.map((lang) => (
                          <button
                            key={lang.code}
                            onClick={() => {
                              setLanguage(lang.code)
                              setShowLangMenu(false)
                            }}
                            className={`w-full px-3 py-2 sm:py-2.5 text-left text-xs sm:text-sm flex items-center gap-2 hover:bg-secondary transition-colors ${
                              language === lang.code ? "text-gold bg-gold/10" : "text-foreground"
                            }`}
                          >
                            <span className="font-medium">{lang.flag}</span>
                            <span>{lang.label}</span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </header>

          <div className="xl:hidden px-3 sm:px-4 md:px-6 pt-3 pb-1">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">
              {activeTab === "home" ? (
                <span className="gold-shimmer">{language === "ar" ? "لوحة التحكم" : language === "fr" ? "Tableau de bord" : "Dashboard"}</span>
              ) : (
                tabs.find((tab) => tab.id === activeTab)?.label
              )}
            </h1>
            <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mt-0.5">{getPageDescription()}</p>
          </div>

          <main className="flex-1 overflow-y-auto px-3 sm:px-4 md:px-6 xl:px-8 pt-2 sm:pt-3 md:pt-4 xl:pt-6 pb-24 xl:pb-8">
            <div className="max-w-4xl xl:max-w-5xl mx-auto w-full">
              {activeTab === "home" && (
                <HomeTab language={language} onNavigateToTeam={() => setActiveTab("team")} />
              )}
              {activeTab === "task" && <TaskTab language={language} />}
              {activeTab === "team" && <TeamTab language={language} />}
              {activeTab === "vip" && <VipTab language={language} />}
              {activeTab === "profile" && <ProfileTab language={language} />}
            </div>
          </main>

          <nav className="xl:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border px-2 sm:px-3 md:px-4 pb-2 sm:pb-3 pt-1.5 sm:pt-2 safe-area-bottom">
            <div className="flex items-center justify-around max-w-lg mx-auto">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className="flex flex-col items-center gap-0.5 sm:gap-1 py-1 sm:py-1.5 px-1.5 sm:px-3 rounded-lg transition-all min-w-0 flex-1 max-w-[72px] sm:max-w-none"
                    aria-label={tab.label}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <div
                      className={`w-8 h-6 sm:w-10 sm:h-8 flex items-center justify-center rounded-lg transition-all ${
                        isActive ? "bg-gold shadow-md shadow-gold/20" : "hover:bg-secondary"
                      }`}
                    >
                      <tab.icon
                        className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors ${
                          isActive ? "text-primary-foreground" : "text-muted-foreground"
                        }`}
                      />
                    </div>
                    <span
                      className={`text-[9px] sm:text-[10px] font-semibold transition-colors truncate max-w-full ${
                        isActive ? "text-gold" : "text-muted-foreground"
                      }`}
                    >
                      {tab.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </nav>
        </div>
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <UserProvider>
      <DashboardPage />
    </UserProvider>
  )
}
