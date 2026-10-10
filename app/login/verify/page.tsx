import { cookies, headers } from "next/headers"
import { redirect } from "next/navigation"

import * as z from "zod"
import { formResponse, otpFormSchema } from "@/components/forms/schemas"

import { OTPForm } from "@/components/forms/otp"
import { login } from "@/lib/auth"
import { users } from "@/lib/db"
import { verifyOTP } from "@/lib/otp"

export default async function VerifyPage() {
  const cookieStore = await cookies()
  const email = cookieStore.get("login_email")?.value

  if (!email) {
    redirect("/login")
  }

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <div className="w-full max-w-sm">
        <OTPForm email={email} verify={verify} />
      </div>
    </main>
  )
}

async function verify(
  data: z.infer<typeof otpFormSchema>
): Promise<formResponse> {
  "use server"

  const parsed = otpFormSchema.safeParse(data)

  if (!parsed.success) {
    return { success: false, error: parsed.error.message }
  }

  const cookieStore = await cookies()
  const email = cookieStore.get("login_email")!.value

  const headerList = await headers()
  const forwardedFor = headerList.get("x-forwarded-for")
  const clientIp = forwardedFor
    ? forwardedFor.split(",")[0]
    : headerList.get("x-real-ip") || "127.0.0.1"

  const result = await verifyOTP(email!, parsed.data.otp, clientIp)

  switch (result) {
    case "success":
      cookieStore.delete("login_email")
      await users.updateOne(
        { email },
        {
          $set: { verified: true },
        }
      )
      await login(email)
      if ((await users.findOne({ email }))?.authn.length == 0) {
        // redirect("/login/authn", "replace")
      }
      redirect("/dashboard", "replace")
    case "invalid_otp":
      return { success: false, error: "Nieprawidłowy kod logowania" }
    case "max_attempts":
      return {
        success: false,
        error:
          "Przekroczono maksymalną liczbę prób. Wygeneruj nowy kod logowania",
      }
    case "user_not_found":
      return {
        success: false,
        error: "Nie znaleziono użytkownika o podanym adresie email",
      }
    default:
      return {
        success: false,
        error: "Wystąpił nieznany błąd podczas weryfikacji",
      }
  }
}
