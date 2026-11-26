import { cookies } from "next/headers"

import { LoginSettings } from "@/components/settings/login-settings"
import { requireCurrentUser } from "@/lib/auth"
import { getUserById, sessions } from "@/lib/db"
import { ObjectId } from "mongodb"

import crypto from "node:crypto"

export default async function LoginSettingsPage() {
  const currentUser = await requireCurrentUser()
  const userId = new ObjectId(currentUser.id)
  const user = await getUserById(userId)

  if (!user) {
    throw new Error("Nie znaleziono konta użytkownika.")
  }

  const sessionToken = (await cookies()).get("session_token")?.value
  const currentTokenHash = sessionToken
    ? crypto.createHash("sha256").update(sessionToken).digest("hex")
    : undefined
  const activeSessions = await sessions
    .find({ user: userId, expiresAt: { $gt: new Date() } })
    .sort({ createdAt: -1 })
    .toArray()

  return (
    <LoginSettings
      email={user.email}
      passkeys={(user.authn ?? []).map((passkey) => ({
        id: passkey.id,
        name: passkey.name,
        createdAt: passkey.createdAt.getTime(),
      }))}
      sessions={activeSessions.map((session) => ({
        id: session._id.toString(),
        createdAt: session.createdAt.getTime(),
        expiresAt: session.expiresAt.getTime(),
        isCurrent: session.token === currentTokenHash,
      }))}
    />
  )
}
