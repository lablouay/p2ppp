import { z } from "zod"
import { adminGuard } from "@/lib/admin-api"
import { deletePlanTask, updatePlanTask } from "@/lib/services/tasks"
import { handleApiError, jsonOk } from "@/lib/api-utils"

const updateSchema = z.object({
  vipLevel: z.number().int().min(0).max(10).optional(),
  title: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  link: z.string().min(1).optional(),
  sortOrder: z.number().int().optional(),
  active: z.boolean().optional(),
})

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const denied = await adminGuard()
    if (denied) return denied
    const { id } = await params
    const body = updateSchema.parse(await request.json())
    const task = await updatePlanTask(id, body)
    return jsonOk({ task })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const denied = await adminGuard()
    if (denied) return denied
    const { id } = await params
    await deletePlanTask(id)
    return jsonOk({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}
