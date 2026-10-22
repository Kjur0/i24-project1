"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { currentUser } from "@/types/user"

import { getUserByEmail, getUserById, sessions } from "@/lib/db"

import crypto from "node:crypto"

export async function login(email: string) {
  const cookieStore = await cookies()

  const user = await getUserByEmail(email)

  if (!user) {
    throw new Error("Użytkownik nie istnieje")
  }

  const sessionToken = crypto.randomBytes(32).toString("base64url")
  const tokenHash = crypto
    .createHash("sha256")
    .update(sessionToken)
    .digest("hex")

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  await sessions.insertOne({
    user: user._id,
    token: tokenHash,
    createdAt: new Date(),
    expiresAt,
  })

  cookieStore.set("session_token", sessionToken, {
    domain: process.env.APP_DOMAIN ?? "localhost",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    expires: expiresAt,
    path: "/",
  })
}

export async function logout() {
  const cookieStore = await cookies()

  const sessionToken = cookieStore.get("session_token")?.value

  if (sessionToken) {
    await sessions.deleteOne({
      token: crypto.createHash("sha256").update(sessionToken).digest("hex"),
    })
  }

  cookieStore.delete("session_token")

  redirect("/", "replace")
}

export async function getCurrentUser(): Promise<currentUser | null> {
  const cookieStore = await cookies()

  const sessionToken = cookieStore.get("session_token")?.value

  if (!sessionToken) {
    return null
  }

  const userId = await sessions.findOne({
    token: crypto.createHash("sha256").update(sessionToken).digest("hex"),
    expiresAt: { $gt: new Date() },
  })

  if (!userId) {
    return null
  }

  const user = await getUserById(userId.user)

  if (!user) {
    await sessions.deleteMany({
      user: userId.user,
    })
    return null
  }

  return {
    id: user._id!.toString(),
    email: user.email,
    username: user.username,
    role: user.role,
    verified: user.verified,
    createdAt: user.createdAt,
  }
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()

  const sessionToken = cookieStore.get("session_token")?.value

  if (!sessionToken) {
    return false
  }

  const userId = await sessions.findOne({
    token: crypto.createHash("sha256").update(sessionToken).digest("hex"),
    expiresAt: { $gt: new Date() },
  })

  if (!userId) {
    cookieStore.delete("session_token")
  }

  return !!userId
}
