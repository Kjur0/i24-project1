import { CredentialDeviceType } from "@simplewebauthn/server"

import { ObjectId } from "mongodb"

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
  _id?: ObjectId
  authn: Array<userAuthn>
  createdAt: Date
  email: string
  role: "user" | "admin" | "moderator"
  username: string
  verified: boolean
  otp?: userOTP
}

export type currentUser = Pick<
  user,
  "email" | "username" | "role" | "verified" | "createdAt"
> & { id: string }
