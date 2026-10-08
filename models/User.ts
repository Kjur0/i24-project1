import { ObjectId } from "mongodb"
import { CredentialDeviceType } from "@simplewebauthn/server"

export type Authn = {
  id: string
  name: string
  publicKey: string
  counter: number
  deviceType: CredentialDeviceType
  backedUp: boolean
  transports: Array<string>
  createdAt: Date
}

export type User = {
  _id?: ObjectId
  email: string
  username: string
  role: "user" | "admin" | "moderator"
  verified: boolean
  sessionTokens: Array<string>
  authn: Array<Authn>
  createdAt: Date
}