import * as z from "zod"

export const emailAddressSchema = z
  .email("Podaj poprawny adres e-mail.")
  .trim()
  .max(254, "Adres e-mail jest zbyt długi.")

export const profileSettingsSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Nazwa użytkownika musi mieć co najmniej 3 znaki.")
    .max(50, "Nazwa użytkownika może mieć maksymalnie 50 znaków."),
  avatar: z
    .string()
    .trim()
    .max(2048, "Adres avatara jest zbyt długi.")
    .refine((value) => {
      if (!value) return true

      try {
        const url = new URL(value)
        return url.protocol === "https:" || url.protocol === "http:"
      } catch {
        return false
      }
    }, "Podaj poprawny adres URL zaczynający się od http:// lub https://."),
})

export const passkeyNameSchema = z
  .string()
  .trim()
  .min(1, "Nazwa klucza jest wymagana.")
  .max(80, "Nazwa klucza może mieć maksymalnie 80 znaków.")

export const passkeyNameFormSchema = z.object({
  name: passkeyNameSchema,
})

export const emailChangeRequestSchema = z.object({
  email: emailAddressSchema,
})
