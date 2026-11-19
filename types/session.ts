import { ObjectId } from "mongodb"

export type session = {
  _id?: ObjectId
  user: ObjectId
  token: string
  createdAt: Date
  expiresAt: Date
}
