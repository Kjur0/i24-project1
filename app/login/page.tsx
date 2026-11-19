import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import * as z from "zod"
import { formResponse, loginFormSchema } from "@/components/forms/schemas"
import { LoginError } from "@/components/forms/error.types"

import { LoginForm } from "@/components/forms/login"
import { isAuthenticated } from "@/lib/auth"
import { userExists } from "@/lib/db"
import { sendOTP } from "@/lib/otp"

export default async function LoginPage() {
  if (await isAuthenticated()) redirect("/dashboard", "replace")

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm login={login} />
      </div>
    </main>
  )
}

async function login(
  data: z.infer<typeof loginFormSchema>
): Promise<formResponse<LoginError>> {
  "use server"

  const parsed = await loginFormSchema.safeParseAsync(data)

  if (!parsed.success) {
    return { success: false, error: LoginError.VALIDATION_ERROR }
  }

  const validEmail = parsed.data.email.toLowerCase()

  if (!(await userExists(validEmail))) {
    return {
      success: false,
      error: LoginError.USER_NOT_FOUND,
    }
  }

  const result = await sendOTP(validEmail)

  if (result !== "success") {
    throw new Error("Failed to send login OTP")
  }

  const cookieStore = await cookies()
  cookieStore.set("login_email", validEmail, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 15,
    path: "/login/verify",
  })

  redirect("/login/verify", "replace")
}
