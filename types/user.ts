import { CredentialDeviceType } from "@simplewebauthn/server"

export type userAuthn = {
  id: string
  name: string
  publicKey: string
  counter: number
  deviceType: CredentialDeviceType
  backedUp: boolean
  transports: Array<string>
  createdAt: Date
}

export type userOTP = {
  hash: string
  attempts: number
  createdAt: Date
}

export type user = {
  authn: Array<userAuthn>
  createdAt: Date
  email: string
  role: "user" | "admin" | "moderator"
  username: string
  verified: boolean
  avatar?: string
  otp?: userOTP
  pendingEmail?: string
}

export type currentUser = Pick<
  user,
  "email" | "username" | "role" | "verified" | "createdAt" | "avatar"
> & { id: string }
