import { MongoClient } from "mongodb"

const mongoURI = process.env.MONGO_URI
const mongoURL = process.env.MONGO_URL
const mongoUser = process.env.MONGO_USER
const mongoPass = process.env.MONGO_PASS

if (!mongoURI && !mongoURL)
  throw new Error("Missing MongoDB URI in environment variables")

if (
  ((!mongoURI || mongoURI.includes("<db_username>")) && !mongoUser) ||
  ((!mongoURI || mongoURI.includes("<db_password>")) && !mongoPass)
) {
  throw new Error("Missing MongoDB credentials in environment variables")
}

export const mongo = new MongoClient(
  mongoURI ?? `mongodb+srv://<db_username>:<db_password>@${mongoURL}/webmaster`,
  {
    appName: "webmaster.rip",
    auth: {
      username:
        !mongoURI || mongoURI.includes("<db_username>") ? mongoUser : undefined,
      password:
        !mongoURI || mongoURI.includes("<db_password>") ? mongoPass : undefined,
    },
    compressors: "zlib",
    zlibCompressionLevel: 5,
  }
)

try {
  await mongo.connect()
} catch (error) {
  throw new Error("Failed to connect to MongoDB", { cause: error })
}

export const db = mongo.db("webmaster")

export default db
