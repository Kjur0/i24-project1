"use server"

import { revalidatePath } from "next/cache"

import * as z from "zod"
import {
  emailAddressSchema,
  profileSettingsSchema,
} from "@/components/settings/schemas"

import { getCurrentUser } from "@/lib/auth"
import { posts, sessions, users } from "@/lib/db"
import { mongo } from "@/lib/mongo"
import { sendOTP } from "@/lib/otp"
import { ObjectId } from "mongodb"

export type ManagementActionState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string }

const roleSchema = z.enum(["user", "moderator", "admin"])

function isValidUserId(userId: string) {
  return /^[\da-f]{24}$/i.test(userId)
}

function revalidateUserPages(userId: string) {
  revalidatePath("/admin")
  revalidatePath("/dashboard")
  revalidatePath(`/dashboard/${userId}`)
  revalidatePath(`/profile/${userId}`)
  revalidatePath("/", "layout")
}

export async function updateManagedUser(
  userId: string,
  _previousState: ManagementActionState,
  formData: FormData
): Promise<ManagementActionState> {
  const currentUser = await getCurrentUser()

  if (!currentUser || !["admin", "moderator"].includes(currentUser.role)) {
    return {
      status: "error",
      message: "Brak uprawnień do edycji użytkowników.",
    }
  }

  if (!isValidUserId(userId)) {
    return { status: "error", message: "Nie znaleziono użytkownika." }
  }

  const userIdObject = new ObjectId(userId)
  const target = await users.findOne({ _id: userIdObject })

  if (!target) {
    return { status: "error", message: "Nie znaleziono użytkownika." }
  }

  const isAdmin = currentUser.role === "admin"
  if (!isAdmin && target.role === "admin") {
    return {
      status: "error",
      message: "Moderatorzy nie mogą edytować administratorów.",
    }
  }

  const profile = profileSettingsSchema.safeParse({
    username: formData.get("username"),
    avatar: formData.get("avatar"),
  })

  if (!profile.success) {
    return {
      status: "error",
      message:
        profile.error.issues[0]?.message ?? "Nieprawidłowe dane profilu.",
    }
  }

  const fields: {
    username: string
    avatar?: string
    email?: string
    role?: "user" | "moderator" | "admin"
    verified?: boolean
    authn?: typeof target.authn
  } = {
    username: profile.data.username,
    ...(profile.data.avatar ? { avatar: profile.data.avatar } : {}),
  }

  const shouldClearAvatar = !profile.data.avatar
  const shouldClearPasskeys = isAdmin && formData.get("clearPasskeys") === "on"
  const shouldClearSessions = isAdmin && formData.get("clearSessions") === "on"
  const unsetFields: Record<string, ""> = {}
  if (shouldClearAvatar) unsetFields.avatar = ""

  if (isAdmin) {
    const emailResult = emailAddressSchema.safeParse(formData.get("email"))
    const roleResult = roleSchema.safeParse(formData.get("role"))
    const verifiedValue = formData.get("verified")

    if (
      !emailResult.success ||
      !roleResult.success ||
      (verifiedValue !== "true" && verifiedValue !== "false")
    ) {
      return { status: "error", message: "Nieprawidłowe dane administracyjne." }
    }

    const email = emailResult.data.toLowerCase()
    const duplicateEmail = await users.findOne(
      { email, _id: { $ne: userIdObject } },
      { projection: { _id: 1 } }
    )

    if (duplicateEmail) {
      return { status: "error", message: "Ten adres e-mail jest już używany." }
    }

    if (userIdObject.equals(new ObjectId(currentUser.id))) {
      if (roleResult.data !== target.role) {
        return {
          status: "error",
          message: "Nie możesz zmienić własnej roli administratora.",
        }
      }
      if (shouldClearPasskeys || shouldClearSessions) {
        return {
          status: "error",
          message: "Nie możesz usunąć własnych kluczy dostępu ani sesji.",
        }
      }
    }

    if (target.role === "admin" && roleResult.data !== "admin") {
      const adminCount = await users.countDocuments({ role: "admin" })
      if (adminCount <= 1) {
        return {
          status: "error",
          message: "Nie można usunąć roli ostatniego administratora.",
        }
      }
    }

    fields.email = email
    fields.role = roleResult.data
    fields.verified = verifiedValue === "true"
    if (shouldClearPasskeys) fields.authn = []
    if (fields.email !== target.email) {
      unsetFields.otp = ""
      unsetFields.pendingEmail = ""
    }
  }

  const updateResult = await users.updateOne(
    { _id: userIdObject },
    {
      $set: fields,
      ...(Object.keys(unsetFields).length > 0 ? { $unset: unsetFields } : {}),
    }
  )

  if (updateResult.matchedCount !== 1) {
    return {
      status: "error",
      message: "Nie udało się zaktualizować użytkownika.",
    }
  }

  if (shouldClearSessions) {
    await sessions.deleteMany({ user: userIdObject })
  }

  revalidateUserPages(userId)
  return { status: "success", message: "Zapisano zmiany użytkownika." }
}

export async function sendUserOTP(
  userId: string,
  _previousState: ManagementActionState
): Promise<ManagementActionState> {
  void _previousState
  const currentUser = await getCurrentUser()

  if (!currentUser || currentUser.role !== "admin") {
    return {
      status: "error",
      message: "Tylko administrator może wysłać kod OTP.",
    }
  }

  if (!isValidUserId(userId)) {
    return { status: "error", message: "Nie znaleziono użytkownika." }
  }

  const target = await users.findOne(
    { _id: new ObjectId(userId) },
    { projection: { email: 1 } }
  )
  if (!target) {
    return { status: "error", message: "Nie znaleziono użytkownika." }
  }

  const result = await sendOTP(target.email)
  if (result !== "success") {
    return { status: "error", message: "Nie udało się wygenerować kodu OTP." }
  }

  revalidatePath(`/dashboard/${userId}`)
  return { status: "success", message: "Kod OTP wygenerowano." }
}

export async function deleteManagedUser(
  userId: string,
  _previousState: ManagementActionState
): Promise<ManagementActionState> {
  void _previousState
  const currentUser = await getCurrentUser()

  if (!currentUser || currentUser.role !== "admin") {
    return {
      status: "error",
      message: "Tylko administrator może usuwać konta.",
    }
  }

  if (!isValidUserId(userId)) {
    return { status: "error", message: "Nie znaleziono użytkownika." }
  }

  const userIdObject = new ObjectId(userId)
  if (userIdObject.equals(new ObjectId(currentUser.id))) {
    return {
      status: "error",
      message: "Nie możesz usunąć własnego konta z panelu administracji.",
    }
  }

  const transaction = mongo.startSession()

  try {
    await transaction.withTransaction(async () => {
      const target = await users.findOne(
        { _id: userIdObject },
        { session: transaction, projection: { role: 1 } }
      )

      if (!target) {
        throw new Error("Nie znaleziono użytkownika.")
      }

      if (target.role === "admin") {
        const adminCount = await users.countDocuments(
          { role: "admin" },
          { session: transaction }
        )
        if (adminCount <= 1) {
          throw new Error("Nie można usunąć ostatniego administratora.")
        }
      }

      await posts.updateMany(
        { author: { $ne: userIdObject }, "comments.author": userIdObject },
        { $pull: { comments: { author: userIdObject } } },
        { session: transaction }
      )
      await posts.deleteMany({ author: userIdObject }, { session: transaction })
      await sessions.deleteMany(
        { user: userIdObject },
        { session: transaction }
      )

      const result = await users.deleteOne(
        { _id: userIdObject },
        { session: transaction }
      )
      if (result.deletedCount !== 1) {
        throw new Error("Nie udało się usunąć konta użytkownika.")
      }
    })
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message === "Nie znaleziono użytkownika." ||
        error.message === "Nie można usunąć ostatniego administratora.")
    ) {
      return { status: "error", message: error.message }
    }
    throw error
  } finally {
    await transaction.endSession()
  }

  revalidateUserPages(userId)
  return { status: "success", message: "Konto użytkownika zostało usunięte." }
}
