import { MongoClient } from "mongodb"

if (
  !process.env.MONGO_USER ||
  !process.env.MONGO_PASS ||
  !process.env.MONGO_URL
) {
  throw new Error("Missing MongoDB credentials in environment variables")
}

export const mongo = new MongoClient(
  `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@${process.env.MONGO_URL}`
)

try {
  await mongo.connect()
} catch (error) {
  throw new Error("Failed to connect to MongoDB", { cause: error })
}

export const db = mongo.db("webmaster")

export default db
