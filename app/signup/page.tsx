import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import * as z from "zod"
import { formResponse, signupFormSchema } from "@/components/forms/schemas"
import { SignupError } from "@/components/forms/error.types"

import { SignupForm } from "@/components/forms/signup"
import { userExists, users } from "@/lib/db"
import { sendOTP } from "@/lib/otp"

export default function SignupPage() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <div className="w-full max-w-sm">
        <SignupForm signup={signup} />
      </div>
    </main>
  )
}

async function signup(
  data: z.infer<typeof signupFormSchema>
): Promise<formResponse<SignupError>> {
  "use server"

  const parsed = await signupFormSchema.safeParseAsync(data)

  if (!parsed.success) {
    return { success: false, error: SignupError.VALIDATION_ERROR }
  }

  const validEmail = parsed.data.email.toLowerCase()

  if (await userExists(validEmail)) {
    return {
      success: false,
      error: SignupError.USER_EXISTS,
    }
  }

  if (
    !(
      await users.insertOne({
        email: validEmail,
        role: "user",
        username: parsed.data.username,
        verified: false,
        authn: [],
        createdAt: new Date(),
      })
    ).acknowledged
  ) {
    return {
      success: false,
      error: SignupError.INTERNAL_ERROR,
    }
  }

  const result = await sendOTP(validEmail)

  if (result !== "success") {
    return {
      success: false,
      error: SignupError.INTERNAL_ERROR,
    }
  }

  const cookieStore = await cookies()
  cookieStore.set("signup_email", validEmail, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 15,
    path: "/signup/verify",
  })

  redirect("/signup/verify", "replace")
}
