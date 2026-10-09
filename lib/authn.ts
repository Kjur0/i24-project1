"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import {
  AuthenticationResponseJSON,
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
  type PublicKeyCredentialCreationOptionsJSON,
  type PublicKeyCredentialRequestOptionsJSON,
  type RegistrationResponseJSON,
} from "@simplewebauthn/server"
import { COSEALG } from "@simplewebauthn/server/helpers"

import { getCurrentUser, login } from "@/lib/auth"
import { users } from "@/lib/db"
import { ObjectId } from "mongodb"

const RP_NAME = "webmaster.rip"
const RP_ID = process.env.APP_DOMAIN || "localhost"
const RP_ORIGIN = process.env.APP_ORIGIN || "http://localhost:3000"
const SUPPORTED_ALGORITHM_IDS = [COSEALG.EdDSA, COSEALG.ES256, COSEALG.RS256]

type RegistrationOptions =
  | {
      options: PublicKeyCredentialCreationOptionsJSON
    }
  | { error: string }

export async function getRegistrationOptions(): Promise<RegistrationOptions> {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get("session_token")?.value

  if (!sessionId) {
    return { error: "Sesja wygasła" }
  }

  const user = await getCurrentUser()

  if (!user) {
    return { error: "Użytkownik nie istnieje" }
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
    supportedAlgorithmIDs: SUPPORTED_ALGORITHM_IDS,

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

  return { options }
}

type CredentialResponse = {
  error?: string
}

export async function registerCredential(
  credential: RegistrationResponseJSON,
  name: string
): Promise<CredentialResponse> {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get("session_token")?.value

  if (!sessionId) {
    return { error: "Sesja wygasła" }
  }

  const challenge = cookieStore.get("registration_challenge")?.value

  if (!challenge) {
    return { error: "Nie znaleziono wyzwania rejestracyjnego" }
  }

  const user = await getCurrentUser()

  if (!user) {
    return { error: "Użytkownik nie istnieje" }
  }

  const verification = await verifyRegistrationResponse({
    response: credential,
    expectedChallenge: challenge,
    expectedOrigin: RP_ORIGIN,
    expectedRPID: RP_ID,
    supportedAlgorithmIDs: SUPPORTED_ALGORITHM_IDS,
  })

  if (!verification.verified || !verification.registrationInfo) {
    return { error: "Nie udało się zweryfikować rejestracji" }
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

  redirect("/dashboard", "replace")
}

type LoginOptions =
  | {
      options: PublicKeyCredentialRequestOptionsJSON
    }
  | { error: string }

export async function getLoginOptions(): Promise<LoginOptions> {
  const options = await generateAuthenticationOptions({
    rpID: RP_ID,
    userVerification: "preferred",
  })

  const cookieStore = await cookies()
  cookieStore.set("login_challenge", options.challenge, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 300,
    path: "/",
  })

  return { options }
}

export async function checkCredential(
  credential: AuthenticationResponseJSON
): Promise<CredentialResponse> {
  const cookieStore = await cookies()
  const challenge = cookieStore.get("login_challenge")?.value

  if (!challenge) {
    return { error: "Nie znaleziono wyzwania logowania" }
  }

  let user

  if (!credential.response.userHandle) {
    user = await users.findOne({
      "authn.id": credential.id,
    })
  } else {
    const decodedUserHandle = Buffer.from(
      credential.response.userHandle,
      "base64url"
    )

    user = await users.findOne({
      _id: new ObjectId(decodedUserHandle.toString()),
    })
  }

  if (!user) {
    return { error: "Nie znaleziono użytkownika" }
  }

  const matchedPasskey = user.authn.find((cred) => cred.id === credential.id)

  if (!matchedPasskey) {
    return { error: "Nie znaleziono pasującego passkeya" }
  }

  const verification = await verifyAuthenticationResponse({
    response: credential,
    expectedChallenge: challenge,
    expectedOrigin: RP_ORIGIN,
    expectedRPID: RP_ID,
    credential: {
      id: matchedPasskey.id,
      publicKey: Buffer.from(matchedPasskey.publicKey, "base64url"),
      counter: matchedPasskey.counter,
      transports: matchedPasskey.transports,
    },
  })

  if (!verification.verified) {
    return { error: "Nie udało się zweryfikować logowania" }
  }

  await users.updateOne(
    {
      _id: new ObjectId(user._id),
      "authn.id": matchedPasskey.id,
    },
    {
      $set: {
        "authn.$.counter": verification.authenticationInfo.newCounter,
      },
    }
  )

  cookieStore.delete("login_challenge")

  await login(user.email)

  redirect("/dashboard", "replace")
}
