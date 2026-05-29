import { getSessionUser } from "@/lib/auth"
import { completeUserTask } from "@/lib/services/tasks"
import { handleApiError, jsonOk, jsonError } from "@/lib/api-utils"

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getSessionUser()
    if (!user) return jsonError("Unauthorized", 401)

    const { id } = await params
    const dashboard = await completeUserTask(user.id, id, user.vipLevel)
    return jsonOk(dashboard)
  } catch (error) {
    return handleApiError(error)
  }
}
