import * as z from "zod"

export type formResponse =
  | {
      success: false
      error: string
    }
  | {
      success: true
    }

export const signupFormSchema = z.object({
  email: z
    .email("Adres email jest niepoprawny")
    .min(1, "Adres email jest wymagany"),
  username: z
    .string("Nazwa użytkownika jest wymagana.")
    .min(3, "Nazwa użytkownika jest za krótka.")
    .max(50, "Nazwa użytkownika jest za długa."),
})

export const otpFormSchema = z.object({
  otp: z
    .string("Wprowadź kod logowania")
    .length(8, "Kod logowania musi mieć 8 znaków")
    .regex(/^\d+$/, "Kod logowania musi składać się z cyfr"),
})

export const authnAddFormSchema = z.object({
  name: z.string("Wprowadź nazwę").min(1, "Nazwa jest wymagana"),
})

export const loginFormSchema = z.object({
  email: z
    .email("Adres email jest niepoprawny")
    .min(1, "Adres email jest wymagany"),
})
