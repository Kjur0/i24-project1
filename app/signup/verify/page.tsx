import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import * as z from "zod"
import { formResponse, otpFormSchema } from "@/components/forms/schemas"
import { OTPError } from "@/components/forms/error.types"

import { OTPForm } from "@/components/forms/otp"
import { login } from "@/lib/auth"
import { users } from "@/lib/db"
import { verifyOTP } from "@/lib/otp"

export default async function VerifyPage() {
  const cookieStore = await cookies()
  const email = cookieStore.get("signup_email")?.value

  if (!email) {
    redirect("/signup")
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
): Promise<formResponse<OTPError>> {
  "use server"

  const parsed = otpFormSchema.safeParse(data)

  if (!parsed.success) {
    return { success: false, error: OTPError.VALIDATION_ERROR }
  }

  const cookieStore = await cookies()
  const email = cookieStore.get("signup_email")?.value

  if (!email) {
    redirect("/signup", "replace")
  }

  const result = await verifyOTP(email, parsed.data.otp)

  switch (result) {
    case "success":
      cookieStore.delete("signup_email")
      const updateResult = await users.updateOne(
        { email },
        {
          $set: { verified: true },
        }
      )
      if (!updateResult.acknowledged || updateResult.matchedCount !== 1) {
        throw new Error("Failed to verify signup user")
      }
      await login(email)
      redirect("/authn", "replace")
    case "invalid_otp":
      return { success: false, error: OTPError.INVALID_OTP }
    case "max_attempts":
      return { success: false, error: OTPError.MAX_ATTEMPTS }
    case "user_not_found":
      return { success: false, error: OTPError.USER_NOT_FOUND }
    case "db_error":
      throw new Error("Failed to verify signup OTP")
    default:
      throw new Error("Unknown signup OTP verification result")
  }
}
