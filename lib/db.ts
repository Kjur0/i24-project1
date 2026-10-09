import { User } from "@/models/User"

import db from "@/lib/mongo"

export const users = db.collection<User>("users")
export const posts = db.collection("posts")

export async function userExists(email: string) {
  const user = await users.findOne({ email })
  return !!user
}

export async function getUser(email: string) {
  const user = await users.findOne({ email })
  return user
}
