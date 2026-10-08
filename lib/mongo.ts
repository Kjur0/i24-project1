import { MongoClient } from "mongodb"

export const mongo = new MongoClient(
  `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@${process.env.MONGO_URI}`
)

try {
  await mongo.connect()
  console.log("You successfully connected to MongoDB!")
} catch (err) {
  console.dir(err)
}

export const db = mongo.db("webmaster")

export default db
