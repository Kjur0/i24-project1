import { users } from "@/lib/db"

import crypto from "node:crypto"

export async function sendOTP(email: string): Promise<void> {
  const otp = `${crypto.randomInt(100000, 1000000).toString()}wr`

  const secretSalt = process.env.OTP_SALT
  const otpHash = crypto
    .createHash("sha256")
    .update(`${otp}:${secretSalt}:${email}`)
    .digest("hex")

  console.log(`Generated OTP for ${email}: ${otp}`) ///TODO: send email

  if (
    !(
      await users.updateOne(
        { email },
        {
          $set: {
            otp: {
              hash: otpHash,
              attempts: 0,
              createdAt: new Date(),
            },
          },
        },
        { upsert: true }
      )
    ).acknowledged
  ) {
    throw new Error("Failed to store OTP in database")
  }
}

type OTPVerification =
  "max_attempts" | "invalid_otp" | "success" | "user_not_found" | "db_error"

export async function verifyOTP(
  email: string,
  otp: string
): Promise<OTPVerification> {
  const user = await users.findOne({ email })

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
    await users.updateOne({ email }, { $inc: { "otp.attempts": 1 } })
    return "invalid_otp"
  }

  if (
    !(
      await users.updateOne(
        { email },
        {
          $unset: { otp: "" },
        }
      )
    ).acknowledged
  ) {
    return "db_error"
  }

  return "success"
}
