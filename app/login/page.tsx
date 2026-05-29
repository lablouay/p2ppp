import AuthPage from "@/components/auth/AuthPage"
import { Suspense } from "react"

export default function LoginPage() {
  return (
    <Suspense>
      <AuthPage mode="login" />
    </Suspense>
  )
}
