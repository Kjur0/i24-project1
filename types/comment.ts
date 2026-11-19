import { ObjectId } from "mongodb"

export type Comment = {
  _id?: ObjectId
  title: string
  content: string
  author: ObjectId
  createdAt: Date
  comments?: Array<Omit<Comment, "comments">>
}
