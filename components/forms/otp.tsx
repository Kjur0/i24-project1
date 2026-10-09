"use client"

import { cn } from "cn"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import Logo from "@/components/logo"
import * as z from "zod"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import React from "react"
import { formResponse, otpFormSchema } from "@/components/forms/schemas"

type OTPFormProps = {
  email: string
  verify: (data: z.infer<typeof otpFormSchema>) => Promise<formResponse>
} & React.ComponentProps<"div">

export function OTPForm({ email, verify, className, ...props }: OTPFormProps) {
  const { handleSubmit, control, formState, setError } = useForm<
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

  const onSubmit = (data: z.infer<typeof otpFormSchema>) => {
    React.startTransition(async () => {
      const response = await verify(data)

      if (!response.success) {
        setError("otp", {
          type: "server",
          message: response.error,
        })
      }
    })
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <Logo vertical />
            <h1 className="text-xl font-bold">Weryfikacja</h1>
            <FieldDescription className="text-center">
              Na adres {email} został wysłany kod logowania. Nie musisz pamiętać
              hasła.
            </FieldDescription>
          </div>
          <Controller
            name="otp"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="otp">Kod logowania</FieldLabel>
                <InputOTP
                  {...field}
                  autoFocus
                  aria-invalid={fieldState.invalid}
                  maxLength={8}
                  disabled={fieldState.isValidating}
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
              Zweryfikuj
            </Button>
          </Field>
        </FieldGroup>
      </form>
      <FieldDescription className="px-6 text-center">
        Poprzez kliknięcie przycisku &ldquo;Kontynuuj&rdquo; akceptujesz{" "}
        <a href="#">Regulamin</a> oraz <a href="#">Politykę Prywatności</a>.
      </FieldDescription>
    </div>
  )
}
