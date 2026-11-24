import { ObjectId } from "mongodb"

export type session = {
  user: ObjectId
  token: string
  createdAt: Date
  expiresAt: Date
}
