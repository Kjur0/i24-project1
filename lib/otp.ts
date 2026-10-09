import { users } from "@/lib/db"

import crypto from "node:crypto"

export async function sendOTP(email: string, clientIp: string): Promise<void> {
  const otp = crypto.randomInt(10000000, 100000000).toString()

  const secretSalt = process.env.OTPSalt || "default_salt"
  const otpHash = crypto
    .createHash("sha256")
    .update(`${otp}:${clientIp}:${secretSalt}:${email}`)
    .digest("hex")

  console.log(`Generated OTP for ${email}: ${otp}`) ///TODO: send email

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
}

type OTPVerification =
  "max_attempts" | "invalid_otp" | "success" | "user_not_found"

export async function verifyOTP(
  email: string,
  otp: string,
  clientIp: string
): Promise<OTPVerification> {
  const user = await users.findOne({ email })

  if (!user || !user.otp) {
    return "user_not_found"
  }

  const secretSalt = process.env.OTPSalt || "default_salt"
  const otpHash = crypto
    .createHash("sha256")
    .update(`${otp}:${clientIp}:${secretSalt}:${email}`)
    .digest("hex")

  if (user.otp.attempts >= 5) {
    return "max_attempts"
  }

  if (user.otp.hash !== otpHash) {
    await users.updateOne({ email }, { $inc: { "otp.attempts": 1 } })
    return "invalid_otp"
  }

  await users.updateOne(
    { email },
    {
      $unset: { otp: "" },
    }
  )

  return "success"
}
