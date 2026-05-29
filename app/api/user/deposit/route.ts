import { z } from "zod"
import { getSessionUser } from "@/lib/auth"
import { createDepositRequest } from "@/lib/services/deposits"
import { handleApiError, jsonOk, jsonError } from "@/lib/api-utils"

const depositSchema = z.object({
  amount: z.number().positive("Amount must be greater than 0"),
  address: z.string().min(10, "Wallet address is required"),
  network: z.string().min(2),
})

export async function POST(request: Request) {
  try {
    const user = await getSessionUser()
    if (!user) return jsonError("Unauthorized", 401)

    const body = depositSchema.parse(await request.json())
    const deposit = await createDepositRequest(user.id, body)

    return jsonOk({
      deposit: {
        id: deposit.id,
        amount: deposit.amount,
        status: deposit.status,
        createdAt: deposit.createdAt.toISOString(),
      },
      message: "Deposit submitted for admin review",
    })
  } catch (error) {
    return handleApiError(error)
  }
}
