import { z } from "zod"
import { adminGuard } from "@/lib/admin-api"
import { createPlanTask, listAllPlanTasks } from "@/lib/services/tasks"
import { handleApiError, jsonOk } from "@/lib/api-utils"

const createSchema = z.object({
  vipLevel: z.number().int().min(0).max(10),
  title: z.string().min(1),
  content: z.string().min(1),
  link: z.string().min(1),
  sortOrder: z.number().int().optional(),
})

export async function GET() {
  try {
    const denied = await adminGuard()
    if (denied) return denied
    const tasks = await listAllPlanTasks()
    return jsonOk({ tasks })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: Request) {
  try {
    const denied = await adminGuard()
    if (denied) return denied
    const body = createSchema.parse(await request.json())
    const task = await createPlanTask(body)
    return jsonOk({ task })
  } catch (error) {
    return handleApiError(error)
  }
}
