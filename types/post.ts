import { ObjectId } from "mongodb"

export type comment = {
  title?: string
  content: string
  author: ObjectId
  createdAt: Date
}

export type post = {
  title: string
  content: string
  author: ObjectId
  createdAt: Date
  comments?: comment[]
}
