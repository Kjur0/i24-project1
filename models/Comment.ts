import { ObjectId } from "mongodb"

export class Comment {
  constructor(
    public author: ObjectId,
    public createdAt: Date,
    public content: string,
    public comments?: Array<Omit<Comment, "comments">>,
    public _id?: ObjectId
  ) {}
}
