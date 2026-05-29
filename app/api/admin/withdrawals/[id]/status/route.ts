import { z } from "zod"
import { adminGuard } from "@/lib/admin-api"
import { setWithdrawalRequestStatus } from "@/lib/services/withdrawals"
import { handleApiError, jsonOk } from "@/lib/api-utils"

const schema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]),
})

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const denied = await adminGuard()
    if (denied) return denied
    const { id } = await params
    const { status } = schema.parse(await request.json())
    const withdrawal = await setWithdrawalRequestStatus(id, status)
    return jsonOk({ withdrawal })
  } catch (error) {
    return handleApiError(error)
  }
}
