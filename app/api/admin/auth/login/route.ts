import { z } from "zod"
import { NextResponse } from "next/server"
import {
  attachAdminCookie,
  createAdminToken,
  verifyAdminLogin,
} from "@/lib/admin-auth"
import { handleApiError, jsonError } from "@/lib/api-utils"

const schema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
})

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json())
    if (!verifyAdminLogin(body.username, body.password)) {
      return jsonError("Invalid admin credentials", 401)
    }
    const token = await createAdminToken()
    const response = NextResponse.json({ success: true })
    return attachAdminCookie(response, token)
  } catch (error) {
    return handleApiError(error)
  }
}
