import { adminGuard } from "@/lib/admin-api"
import { rejectWithdrawalRequest } from "@/lib/services/withdrawals"
import { handleApiError, jsonOk } from "@/lib/api-utils"

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const denied = await adminGuard()
    if (denied) return denied
    const { id } = await params
    const withdrawal = await rejectWithdrawalRequest(id)
    return jsonOk({ withdrawal })
  } catch (error) {
    return handleApiError(error)
  }
}
