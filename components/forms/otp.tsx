"use client"

import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { cn } from "cn"

import * as z from "zod"
import { formResponse, otpFormSchema } from "@/components/forms/schemas"
import { OTPError } from "@/components/forms/error.types"

import Logo from "@/components/logo"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { Spinner } from "@/components/ui/spinner"
import { MailBadgeIcon } from "lucide-react"

type OTPFormProps = {
  email: string
  verify: (
    data: z.infer<typeof otpFormSchema>
  ) => Promise<formResponse<OTPError>>
} & React.ComponentProps<"div">

export function OTPForm({ email, verify, className, ...props }: OTPFormProps) {
  const [fatalError, setFatalError] = useState<Error | null>(null)
  const { handleSubmit, control, setError, formState } = useForm<
    z.infer<typeof otpFormSchema>
  >({
    mode: "onTouched",
    defaultValues: {
      otp: "",
    },
    resolver: zodResolver(otpFormSchema),
    resetOptions: {
      keepDirtyValues: false,
    },
    progressive: true,
    criteriaMode: "all",
    shouldFocusError: true,
  })

  const onSubmit = async (data: z.infer<typeof otpFormSchema>) => {
    try {
      const response = await verify(data)

      if (!response.success) {
        setError("otp", {
          type: "server",
          message: getOTPErrorMessage(response.error),
        })
      }

      function getOTPErrorMessage(error: OTPError) {
        switch (error) {
          case OTPError.INVALID_OTP:
            return "Nieprawidłowy kod logowania"
          case OTPError.MAX_ATTEMPTS:
            return "Przekroczono maksymalną liczbę prób. Wygeneruj nowy kod logowania"
          case OTPError.USER_NOT_FOUND:
            return "Nie znaleziono użytkownika o podanym adresie email"
          case OTPError.VALIDATION_ERROR:
            return "Kod logowania ma nieprawidłowy format"
        }
      }
    } catch (error) {
      setFatalError(error instanceof Error ? error : new Error(String(error)))
    }
  }

  if (fatalError) {
    throw fatalError
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <Logo vertical />
            <h1 className="text-xl font-bold">Weryfikacja</h1>
            <FieldDescription>
              Na adres {email} został wysłany kod logowania. Nie musisz pamiętać
              hasła.
            </FieldDescription>
          </div>
          <Controller
            name="otp"
            control={control}
            render={({ field, fieldState, formState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="otp">Kod logowania</FieldLabel>
                <InputOTP
                  {...field}
                  autoFocus
                  aria-invalid={fieldState.invalid}
                  maxLength={8}
                  disabled={formState.isSubmitting}
                  autoComplete="one-time-code"
                  id="otp"
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0}></InputOTPSlot>
                    <InputOTPSlot index={1}></InputOTPSlot>
                    <InputOTPSlot index={2}></InputOTPSlot>
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot index={3}></InputOTPSlot>
                    <InputOTPSlot index={4}></InputOTPSlot>
                    <InputOTPSlot index={5}></InputOTPSlot>
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot index={6}></InputOTPSlot>
                    <InputOTPSlot index={7}></InputOTPSlot>
                  </InputOTPGroup>
                </InputOTP>
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
          <Field>
            <Button type="submit" disabled={formState.isSubmitting}>
              {formState.isSubmitting ? (
                <>
                  <Spinner />
                  Weryfikacja...
                </>
              ) : (
                <>
                  <MailBadgeIcon />
                  Zweryfikuj
                </>
              )}
            </Button>
          </Field>
        </FieldGroup>
      </form>
      <FieldDescription className="text-center">
        Poprzez kliknięcie przycisku &ldquo;Kontynuuj&rdquo; akceptujesz{" "}
        <a href="#">Regulamin</a> oraz <a href="#">Politykę Prywatności</a>.
      </FieldDescription>
    </div>
  )
}
