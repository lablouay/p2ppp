import { adminGuard } from "@/lib/admin-api"
import { approveDepositRequest } from "@/lib/services/deposits"
import { handleApiError, jsonOk } from "@/lib/api-utils"

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const denied = await adminGuard()
    if (denied) return denied
    const { id } = await params
    const deposit = await approveDepositRequest(id)
    return jsonOk({ deposit })
  } catch (error) {
    return handleApiError(error)
  }
}
