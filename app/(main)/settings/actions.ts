"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import * as z from "zod"
import { otpFormSchema } from "@/components/forms/schemas"
import {
  emailAddressSchema,
  passkeyNameSchema,
  profileSettingsSchema,
} from "@/components/settings/schemas"

import { getCurrentUser } from "@/lib/auth"
import { posts, sessions, users } from "@/lib/db"
import { mongo } from "@/lib/mongo"
import { sendOTP, verifyOTP } from "@/lib/otp"
import { ObjectId } from "mongodb"

import crypto from "node:crypto"

export type SettingsActionState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string }

export type EmailChangeActionState =
  | { status: "idle" }
  | { status: "code_sent"; currentEmail: string; email: string }
  | {
      status: "request_error"
      currentEmail: string
      email: string
      message: string
    }
  | {
      status: "verification_error"
      currentEmail: string
      email: string
      message: string
    }
  | { status: "success"; email: string; message: string }

const passkeyIdSchema = z.string().min(1)

export async function updateProfile(
  _previousState: SettingsActionState,
  formData: FormData
): Promise<SettingsActionState> {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    return { status: "error", message: "Sesja wygasła. Zaloguj się ponownie." }
  }

  const parsed = profileSettingsSchema.safeParse({
    username: formData.get("username"),
    avatar: formData.get("avatar"),
  })

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Nieprawidłowe dane profilu.",
    }
  }

  const { username, avatar } = parsed.data
  const update = await users.updateOne(
    { _id: new ObjectId(currentUser.id) },
    avatar
      ? { $set: { username, avatar } }
      : { $set: { username }, $unset: { avatar: "" } }
  )

  if (update.matchedCount !== 1) {
    return { status: "error", message: "Nie znaleziono konta użytkownika." }
  }

  revalidatePath("/", "layout")
  return { status: "success", message: "Zapisano zmiany profilu." }
}

export async function deleteAccount(
  _previousState: SettingsActionState,
  _formData: FormData
): Promise<SettingsActionState> {
  void _previousState
  void _formData
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    return { status: "error", message: "Sesja wygasła. Zaloguj się ponownie." }
  }

  const userId = new ObjectId(currentUser.id)
  const transaction = mongo.startSession()

  try {
    await transaction.withTransaction(async () => {
      await posts.updateMany(
        { author: { $ne: userId }, "comments.author": userId },
        { $pull: { comments: { author: userId } } },
        { session: transaction }
      )
      await posts.deleteMany({ author: userId }, { session: transaction })
      await sessions.deleteMany({ user: userId }, { session: transaction })

      const deletedUser = await users.deleteOne(
        { _id: userId },
        { session: transaction }
      )

      if (deletedUser.deletedCount !== 1) {
        throw new Error("Nie udało się usunąć konta użytkownika.")
      }
    })
  } finally {
    await transaction.endSession()
  }

  const cookieStore = await cookies()
  cookieStore.delete("session_token")
  redirect("/", "replace")
}

export async function changeEmail(
  _previousState: EmailChangeActionState,
  formData: FormData
): Promise<EmailChangeActionState> {
  const currentUser = await getCurrentUser()
  const step = formData.get("step")
  const rawEmail = formData.get("email")
  const submittedEmail = typeof rawEmail === "string" ? rawEmail.trim() : ""

  if (!currentUser) {
    return {
      status: "request_error",
      currentEmail: "",
      email: submittedEmail,
      message: "Sesja wygasła. Zaloguj się ponownie.",
    }
  }

  const userId = new ObjectId(currentUser.id)
  const currentEmail = currentUser.email

  if (step === "request") {
    const parsedEmail = emailAddressSchema.safeParse(submittedEmail)

    if (!parsedEmail.success) {
      return {
        status: "request_error",
        currentEmail,
        email: submittedEmail,
        message:
          parsedEmail.error.issues[0]?.message ??
          "Podaj poprawny adres e-mail.",
      }
    }

    const email = parsedEmail.data.toLowerCase()

    if (email === currentEmail.toLowerCase()) {
      return {
        status: "request_error",
        currentEmail,
        email,
        message: "Ten adres e-mail jest już przypisany do konta.",
      }
    }

    const existingUser = await users.findOne(
      { email, _id: { $ne: userId } },
      { projection: { _id: 1 } }
    )

    if (existingUser) {
      return {
        status: "request_error",
        currentEmail,
        email,
        message: "Ten adres e-mail jest już używany.",
      }
    }

    const result = await sendOTP(email, "email-change")

    if (result !== "success") {
      return {
        status: "request_error",
        currentEmail,
        email,
        message:
          result === "user_not_found"
            ? "Sesja wygasła. Zaloguj się ponownie."
            : "Nie udało się wygenerować kodu weryfikacyjnego.",
      }
    }

    return { status: "code_sent", currentEmail, email }
  }

  if (step === "verify") {
    const parsedEmail = emailAddressSchema.safeParse(submittedEmail)
    const parsedOTP = otpFormSchema.safeParse({
      otp: formData.get("otp"),
    })

    if (!parsedEmail.success || !parsedOTP.success) {
      return {
        status: "verification_error",
        currentEmail,
        email: submittedEmail,
        message: "Podaj poprawny adres e-mail i ośmioznakowy kod.",
      }
    }

    const email = parsedEmail.data.toLowerCase()
    const existingUser = await users.findOne(
      { email, _id: { $ne: userId } },
      { projection: { _id: 1 } }
    )

    if (existingUser) {
      return {
        status: "verification_error",
        currentEmail,
        email,
        message: "Ten adres e-mail jest już używany.",
      }
    }

    const verification = await verifyOTP(
      email,
      parsedOTP.data.otp,
      "email-change"
    )

    switch (verification) {
      case "success": {
        const update = await users.updateOne(
          {
            _id: userId,
            pendingEmail: email,
            otp: { $exists: false },
          },
          {
            $set: { email, verified: true },
            $unset: { pendingEmail: "" },
          }
        )

        if (!update.acknowledged || update.matchedCount !== 1) {
          return {
            status: "verification_error",
            currentEmail,
            email,
            message:
              "Nie udało się zaktualizować adresu. Poproś o nowy kod i spróbuj ponownie.",
          }
        }

        revalidatePath("/", "layout")
        revalidatePath("/settings/login")
        return {
          status: "success",
          email,
          message: "Adres e-mail został zaktualizowany.",
        }
      }
      case "invalid_otp":
        return {
          status: "verification_error",
          currentEmail,
          email,
          message: "Nieprawidłowy kod weryfikacyjny.",
        }
      case "max_attempts":
        return {
          status: "verification_error",
          currentEmail,
          email,
          message: "Przekroczono limit prób. Poproś o nowy kod.",
        }
      case "user_not_found":
        return {
          status: "verification_error",
          currentEmail,
          email,
          message: "Nie znaleziono aktywnego kodu dla tego adresu.",
        }
      case "db_error":
        return {
          status: "verification_error",
          currentEmail,
          email,
          message: "Nie udało się zweryfikować kodu. Spróbuj ponownie.",
        }
      default:
        throw new Error("Unknown email change OTP verification result")
    }
  }

  return {
    status: "request_error",
    currentEmail,
    email: submittedEmail,
    message: "Nieprawidłowe żądanie zmiany adresu e-mail.",
  }
}

export async function renamePasskey(
  credentialId: string,
  _previousState: SettingsActionState,
  formData: FormData
): Promise<SettingsActionState> {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    return { status: "error", message: "Sesja wygasła. Zaloguj się ponownie." }
  }

  const parsedId = passkeyIdSchema.safeParse(credentialId)
  if (!parsedId.success) {
    return { status: "error", message: "Nieprawidłowy klucz dostępu." }
  }

  const parsedName = passkeyNameSchema.safeParse(formData.get("name"))
  if (!parsedName.success) {
    return {
      status: "error",
      message:
        parsedName.error.issues[0]?.message ?? "Nieprawidłowa nazwa klucza.",
    }
  }

  const result = await users.updateOne(
    {
      _id: new ObjectId(currentUser.id),
      "authn.id": parsedId.data,
    },
    { $set: { "authn.$.name": parsedName.data } }
  )

  if (result.matchedCount !== 1) {
    return { status: "error", message: "Nie znaleziono tego klucza dostępu." }
  }

  revalidatePath("/settings/login")
  return { status: "success", message: "Zmieniono nazwę klucza." }
}

export async function removePasskey(
  credentialId: string,
  _previousState: SettingsActionState
): Promise<SettingsActionState> {
  void _previousState
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    return { status: "error", message: "Sesja wygasła. Zaloguj się ponownie." }
  }

  const parsedId = passkeyIdSchema.safeParse(credentialId)
  if (!parsedId.success) {
    return { status: "error", message: "Nieprawidłowy klucz dostępu." }
  }

  const result = await users.updateOne(
    { _id: new ObjectId(currentUser.id), "authn.id": parsedId.data },
    { $pull: { authn: { id: parsedId.data } } }
  )

  if (result.modifiedCount !== 1) {
    return { status: "error", message: "Nie znaleziono tego klucza dostępu." }
  }

  revalidatePath("/settings/login")
  return { status: "success", message: "Usunięto klucz dostępu." }
}

export async function revokeSession(
  sessionId: string,
  _previousState: SettingsActionState
): Promise<SettingsActionState> {
  void _previousState
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    return { status: "error", message: "Sesja wygasła. Zaloguj się ponownie." }
  }

  if (!ObjectId.isValid(sessionId)) {
    return { status: "error", message: "Nieprawidłowa sesja." }
  }

  const cookieStore = await cookies()
  const currentToken = cookieStore.get("session_token")?.value
  const currentTokenHash = currentToken
    ? crypto.createHash("sha256").update(currentToken).digest("hex")
    : undefined
  const targetSession = await sessions.findOne({
    _id: new ObjectId(sessionId),
    user: new ObjectId(currentUser.id),
  })

  if (!targetSession) {
    return { status: "error", message: "Nie znaleziono tej sesji." }
  }

  await sessions.deleteOne({
    _id: targetSession._id,
    user: new ObjectId(currentUser.id),
  })

  if (currentTokenHash && targetSession.token === currentTokenHash) {
    cookieStore.delete("session_token")
    redirect("/login", "replace")
  }

  revalidatePath("/settings/login")
  return { status: "success", message: "Zakończono sesję." }
}
