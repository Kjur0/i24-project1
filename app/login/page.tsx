import { cookies, headers } from "next/headers"
import { redirect } from "next/navigation"

import * as z from "zod"
import { formResponse, loginFormSchema } from "@/components/forms/schemas"

import { LoginForm } from "@/components/forms/login"
import { userExists } from "@/lib/db"
import { sendOTP } from "@/lib/otp"

export default function LoginPage() {
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
): Promise<formResponse> {
  "use server"

  const parsed = await loginFormSchema.safeParseAsync(data)

  if (!parsed.success) {
    return { success: false, error: parsed.error.message }
  }

  const validEmail = parsed.data.email.toLowerCase()

  if (!(await userExists(validEmail))) {
    return {
      success: false,
      error: "Nie znaleziono użytkownika o podanym adresie email",
    }
  }

  const headerList = await headers()
  const forwardedFor = headerList.get("x-forwarded-for")
  const clientIp = forwardedFor
    ? forwardedFor.split(",")[0]
    : headerList.get("x-real-ip") || "127.0.0.1"

  try {
    await sendOTP(validEmail, clientIp)

    const cookieStore = await cookies()
    cookieStore.set("login_email", validEmail, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 15,
      path: "/login/verify",
    })
  } catch (error) {
    console.dir(error)
    return {
      success: false,
      error: "Wystąpił błąd podczas logowania. Spróbuj ponownie później.",
    }
  }
  redirect("/login/verify", "replace")
}
