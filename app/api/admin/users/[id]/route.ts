import { z } from "zod"
import { adminGuard } from "@/lib/admin-api"
import { deleteUserAdmin, updateUserAdmin } from "@/lib/services/users-admin"
import { handleApiError, jsonOk } from "@/lib/api-utils"

const updateSchema = z.object({
  email: z.string().email().optional(),
  vipLevel: z.number().int().min(0).max(10).optional(),
  balance: z.number().min(0).optional(),
  workDeposit: z.number().min(0).optional(),
  banned: z.boolean().optional(),
  password: z.string().min(6).optional(),
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
    const user = await updateUserAdmin(id, body)
    return jsonOk({ user })
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
    await deleteUserAdmin(id)
    return jsonOk({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}
