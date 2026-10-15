import { User } from "@/types/user"

import db from "@/lib/mongo"
import { ObjectId } from "mongodb"

export const users = db.collection<User>("users")
export const posts = db.collection("posts")

export async function userExists(email: string) {
  const user = await users.findOne({ email })
  return !!user
}

export async function getUserById(id: ObjectId) {
  const user = await users.findOne({ _id: id })
  return user
}
export async function getUser(email: string) {
  const user = await users.findOne({ email })
  return user
}
