import { cookies, headers } from "next/headers"
import { redirect } from "next/navigation"

import * as z from "zod"
import { formResponse, signupFormSchema } from "@/components/forms/schemas"

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
): Promise<formResponse> {
  "use server"

  const parsed = await signupFormSchema.safeParseAsync(data)

  if (!parsed.success) {
    return { success: false, error: parsed.error.message }
  }

  const validEmail = parsed.data.email.toLowerCase()

  if (await userExists(validEmail)) {
    return {
      success: false,
      error: "Użytkownik o podanym adresie email już istnieje",
    }
  }

  await users.insertOne({
    email: validEmail,
    role: "user",
    username: parsed.data.username,
    verified: false,
    sessionTokens: [],
    authn: [],
    createdAt: new Date(),
  })

  const headerList = await headers()
  const forwardedFor = headerList.get("x-forwarded-for")
  const clientIp = forwardedFor
    ? forwardedFor.split(",")[0]
    : headerList.get("x-real-ip") || "127.0.0.1"

  try {
    await sendOTP(validEmail, clientIp)

    const cookieStore = await cookies()
    cookieStore.set("signup_email", validEmail, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 15,
      path: "/signup/verify",
    })
  } catch (error) {
    console.dir(error)
    return {
      success: false,
      error: "Wystąpił błąd podczas tworzenia użytkownika. Spróbuj ponownie później."
    }
  }
  redirect("/signup/verify", "replace")
}
