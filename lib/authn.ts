"use server"

import { cookies } from "next/headers"
import { getCurrentUser } from "@/lib/auth"
import { users } from "@/lib/db"
import { ObjectId } from "mongodb"
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
} from "@simplewebauthn/server"
import type {
  PublicKeyCredentialCreationOptionsJSON,
  RegistrationResponseJSON,
} from "@simplewebauthn/server"
import { redirect } from "next/navigation"

const RP_NAME = "webmaster.rip"
const RP_ID = process.env.APP_DOMAIN || "localhost"
const RP_ORIGIN = process.env.APP_ORIGIN || "http://localhost:3000"

export async function getRegistrationOptions(): Promise<PublicKeyCredentialCreationOptionsJSON> {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get("session_token")?.value

  if (!sessionId) {
    throw new Error("Sesja wygasła")
  }

  const user = await getCurrentUser()

  if (!user) {
    throw new Error("Użytkownik nie istnieje")
  }

  const userID = Buffer.from(user.id.toString())
  const userName = user.email
  const userDisplayName = user.username

  const excludeCredentials =
    ((await users.findOne({ _id: new ObjectId(user.id) }))?.authn || []).map(
      (cred) => ({
        id: cred.id,
        transports: cred.transports,
      })
    ) || []

  const options = await generateRegistrationOptions({
    rpName: RP_NAME,
    rpID: RP_ID,
    userID,
    userName,
    userDisplayName,
    attestationType: "none",

    authenticatorSelection: {
      residentKey: "preferred",
      userVerification: "preferred",
    },

    excludeCredentials,
  })

  cookieStore.set("registration_challenge", options.challenge, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 300,
    path: "/",
  })

  return options
}

export async function sendCredential(
  credential: RegistrationResponseJSON,
  name: string
) {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get("session_token")?.value

  if (!sessionId) {
    throw new Error("Sesja wygasła")
  }

  const challenge = cookieStore.get("registration_challenge")?.value

  if (!challenge) {
    throw new Error("Nie znaleziono wyzwania rejestracyjnego")
  }

  const user = await getCurrentUser()

  if (!user) {
    throw new Error("Użytkownik nie istnieje")
  }

  try {
    const verification = await verifyRegistrationResponse({
      response: credential,
      expectedChallenge: challenge,
      expectedOrigin: RP_ORIGIN,
      expectedRPID: RP_ID,
    })

    if (!verification.verified || !verification.registrationInfo) {
      throw new Error("Nie udało się zweryfikować rejestracji")
    }

    const {
      credential: cred,
      credentialDeviceType,
      credentialBackedUp,
    } = verification.registrationInfo

    const newPasskey = {
      id: cred.id,
      name: name.trim(),
      publicKey: Buffer.from(cred.publicKey).toString("base64url"),
      counter: cred.counter,
      deviceType: credentialDeviceType,
      backedUp: credentialBackedUp,
      transports: credential.response.transports || [],
      createdAt: new Date(),
    }

    await users.updateOne(
      {
        _id: new ObjectId(user.id),
      },
      {
        $addToSet: { authn: newPasskey },
      }
    )

    cookieStore.delete("registration_challenge")
  } catch (error) {
    console.error("Error verifying registration:", error)
    throw new Error("Nie udało się zweryfikować rejestracji")
  }

  redirect("/dashboard")
}
