import { z } from "zod"
import { getSessionUser } from "@/lib/auth"
import { recordWithdrawal } from "@/lib/services/financial"
import { handleApiError, jsonOk, jsonError } from "@/lib/api-utils"

const withdrawSchema = z.object({
  amount: z.number().positive("Amount must be greater than 0"),
  address: z.string().min(10, "Invalid wallet address"),
  network: z.string().min(2),
  password: z.string().min(1, "Password is required"),
  fee: z.number().min(0).default(0),
})

export async function POST(request: Request) {
  try {
    const user = await getSessionUser()
    if (!user) return jsonError("Unauthorized", 401)

    const body = withdrawSchema.parse(await request.json())
    const bcrypt = await import("bcryptjs")
    const valid = await bcrypt.compare(body.password, user.passwordHash)
    if (!valid) throw new Error("INVALID_PASSWORD")

    const totalDebit = body.amount
    const withdrawal = await recordWithdrawal(user.id, {
      amount: totalDebit,
      address: body.address,
      network: body.network,
      fee: body.fee,
    })

    return jsonOk({ withdrawal })
  } catch (error) {
    return handleApiError(error)
  }
}
