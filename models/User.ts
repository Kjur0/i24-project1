import { ObjectId, Double } from "mongodb"

export class User {
  constructor(
    public name: string,
    public idp: string,
    public role: string,
    public currentRating?: Double,
    public _id?: ObjectId
  ) {}
}
