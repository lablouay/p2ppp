"use client"

import React, { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Users,
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  ListTodo,
  LogOut,
  Check,
  X,
  Plus,
  Trash2,
  RefreshCw,
  Loader2,
  Pencil,
  Ban,
  DollarSign,
} from "lucide-react"
import { vipPlans } from "@/lib/vip-data"
import { formatUsdt } from "@/lib/client-api"
import AdminOverviewCharts from "@/components/admin/AdminOverviewCharts"

type AdminTab = "overview" | "deposits" | "withdrawals" | "tasks" | "users"
type OrderFilter = "ALL" | "PENDING" | "APPROVED" | "REJECTED"

interface AdminStats {
  overview: {
    userCount: number
    bannedCount: number
    vipUsersCount: number
    totalDeposited: number
    totalWithdrawn: number
    netBalance: number
    nextMonthPayout: number
    tasksCompletedToday: number
    taskEarningsToday: number
    pendingDeposits: number
    pendingWithdrawals: number
    rejectedDeposits: number
    referralPaidThisMonth: number
    totalReferralPaid: number
  }
  charts: {
    signups: { label: string; value: number }[]
    deposits: { label: string; value: number }[]
    withdrawals: { label: string; value: number }[]
    vipUpgrades: { label: string; value: number }[]
  }
  users: Array<{
    id: string
    email: string
    vipLevel: number
    banned: boolean
    planName: string
    balance: number
    workDeposit: number
    directReferrals: number
    tasksToday: number
    earnedToday: number
  }>
}

interface DepositRow {
  id: string
  amount: number
  address: string
  network: string
  status: string
  createdAt: string
  user: { email: string; vipLevel: number }
}

interface WithdrawalRow {
  id: string
  amount: number
  address: string
  network: string
  fee: number
  status: string
  createdAt: string
  user: { email: string; vipLevel: number }
}

interface PlanTaskRow {
  id: string
  vipLevel: number
  title: string
  content: string
  link: string
  sortOrder: number
  active: boolean
}

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-500/15 text-amber-600",
  APPROVED: "bg-green/15 text-green",
  REJECTED: "bg-destructive/15 text-destructive-foreground",
}

export default function AdminDashboard() {
  const router = useRouter()
  const [tab, setTab] = useState<AdminTab>("overview")
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [deposits, setDeposits] = useState<DepositRow[]>([])
  const [withdrawals, setWithdrawals] = useState<WithdrawalRow[]>([])
  const [tasks, setTasks] = useState<PlanTaskRow[]>([])
  const [depositFilter, setDepositFilter] = useState<OrderFilter>("ALL")
  const [withdrawFilter, setWithdrawFilter] = useState<OrderFilter>("ALL")
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const [newTask, setNewTask] = useState({ vipLevel: 1, title: "", content: "", link: "", sortOrder: 0 })
  const [editingTask, setEditingTask] = useState<PlanTaskRow | null>(null)
  const [editingUser, setEditingUser] = useState<AdminStats["users"][0] | null>(null)
  const [userForm, setUserForm] = useState({
    email: "",
    vipLevel: 0,
    balance: 0,
    workDeposit: 0,
    banned: false,
    password: "",
  })

  const loadStats = useCallback(async () => {
    const res = await fetch("/api/admin/stats", { cache: "no-store" })
    if (res.status === 401) {
      router.push("/admin/login")
      return
    }
    setStats(await res.json())
  }, [router])

  const loadDeposits = useCallback(async (filter: OrderFilter) => {
    const res = await fetch(`/api/admin/deposits?status=${filter}`, { cache: "no-store" })
    const data = await res.json()
    setDeposits(data.deposits ?? [])
  }, [])

  const loadWithdrawals = useCallback(async (filter: OrderFilter) => {
    const res = await fetch(`/api/admin/withdrawals?status=${filter}`, { cache: "no-store" })
    const data = await res.json()
    setWithdrawals(data.withdrawals ?? [])
  }, [])

  const loadTasks = useCallback(async () => {
    const res = await fetch("/api/admin/tasks", { cache: "no-store" })
    const data = await res.json()
    setTasks(data.tasks ?? [])
  }, [])

  const refreshAll = useCallback(async () => {
    setLoading(true)
    await Promise.all([
      loadStats(),
      loadDeposits(depositFilter),
      loadWithdrawals(withdrawFilter),
      loadTasks(),
    ])
    setLoading(false)
  }, [loadStats, loadDeposits, loadWithdrawals, loadTasks, depositFilter, withdrawFilter])

  useEffect(() => {
    void refreshAll()
  }, [refreshAll])

  useEffect(() => {
    void loadDeposits(depositFilter)
  }, [depositFilter, loadDeposits])

  useEffect(() => {
    void loadWithdrawals(withdrawFilter)
  }, [withdrawFilter, loadWithdrawals])

  const handleLogout = async () => {
    await fetch("/api/admin/auth/logout", { method: "POST" })
    router.push("/admin/login")
    router.refresh()
  }

  const setDepositStatus = async (id: string, status: string) => {
    setActionLoading(`dep-${id}`)
    try {
      await fetch(`/api/admin/deposits/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      await loadDeposits(depositFilter)
      await loadStats()
    } finally {
      setActionLoading(null)
    }
  }

  const setWithdrawStatus = async (id: string, status: string) => {
    setActionLoading(`wd-${id}`)
    try {
      await fetch(`/api/admin/withdrawals/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      await loadWithdrawals(withdrawFilter)
      await loadStats()
    } finally {
      setActionLoading(null)
    }
  }

  const createTask = async (e: React.FormEvent) => {
    e.preventDefault()
    setActionLoading("create-task")
    try {
      await fetch("/api/admin/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTask),
      })
      setNewTask({ vipLevel: 1, title: "", content: "", link: "", sortOrder: 0 })
      await loadTasks()
    } finally {
      setActionLoading(null)
    }
  }

  const saveTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTask) return
    setActionLoading(`edit-${editingTask.id}`)
    try {
      await fetch(`/api/admin/tasks/${editingTask.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingTask),
      })
      setEditingTask(null)
      await loadTasks()
    } finally {
      setActionLoading(null)
    }
  }

  const deleteTask = async (id: string) => {
    if (!confirm("Delete this task?")) return
    setActionLoading(`del-${id}`)
    try {
      await fetch(`/api/admin/tasks/${id}`, { method: "DELETE" })
      await loadTasks()
    } finally {
      setActionLoading(null)
    }
  }

  const openEditUser = (user: AdminStats["users"][0]) => {
    setEditingUser(user)
    setUserForm({
      email: user.email,
      vipLevel: user.vipLevel,
      balance: user.balance,
      workDeposit: user.workDeposit,
      banned: user.banned,
      password: "",
    })
  }

  const saveUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return
    setActionLoading(`user-${editingUser.id}`)
    try {
      const body: Record<string, unknown> = {
        email: userForm.email,
        vipLevel: userForm.vipLevel,
        balance: userForm.balance,
        workDeposit: userForm.workDeposit,
        banned: userForm.banned,
      }
      if (userForm.password) body.password = userForm.password
      await fetch(`/api/admin/users/${editingUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      setEditingUser(null)
      await loadStats()
    } finally {
      setActionLoading(null)
    }
  }

  const deleteUser = async (id: string) => {
    if (!confirm("Permanently delete this user and all data?")) return
    setActionLoading(`del-user-${id}`)
    try {
      await fetch(`/api/admin/users/${id}`, { method: "DELETE" })
      setEditingUser(null)
      await loadStats()
    } finally {
      setActionLoading(null)
    }
  }

  const tabs: { id: AdminTab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "users", label: "Users" },
    { id: "deposits", label: `Deposits${stats ? ` (${stats.overview.pendingDeposits})` : ""}` },
    { id: "withdrawals", label: `Withdrawals${stats ? ` (${stats.overview.pendingWithdrawals})` : ""}` },
    { id: "tasks", label: "Tasks" },
  ]

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold text-foreground">NexEarn Admin</h1>
            <p className="text-xs text-muted-foreground">Site management dashboard</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => void refreshAll()} className="p-2 rounded-lg bg-secondary">
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary text-sm">
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
        <nav className="max-w-7xl mx-auto px-4 flex gap-1 overflow-x-auto pb-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
                tab === t.id ? "bg-gold text-primary-foreground" : "text-muted-foreground hover:bg-secondary"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {loading && !stats ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-gold animate-spin" />
          </div>
        ) : (
          <>
            {tab === "overview" && stats && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                  <StatCard icon={Users} label="Users" value={String(stats.overview.userCount)} />
                  <StatCard icon={Users} label="VIP members" value={String(stats.overview.vipUsersCount)} />
                  <StatCard icon={Ban} label="Banned" value={String(stats.overview.bannedCount)} />
                  <StatCard icon={ArrowDownLeft} label="Deposited" value={formatUsdt(stats.overview.totalDeposited)} />
                  <StatCard icon={ArrowUpRight} label="Withdrawn" value={formatUsdt(stats.overview.totalWithdrawn)} />
                  <StatCard icon={DollarSign} label="Net in platform" value={formatUsdt(stats.overview.netBalance)} />
                  <StatCard icon={Calendar} label="Next month payout" value={formatUsdt(stats.overview.nextMonthPayout)} />
                  <StatCard icon={ListTodo} label="Tasks today" value={String(stats.overview.tasksCompletedToday)} />
                  <StatCard icon={ListTodo} label="Task $ today" value={formatUsdt(stats.overview.taskEarningsToday)} />
                  <StatCard icon={DollarSign} label="Referral paid (month)" value={formatUsdt(stats.overview.referralPaidThisMonth)} />
                  <StatCard icon={DollarSign} label="Referral paid (all)" value={formatUsdt(stats.overview.totalReferralPaid)} />
                  <StatCard icon={ArrowDownLeft} label="Pending deposits" value={String(stats.overview.pendingDeposits)} />
                </div>
                <AdminOverviewCharts {...stats.charts} />
              </div>
            )}

            {tab === "users" && stats && (
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-left text-muted-foreground text-xs">
                        <th className="px-4 py-3">Email</th>
                        <th className="px-4 py-3">Plan</th>
                        <th className="px-4 py-3">Team</th>
                        <th className="px-4 py-3">Balance</th>
                        <th className="px-4 py-3">Tasks / Earned</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.users.map((u) => (
                        <tr key={u.id} className="border-b border-border/50 hover:bg-secondary/30">
                          <td className="px-4 py-3 font-medium">{u.email}</td>
                          <td className="px-4 py-3">{u.planName}</td>
                          <td className="px-4 py-3">{u.directReferrals}</td>
                          <td className="px-4 py-3">{formatUsdt(u.balance)}</td>
                          <td className="px-4 py-3">
                            {u.tasksToday} / {formatUsdt(u.earnedToday)}
                          </td>
                          <td className="px-4 py-3">
                            {u.banned ? (
                              <span className="text-xs font-semibold text-destructive-foreground">Banned</span>
                            ) : (
                              <span className="text-xs font-semibold text-green">Active</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => openEditUser(u)}
                              className="p-1.5 rounded-lg hover:bg-secondary"
                              title="Edit"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {tab === "deposits" && (
              <div className="space-y-3">
                <FilterBar value={depositFilter} onChange={setDepositFilter} />
                {deposits.map((d) => (
                  <OrderCard key={d.id}>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold">{d.user.email}</p>
                        <StatusBadge status={d.status} />
                      </div>
                      <p className="text-gold font-bold text-lg">{formatUsdt(d.amount)}</p>
                      <p className="text-xs text-muted-foreground break-all">From: {d.address}</p>
                      <p className="text-xs text-muted-foreground">{d.network} · {new Date(d.createdAt).toLocaleString()}</p>
                    </div>
                    <StatusSelect
                      value={d.status}
                      loading={actionLoading === `dep-${d.id}`}
                      onChange={(status) => setDepositStatus(d.id, status)}
                    />
                  </OrderCard>
                ))}
                {deposits.length === 0 && <EmptyOrders message="No deposit orders" />}
              </div>
            )}

            {tab === "withdrawals" && (
              <div className="space-y-3">
                <FilterBar value={withdrawFilter} onChange={setWithdrawFilter} />
                {withdrawals.map((w) => (
                  <OrderCard key={w.id}>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold">{w.user.email}</p>
                        <StatusBadge status={w.status} />
                      </div>
                      <p className="text-gold font-bold text-lg">{formatUsdt(w.amount)}</p>
                      <p className="text-xs text-muted-foreground break-all">To: {w.address}</p>
                      <p className="text-xs text-muted-foreground">
                        {w.network} · Fee {formatUsdt(w.fee)} · {new Date(w.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <StatusSelect
                      value={w.status}
                      loading={actionLoading === `wd-${w.id}`}
                      onChange={(status) => setWithdrawStatus(w.id, status)}
                    />
                  </OrderCard>
                ))}
                {withdrawals.length === 0 && <EmptyOrders message="No withdrawal orders" />}
              </div>
            )}

            {tab === "tasks" && (
              <div className="space-y-6">
                <form onSubmit={createTask} className="bg-card border border-border rounded-xl p-4 space-y-3">
                  <h3 className="font-semibold text-sm flex items-center gap-2">
                    <Plus className="w-4 h-4 text-gold" />
                    Add task
                  </h3>
                  <TaskFields task={newTask} onChange={(t) => setNewTask({ ...newTask, ...t })} />
                  <button type="submit" disabled={actionLoading === "create-task"} className="px-4 py-2 rounded-lg bg-gold text-primary-foreground text-sm font-bold">
                    Add task
                  </button>
                </form>

                {editingTask && (
                  <form onSubmit={saveTask} className="bg-gold/5 border border-gold/30 rounded-xl p-4 space-y-3">
                    <h3 className="font-semibold text-sm">Edit task</h3>
                    <TaskFields
                      task={editingTask}
                      onChange={(t) => setEditingTask({ ...editingTask, ...t })}
                      includeActive
                    />
                    <div className="flex gap-2">
                      <button type="submit" className="px-4 py-2 rounded-lg bg-gold text-primary-foreground text-sm font-bold">
                        Save
                      </button>
                      <button type="button" onClick={() => setEditingTask(null)} className="px-4 py-2 rounded-lg bg-secondary text-sm">
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                <div className="space-y-2">
                  {tasks.map((task) => (
                    <div key={task.id} className="bg-card border border-border rounded-xl p-4 flex gap-3">
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold text-gold bg-gold/10 px-2 py-0.5 rounded">
                          {vipPlans.find((p) => p.level === task.vipLevel)?.name}
                        </span>
                        <p className="font-semibold mt-1">{task.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">{task.content}</p>
                      </div>
                      <div className="flex flex-col gap-1 shrink-0">
                        <button onClick={() => setEditingTask(task)} className="p-2 rounded-lg hover:bg-secondary">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => deleteTask(task.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive-foreground">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-overlay">
          <form onSubmit={saveUser} className="bg-card border border-border rounded-2xl p-6 w-full max-w-md space-y-3 shadow-xl">
            <h3 className="font-bold">Edit user</h3>
            <input
              value={userForm.email}
              onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
              className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm"
              placeholder="Email"
            />
            <select
              value={userForm.vipLevel}
              onChange={(e) => setUserForm({ ...userForm, vipLevel: Number(e.target.value) })}
              className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm"
            >
              {vipPlans.map((p) => (
                <option key={p.level} value={p.level}>
                  {p.name}
                </option>
              ))}
            </select>
            <input
              type="number"
              step="0.01"
              value={userForm.balance}
              onChange={(e) => setUserForm({ ...userForm, balance: Number(e.target.value) })}
              className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm"
              placeholder="Balance"
            />
            <input
              type="number"
              step="0.01"
              value={userForm.workDeposit}
              onChange={(e) => setUserForm({ ...userForm, workDeposit: Number(e.target.value) })}
              className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm"
              placeholder="Work deposit"
            />
            <input
              type="password"
              value={userForm.password}
              onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
              className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm"
              placeholder="New password (optional)"
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={userForm.banned}
                onChange={(e) => setUserForm({ ...userForm, banned: e.target.checked })}
              />
              Banned / suspended
            </label>
            <div className="flex gap-2 pt-2">
              <button type="submit" className="flex-1 py-2 rounded-lg bg-gold text-primary-foreground font-bold text-sm">
                Save
              </button>
              <button
                type="button"
                onClick={() => deleteUser(editingUser.id)}
                className="px-3 py-2 rounded-lg bg-destructive/20 text-destructive-foreground text-sm font-semibold"
              >
                Delete
              </button>
              <button type="button" onClick={() => setEditingUser(null)} className="px-3 py-2 rounded-lg bg-secondary text-sm">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <Icon className="w-4 h-4 text-gold mb-2" />
      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className="text-base font-bold text-foreground mt-0.5 truncate">{value}</p>
    </div>
  )
}

function FilterBar({ value, onChange }: { value: OrderFilter; onChange: (v: OrderFilter) => void }) {
  const opts: OrderFilter[] = ["ALL", "PENDING", "APPROVED", "REJECTED"]
  return (
    <div className="flex gap-1 flex-wrap">
      {opts.map((o) => (
        <button
          key={o}
          onClick={() => onChange(o)}
          className={`px-3 py-1 rounded-lg text-xs font-semibold ${
            value === o ? "bg-gold text-primary-foreground" : "bg-secondary text-muted-foreground"
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${STATUS_STYLES[status] ?? "bg-secondary"}`}>
      {status}
    </span>
  )
}

function StatusSelect({
  value,
  onChange,
  loading,
}: {
  value: string
  onChange: (status: string) => void
  loading: boolean
}) {
  return (
    <div className="flex flex-col gap-2 shrink-0">
      <select
        value={value}
        disabled={loading}
        onChange={(e) => onChange(e.target.value)}
        className="bg-secondary border border-border rounded-lg px-3 py-2 text-xs font-semibold min-w-[120px]"
      >
        <option value="PENDING">PENDING</option>
        <option value="APPROVED">APPROVED</option>
        <option value="REJECTED">REJECTED</option>
      </select>
      {loading && <Loader2 className="w-4 h-4 animate-spin mx-auto text-gold" />}
    </div>
  )
}

function OrderCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4">
      {children}
    </div>
  )
}

function EmptyOrders({ message }: { message: string }) {
  return <p className="text-sm text-muted-foreground text-center py-8 bg-card border border-border rounded-xl">{message}</p>
}

function TaskFields({
  task,
  onChange,
  includeActive,
}: {
  task: { vipLevel: number; title: string; content: string; link: string; sortOrder: number; active?: boolean }
  onChange: (t: Partial<typeof task>) => void
  includeActive?: boolean
}) {
  return (
    <>
      <select
        value={task.vipLevel}
        onChange={(e) => onChange({ vipLevel: Number(e.target.value) })}
        className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm"
      >
        {vipPlans.map((p) => (
          <option key={p.level} value={p.level}>
            {p.name}
          </option>
        ))}
      </select>
      <input
        placeholder="Title"
        value={task.title}
        onChange={(e) => onChange({ title: e.target.value })}
        className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm"
      />
      <textarea
        placeholder="Content"
        value={task.content}
        onChange={(e) => onChange({ content: e.target.value })}
        rows={3}
        className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm resize-none"
      />
      <input
        placeholder="Link"
        value={task.link}
        onChange={(e) => onChange({ link: e.target.value })}
        className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm"
      />
      <input
        type="number"
        placeholder="Sort order"
        value={task.sortOrder}
        onChange={(e) => onChange({ sortOrder: Number(e.target.value) })}
        className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm"
      />
      {includeActive && (
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={task.active ?? true}
            onChange={(e) => onChange({ active: e.target.checked })}
          />
          Active
        </label>
      )}
    </>
  )
}
