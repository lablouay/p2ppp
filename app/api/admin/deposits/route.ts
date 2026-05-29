import { adminGuard } from "@/lib/admin-api"
import { listDepositRequests } from "@/lib/services/deposits"
import { handleApiError, jsonOk } from "@/lib/api-utils"

export async function GET(request: Request) {
  try {
    const denied = await adminGuard()
    if (denied) return denied
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") ?? undefined
    const deposits = await listDepositRequests(status || undefined)
    return jsonOk({ deposits })
  } catch (error) {
    return handleApiError(error)
  }
}
