"use server"

import { cookies } from "next/headers"
import { users } from "./db"
import crypto from "node:crypto"
import { User } from "@/models/User"
import { ObjectId } from "mongodb"

export async function login(email: string) {
  const cookieStore = await cookies()

  const user = await users.findOne({ email })

  if (!user) {
    throw new Error("Użytkownik nie istnieje")
  }

  cookieStore.set("user_id", user._id.toString(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  })

  const sessionToken = crypto.randomUUID()
  cookieStore.set("session_token", sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  })

  users.updateOne(
    {
      _id: user._id,
    },
    {
      $addToSet: { sessionTokens: sessionToken },
    }
  )
}

export async function logout() {
  const cookieStore = await cookies()

  const userId = cookieStore.get("user_id")?.value
  const sessionToken = cookieStore.get("session_token")?.value

  if (userId && sessionToken) {
    users.updateOne(
      {
        _id: new ObjectId(userId),
      },
      {
        $pull: { sessionTokens: sessionToken },
      }
    )
  }

  cookieStore.delete("user_id")
  cookieStore.delete("session_token")
}

type CurrentUser = Pick<
  User,
  "email" | "username" | "role" | "verified" | "createdAt"
> & { id: string }

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const cookieStore = await cookies()

  if (!(await isAuthenticated())) return null

  const userId = cookieStore.get("user_id")?.value
  const sessionToken = cookieStore.get("session_token")?.value

  if (!userId || !sessionToken) {
    return null
  }

  const user = await users.findOne({ _id: new ObjectId(userId) })

  if (!user) {
    return null
  }

  return {
    id: user._id.toString(),
    email: user.email,
    username: user.username,
    role: user.role,
    verified: user.verified,
    createdAt: user.createdAt,
  }
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()

  const userId = cookieStore.get("user_id")?.value
  const sessionToken = cookieStore.get("session_token")?.value

  if (!userId || !sessionToken) {
    return false
  }

  const user = await users.findOne({ _id: new ObjectId(userId) })

  if (!user) {
    return false
  }

  return user.sessionTokens.includes(sessionToken)
}
