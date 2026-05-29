import { startOfDay, format } from "date-fns"
import { prisma } from "@/lib/db"
import { vipPlans } from "@/lib/vip-data"
import { recordTaskWin } from "@/lib/services/financial"

export function todayKey(date = new Date()) {
  return format(startOfDay(date), "yyyy-MM-dd")
}

export function getTaskReward(vipLevel: number) {
  const plan = vipPlans.find((p) => p.level === vipLevel) ?? vipPlans[0]
  if (plan.tasksPerDay <= 0) return 0
  return Math.round((plan.dailySalary / plan.tasksPerDay) * 100) / 100
}

export async function listTasksForVipLevel(vipLevel: number) {
  return prisma.planTask.findMany({
    where: { vipLevel, active: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  })
}

export async function getUserTasksDashboard(userId: string, vipLevel: number) {
  const dayKey = todayKey()
  const plan = vipPlans.find((p) => p.level === vipLevel) ?? vipPlans[0]
  const tasks = await listTasksForVipLevel(vipLevel)
  const completions = await prisma.taskCompletion.findMany({
    where: { userId, dayKey },
    include: { task: true },
  })
  const completedIds = new Set(completions.map((c) => c.taskId))

  const taskItems = tasks.map((task) => ({
    id: task.id,
    title: task.title,
    content: task.content,
    link: task.link,
    completed: completedIds.has(task.id),
    earnAmount: getTaskReward(vipLevel),
  }))

  const completedToday = completions.length
  const earnedToday = completions.reduce((sum, c) => sum + c.earnAmount, 0)

  return {
    plan: {
      level: plan.level,
      name: plan.name,
      tasksPerDay: plan.tasksPerDay,
      dailySalary: plan.dailySalary,
    },
    tasks: taskItems,
    stats: {
      totalToday: Math.min(tasks.length, plan.tasksPerDay),
      completedToday,
      remainingToday: Math.max(0, Math.min(tasks.length, plan.tasksPerDay) - completedToday),
      earnedToday: Math.round(earnedToday * 100) / 100,
      rewardPerTask: getTaskReward(vipLevel),
    },
  }
}

export async function completeUserTask(userId: string, taskId: string, vipLevel: number) {
  const dayKey = todayKey()
  const plan = vipPlans.find((p) => p.level === vipLevel) ?? vipPlans[0]
  const task = await prisma.planTask.findFirst({
    where: { id: taskId, vipLevel, active: true },
  })
  if (!task) throw new Error("TASK_NOT_FOUND")

  const completionsToday = await prisma.taskCompletion.count({
    where: { userId, dayKey },
  })
  if (completionsToday >= plan.tasksPerDay) {
    throw new Error("DAILY_LIMIT_REACHED")
  }

  const existing = await prisma.taskCompletion.findUnique({
    where: { userId_taskId_dayKey: { userId, taskId, dayKey } },
  })
  if (existing) throw new Error("TASK_ALREADY_COMPLETED")

  const earnAmount = getTaskReward(vipLevel)

  await prisma.taskCompletion.create({
    data: { userId, taskId, dayKey, earnAmount },
  })

  if (earnAmount > 0) {
    await recordTaskWin(userId, earnAmount, vipLevel)
  } else {
    const { distributeDailyReferralCommissions } = await import("@/lib/services/referral")
    await distributeDailyReferralCommissions(userId, vipLevel)
  }

  return getUserTasksDashboard(userId, vipLevel)
}

export async function createPlanTask(data: {
  vipLevel: number
  title: string
  content: string
  link: string
  sortOrder?: number
}) {
  return prisma.planTask.create({
    data: {
      vipLevel: data.vipLevel,
      title: data.title,
      content: data.content,
      link: data.link,
      sortOrder: data.sortOrder ?? 0,
    },
  })
}

export async function updatePlanTask(
  id: string,
  data: Partial<{
    vipLevel: number
    title: string
    content: string
    link: string
    sortOrder: number
    active: boolean
  }>,
) {
  return prisma.planTask.update({ where: { id }, data })
}

export async function deletePlanTask(id: string) {
  return prisma.planTask.delete({ where: { id } })
}

export async function listAllPlanTasks() {
  return prisma.planTask.findMany({
    orderBy: [{ vipLevel: "asc" }, { sortOrder: "asc" }, { createdAt: "asc" }],
  })
}
