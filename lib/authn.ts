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

import { authnAddFormSchema } from "@/components/forms/schemas"
import { CredentialError, RegistrationError } from "@/lib/authn.types"

import { getCurrentUser, login } from "@/lib/auth"
import { getUserById, users } from "@/lib/db"
import { ObjectId } from "mongodb"

const RP_NAME = "webmaster.rip"
const RP_ID = process.env.APP_DOMAIN || "localhost"
const RP_ORIGIN = process.env.APP_ORIGIN || "http://localhost:3000"
const SUPPORTED_ALGORITHM_IDS = [COSEALG.EdDSA, COSEALG.ES256, COSEALG.RS256]

type RegistrationOptions =
  | {
      success: true
      options: PublicKeyCredentialCreationOptionsJSON
    }
  | { success: false; error: RegistrationError }

export async function getRegistrationOptions(): Promise<RegistrationOptions> {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get("session_token")?.value

  if (!sessionId) {
    return { success: false, error: RegistrationError.SESSION_EXPIRED }
  }

  const user = await getCurrentUser()

  if (!user) {
    return { success: false, error: RegistrationError.USER_NOT_FOUND }
  }

  const userID = Buffer.from(user.id.toString())
  const userName = user.email
  const userDisplayName = user.username

  const excludeCredentials = ((await getUserById(user.id))?.authn ?? []).map(
    (cred) => ({
      id: cred.id,
      transports: cred.transports,
    })
  )

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
    domain: process.env.APP_DOMAIN ?? "localhost",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 300,
    path: "/authn",
  })

  return { success: true, options }
}

type CredentialResponse =
  | {
      success: false
      error?: CredentialError
    }
  | { success: true }

export async function registerCredential(
  credential: RegistrationResponseJSON,
  name: string
): Promise<CredentialResponse> {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get("session_token")?.value

  if (!(await authnAddFormSchema.validateAsync({ name })))
    return { error: CredentialError.INVALID_INPUT, success: false }

  if (!sessionId) {
    return { error: CredentialError.SESSION_EXPIRED, success: false }
  }

  const challenge = cookieStore.get("registration_challenge")?.value

  if (!challenge) {
    return { error: CredentialError.CHALLENGE_NOT_FOUND, success: false }
  }

  const user = await getCurrentUser()

  if (!user) {
    return { error: CredentialError.USER_NOT_FOUND, success: false }
  }

  const verification = await verifyRegistrationResponse({
    response: credential,
    expectedChallenge: challenge,
    expectedOrigin: RP_ORIGIN,
    expectedRPID: RP_ID,
    supportedAlgorithmIDs: SUPPORTED_ALGORITHM_IDS,
  })

  if (!verification.verified || !verification.registrationInfo) {
    return { error: CredentialError.VERIFICATION_FAILED, success: false }
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

  cookieStore.delete("registration_challenge")

  if (
    !(
      await users.updateOne(
        {
          _id: new ObjectId(user.id),
        },
        {
          $addToSet: { authn: newPasskey },
        }
      )
    ).acknowledged
  ) {
    return { error: CredentialError.INTERNAL_ERROR, success: false }
  }

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
    domain: process.env.APP_DOMAIN ?? "localhost",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 300,
    path: "/login",
  })

  return { options }
}

export async function checkCredential(
  credential: AuthenticationResponseJSON
): Promise<CredentialResponse> {
  const cookieStore = await cookies()
  const challenge = cookieStore.get("login_challenge")?.value

  if (!challenge) {
    return { error: CredentialError.CHALLENGE_NOT_FOUND, success: false }
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

    if (!ObjectId.isValid(decodedUserHandle.toString())) {
      return { error: CredentialError.USER_NOT_FOUND, success: false }
    }

    user = await users.findOne({
      _id: new ObjectId(decodedUserHandle.toString()),
    })
  }

  if (!user) {
    return { error: CredentialError.USER_NOT_FOUND, success: false }
  }

  const matchedPasskey = user.authn.find((cred) => cred.id === credential.id)

  if (!matchedPasskey) {
    return { error: CredentialError.INVALID_CREDENTIAL, success: false }
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
    return { error: CredentialError.VERIFICATION_FAILED, success: false }
  }

  if (
    !(
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
    ).acknowledged
  ) {
    return { error: CredentialError.INTERNAL_ERROR, success: false }
  }

  cookieStore.delete("login_challenge")

  await login(user.email)

  redirect("/dashboard", "replace")
}
