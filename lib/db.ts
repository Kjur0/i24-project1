import { session } from "@/types/session"
import { user } from "@/types/user"

import db from "@/lib/mongo"
import { ObjectId } from "mongodb"

export const users = db.collection<user>("users")
export const posts = db.collection("posts")
export const sessions = db.collection<session>("sessions")

export async function userExists(email: string) {
  const user = await users.findOne({ email })
  return !!user
}

export async function getUserById(
  id: string
): ReturnType<typeof users.findOne<user>>
export async function getUserById(
  id: ObjectId
): ReturnType<typeof users.findOne<user>>
export async function getUserById(
  id: string | ObjectId
): ReturnType<typeof users.findOne<user>> {
  if (id instanceof ObjectId) {
    return await users.findOne({ _id: id })
  } else if (!ObjectId.isValid(id)) {
    return await users.findOne({ _id: new ObjectId(id) })
  } else {
    return null
  }
}
export async function getUserByEmail(email: string) {
  return await users.findOne({ email })
}
