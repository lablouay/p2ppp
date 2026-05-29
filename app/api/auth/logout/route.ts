import { clearSessionOnResponse } from "@/lib/auth"
import { jsonOk } from "@/lib/api-utils"
import { NextResponse } from "next/server"

export async function POST() {
  const response = NextResponse.json({ success: true })
  return clearSessionOnResponse(response)
}
