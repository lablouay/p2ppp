import { isAdminAuthenticated } from "@/lib/admin-auth"
import { jsonError } from "@/lib/api-utils"

export async function requireAdmin() {
  const ok = await isAdminAuthenticated()
  if (!ok) throw new Error("UNAUTHORIZED")
}

export async function adminGuard() {
  try {
    await requireAdmin()
    return null
  } catch {
    return jsonError("Unauthorized", 401)
  }
}
