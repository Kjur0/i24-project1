"use server"

import { getCurrentUser } from "@/lib/auth"
import { users } from "@/lib/db"
import { ObjectId } from "mongodb"

import crypto from "node:crypto"

type OTPMode = "authentication" | "email-change"
type OTPSending = "success" | "db_error" | "user_not_found"

export async function sendOTP(
  email: string,
  mode: OTPMode = "authentication"
): Promise<OTPSending> {
  const otp = `${crypto.randomInt(100000, 1000000).toString()}wr`

  const secretSalt = process.env.OTP_SALT
  const otpHash = crypto
    .createHash("sha256")
    .update(`${otp}:${secretSalt}:${email}`)
    .digest("hex")
  const otpRecord = {
    hash: otpHash,
    attempts: 0,
    createdAt: new Date(),
  }

  console.log(`Generated OTP for ${email}: ${otp}`) ///TODO: send email

  if (mode === "email-change") {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return "user_not_found"
    }

    const result = await users.updateOne(
      { _id: new ObjectId(currentUser.id) },
      { $set: { otp: otpRecord, pendingEmail: email } }
    )

    if (!result.acknowledged || result.matchedCount !== 1) {
      return "db_error"
    }

    return "success"
  }

  const result = await users.updateOne(
    { email },
    { $set: { otp: otpRecord } },
    { upsert: true }
  )

  if (!result.acknowledged) {
    return "db_error"
  }

  return "success"
}

type OTPVerification =
  "max_attempts" | "invalid_otp" | "success" | "user_not_found" | "db_error"

export async function verifyOTP(
  email: string,
  otp: string,
  mode: OTPMode = "authentication"
): Promise<OTPVerification> {
  let userId: string | null = null

  if (mode === "email-change") {
    const currentUser = await getCurrentUser()

    if (!currentUser) {
      return "user_not_found"
    }

    userId = currentUser.id
  }

  const user = userId
    ? await users.findOne({
        _id: new ObjectId(userId),
        pendingEmail: email,
      })
    : await users.findOne({ email })

  if (!user || !user.otp) {
    return "user_not_found"
  }

  const secretSalt = process.env.OTP_SALT
  const otpHash = crypto
    .createHash("sha256")
    .update(`${otp}:${secretSalt}:${email}`)
    .digest("hex")

  if (user.otp.attempts >= 5) {
    return "max_attempts"
  }

  if (user.otp.hash !== otpHash) {
    const result = userId
      ? await users.updateOne(
          {
            _id: new ObjectId(userId),
            pendingEmail: email,
            "otp.hash": user.otp.hash,
          },
          { $inc: { "otp.attempts": 1 } }
        )
      : await users.updateOne(
          { email, "otp.hash": user.otp.hash },
          { $inc: { "otp.attempts": 1 } }
        )

    if (!result.acknowledged || result.matchedCount !== 1) {
      return "db_error"
    }

    return "invalid_otp"
  }

  const result = userId
    ? await users.updateOne(
        {
          _id: new ObjectId(userId),
          pendingEmail: email,
          "otp.hash": user.otp.hash,
        },
        { $unset: { otp: "" } }
      )
    : await users.updateOne(
        { email, "otp.hash": user.otp.hash },
        { $unset: { otp: "" } }
      )

  if (!result.acknowledged || result.matchedCount !== 1) {
    return "db_error"
  }

  return "success"
}
