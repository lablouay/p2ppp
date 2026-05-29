import { NextResponse } from "next/server"
import { clearAdminCookie } from "@/lib/admin-auth"

export async function POST() {
  const response = NextResponse.json({ success: true })
  return clearAdminCookie(response)
}
