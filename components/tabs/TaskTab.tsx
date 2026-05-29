"use client"

import { useCallback, useEffect, useState } from "react"
import { CheckCircle2, Clock, ListTodo, Inbox, Loader2 } from "lucide-react"
import { translations, type Language } from "@/lib/translations"
import { fetchUserTasks, completeTaskRequest, formatUsdt } from "@/lib/client-api"
import { useUser } from "@/contexts/user-context"
import TaskDetailModal from "@/components/tasks/TaskDetailModal"

interface TaskTabProps {
  language: Language
}

type TaskItem = {
  id: string
  title: string
  content: string
  link: string
  completed: boolean
  earnAmount: number
}

export default function TaskTab({ language }: TaskTabProps) {
  const t = translations[language]
  const { refresh } = useUser()
  const [activeTab, setActiveTab] = useState<"ongoing" | "completed">("ongoing")
  const [loading, setLoading] = useState(true)
  const [tasks, setTasks] = useState<TaskItem[]>([])
  const [stats, setStats] = useState({
    totalToday: 0,
    completedToday: 0,
    remainingToday: 0,
    earnedToday: 0,
    rewardPerTask: 0,
  })
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null)
  const [completing, setCompleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadTasks = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchUserTasks()
      setTasks(data.tasks)
      setStats(data.stats)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tasks")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadTasks()
  }, [loadTasks])

  const ongoing = tasks.filter((task) => !task.completed)
  const completed = tasks.filter((task) => task.completed)
  const displayed = activeTab === "ongoing" ? ongoing : completed

  const handleContinue = async () => {
    if (!selectedTask) return
    setCompleting(true)
    try {
      const data = await completeTaskRequest(selectedTask.id)
      setTasks(data.tasks)
      setStats(data.stats)
      setSelectedTask(null)
      void refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not complete task")
    } finally {
      setCompleting(false)
    }
  }

  const howItWorks = {
    en: [
      { step: "1", text: "Unlock a VIP tier with your deposit" },
      { step: "2", text: "Complete daily tasks assigned to your tier" },
      { step: "3", text: "Earn USDT rewards automatically" },
    ],
    fr: [
      { step: "1", text: "Débloquez un niveau VIP avec votre dépôt" },
      { step: "2", text: "Complétez les tâches quotidiennes de votre niveau" },
      { step: "3", text: "Gagnez des récompenses USDT automatiquement" },
    ],
    ar: [
      { step: "1", text: "افتح مستوى VIP بإيداعك" },
      { step: "2", text: "أكمل المهام اليومية المخصصة لمستواك" },
      { step: "3", text: "اربح مكافآت USDT تلقائيًا" },
    ],
  }

  const taskStats = [
    { label: t.allTasksToday, value: stats.totalToday },
    { label: t.remainingTasks, value: stats.remainingToday },
  ]

  return (
    <>
      <div className="flex flex-col gap-3 sm:gap-4 lg:gap-5 pb-4">
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          {taskStats.map((stat) => (
            <div
              key={stat.label}
              className="bg-card border border-border rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-5"
            >
              <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                {stat.label === t.allTasksToday ? (
                  <ListTodo className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 text-gold shrink-0" />
                ) : (
                  <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 text-muted-foreground shrink-0" />
                )}
                <p className="text-[9px] sm:text-[10px] lg:text-xs text-muted-foreground leading-tight truncate">{stat.label}</p>
              </div>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">{stat.value}</p>
            </div>
          ))}
        </div>

        {stats.earnedToday > 0 && (
          <p className="text-xs text-gold font-semibold text-center">
            {language === "ar"
              ? `ربحت اليوم: ${formatUsdt(stats.earnedToday)}`
              : language === "fr"
              ? `Gagné aujourd'hui: ${formatUsdt(stats.earnedToday)}`
              : `Earned today: ${formatUsdt(stats.earnedToday)}`}
          </p>
        )}

        <div className="flex bg-secondary rounded-xl sm:rounded-2xl p-1">
          <button
            onClick={() => setActiveTab("ongoing")}
            className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs lg:text-sm font-semibold transition-all ${
              activeTab === "ongoing"
                ? "bg-card text-foreground shadow-sm border border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 shrink-0" />
            <span className="truncate">{t.inProgress}</span>
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs lg:text-sm font-semibold transition-all ${
              activeTab === "completed"
                ? "bg-card text-foreground shadow-sm border border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 shrink-0" />
            <span className="truncate">{t.completed}</span>
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-gold animate-spin" />
          </div>
        ) : error ? (
          <p className="text-sm text-destructive-foreground text-center py-8">{error}</p>
        ) : displayed.length === 0 ? (
          <div className="bg-card border border-border rounded-xl sm:rounded-2xl flex flex-col items-center justify-center py-10 sm:py-12 lg:py-16 px-4 sm:px-6 text-center">
            <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl sm:rounded-2xl bg-secondary flex items-center justify-center mb-3 sm:mb-4">
              <Inbox className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-muted-foreground" />
            </div>
            <p className="text-sm sm:text-base font-semibold text-foreground mb-1">{t.noData}</p>
            <p className="text-[10px] sm:text-xs lg:text-sm text-muted-foreground leading-relaxed max-w-xs">
              {activeTab === "ongoing"
                ? language === "ar"
                  ? "لا توجد مهام متاحة لمستوى VIP الخاص بك. اطلب من المسؤول إضافة مهام."
                  : language === "fr"
                  ? "Aucune tâche pour votre niveau VIP. Demandez à l'admin d'en ajouter."
                  : "No tasks for your VIP level yet. Ask admin to add tasks for your plan."
                : language === "ar"
                ? "ستظهر المهام المكتملة هنا."
                : language === "fr"
                ? "Les tâches terminées apparaîtront ici."
                : "Completed tasks will appear here."}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {displayed.map((task) => (
              <button
                key={task.id}
                type="button"
                onClick={() => !task.completed && setSelectedTask(task)}
                disabled={task.completed}
                className={`w-full text-left bg-card border border-border rounded-xl p-4 transition-all ${
                  task.completed ? "opacity-70" : "hover:border-gold/40 active:scale-[0.99]"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-sm text-foreground">{task.title}</p>
                  <span className="text-[10px] font-bold text-gold shrink-0">
                    {formatUsdt(task.earnAmount)}
                  </span>
                </div>
                {task.completed && (
                  <span className="text-[10px] text-green mt-1 inline-block">{t.completed}</span>
                )}
              </button>
            ))}
          </div>
        )}

        <div className="bg-card border border-border rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-5">
          <h3 className="text-[10px] sm:text-xs lg:text-sm font-semibold text-foreground mb-2 sm:mb-3">{t.howItWorks}</h3>
          <div className="flex flex-col gap-2 sm:gap-2.5 lg:gap-3">
            {howItWorks[language].map((item) => (
              <div key={item.step} className="flex items-center gap-2 sm:gap-2.5 lg:gap-3">
                <div className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0">
                  <span className="text-[9px] sm:text-[10px] lg:text-xs font-bold text-gold">{item.step}</span>
                </div>
                <p className="text-[10px] sm:text-xs lg:text-sm text-muted-foreground">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedTask && (
        <TaskDetailModal
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          language={language}
          title={selectedTask.title}
          content={selectedTask.content}
          link={selectedTask.link}
          earnAmount={selectedTask.earnAmount}
          loading={completing}
          onContinue={handleContinue}
        />
      )}
    </>
  )
}
