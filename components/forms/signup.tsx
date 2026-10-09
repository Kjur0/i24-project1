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
import { Input } from "@/components/ui/input"
import Link from "next/link"
import Logo from "@/components/logo"
import { Controller, useForm } from "react-hook-form"
import * as z from "zod"
import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { formResponse, signupFormSchema } from "@/components/forms/schemas"

type SignupFormProps = {
  signup: (data: z.infer<typeof signupFormSchema>) => Promise<formResponse>
} & React.ComponentProps<"div">

export function SignupForm({ signup, className, ...props }: SignupFormProps) {
  const { handleSubmit, control, formState, setError } = useForm<
    z.infer<typeof signupFormSchema>
  >({
    mode: "onTouched",
    defaultValues: {
      email: "",
      username: "",
    },
    resolver: zodResolver(signupFormSchema),
    resetOptions: {
      keepDirtyValues: true,
    },
    progressive: true,
    criteriaMode: "all",
    shouldFocusError: true,
  })

  const onSubmit = (data: z.infer<typeof signupFormSchema>) => {
    React.startTransition(async () => {
      const response = await signup(data)

      if (!response.success) {
        setError("email", {
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
            <h1 className="text-xl font-bold">Rejestracja</h1>
            <FieldDescription className="text-center">
              Masz już konto? <Link href="/login">Zaloguj się</Link>
            </FieldDescription>
          </div>
          <Controller
            name="email"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  {...field}
                  id="email"
                  autoFocus
                  placeholder="uczen@tm1.edu.pl"
                  aria-invalid={fieldState.invalid}
                  autoComplete="email"
                  disabled={fieldState.isValidating}
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
          <Controller
            name="username"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="username">Nazwa Użytkownika</FieldLabel>
                <FieldDescription>
                  Podaj jak widzieć będą Cię inni użytkownicy
                </FieldDescription>
                <Input
                  {...field}
                  id="username"
                  placeholder="J. Doe"
                  aria-invalid={fieldState.invalid}
                  autoComplete="name"
                  disabled={fieldState.isValidating}
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
          <Field>
            <Button type="submit" disabled={formState.isSubmitting}>
              Stwórz konto
            </Button>
          </Field>
        </FieldGroup>
      </form>
      <FieldDescription className="px-6 text-center">
        Poprzez kliknięcie przycisku &ldquo;Stwórz konto&rdquo; akceptujesz{" "}
        <a href="#">Regulamin</a> oraz <a href="#">Politykę Prywatności</a>.
      </FieldDescription>
    </div>
  )
}
