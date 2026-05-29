import { adminGuard } from "@/lib/admin-api"
import { listWithdrawalRequests } from "@/lib/services/withdrawals"
import { handleApiError, jsonOk } from "@/lib/api-utils"

export async function GET(request: Request) {
  try {
    const denied = await adminGuard()
    if (denied) return denied
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") ?? undefined
    const withdrawals = await listWithdrawalRequests(status || undefined)
    return jsonOk({ withdrawals })
  } catch (error) {
    return handleApiError(error)
  }
}
