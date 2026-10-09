import { CredentialDeviceType } from "@simplewebauthn/server"

import { ObjectId } from "mongodb"

export type UserAuthn = {
  id: string
  name: string
  publicKey: string
  counter: number
  deviceType: CredentialDeviceType
  backedUp: boolean
  transports: Array<string>
  createdAt: Date
}

export type UserOTP = {
  hash: string
  attempts: number
  createdAt: Date
}

export type User = {
  _id?: ObjectId
  authn: Array<UserAuthn>
  createdAt: Date
  email: string
  role: "user" | "admin" | "moderator"
  sessionTokens: Array<string>
  username: string
  verified: boolean
  otp?: UserOTP
}

export type CurrentUser = Pick<
  User,
  "email" | "username" | "role" | "verified" | "createdAt"
> & { id: string }
