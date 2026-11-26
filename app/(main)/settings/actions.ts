"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import * as z from "zod"

import { getCurrentUser } from "@/lib/auth"
import { posts, sessions, users } from "@/lib/db"
import { mongo } from "@/lib/mongo"
import { ObjectId } from "mongodb"

import crypto from "node:crypto"

export type SettingsActionState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string }

const profileSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Nazwa użytkownika musi mieć co najmniej 3 znaki.")
    .max(50, "Nazwa użytkownika może mieć maksymalnie 50 znaków."),
  avatar: z
    .string()
    .trim()
    .max(2048, "Adres avatara jest zbyt długi.")
    .refine((value) => {
      if (!value) return true

      try {
        const url = new URL(value)
        return url.protocol === "https:" || url.protocol === "http:"
      } catch {
        return false
      }
    }, "Podaj poprawny adres URL zaczynający się od http:// lub https://."),
})

const passkeyNameSchema = z
  .string()
  .trim()
  .min(1, "Nazwa klucza jest wymagana.")
  .max(80, "Nazwa klucza może mieć maksymalnie 80 znaków.")

const passkeyIdSchema = z.string().min(1)

export async function updateProfile(
  _previousState: SettingsActionState,
  formData: FormData
): Promise<SettingsActionState> {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    return { status: "error", message: "Sesja wygasła. Zaloguj się ponownie." }
  }

  const parsed = profileSchema.safeParse({
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
  formData: FormData
): Promise<SettingsActionState> {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    return { status: "error", message: "Sesja wygasła. Zaloguj się ponownie." }
  }

  if (formData.get("confirmation") !== "USUŃ") {
    return {
      status: "error",
      message: "Wpisz USUŃ, aby potwierdzić trwałe usunięcie konta.",
    }
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
