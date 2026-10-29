"use client"

import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { cn } from "cn"

import Link from "next/link"

import * as z from "zod"
import { formResponse, signupFormSchema } from "@/components/forms/schemas"
import { SignupError } from "@/components/forms/error.types"

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
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Spinner } from "@/components/ui/spinner"
import { AtSignIcon, SquareUserIcon, UserPlusIcon } from "lucide-react"

type SignupFormProps = {
  signup: (
    data: z.infer<typeof signupFormSchema>
  ) => Promise<formResponse<SignupError>>
} & React.ComponentProps<"div">

export function SignupForm({ signup, className, ...props }: SignupFormProps) {
  const [fatalError, setFatalError] = useState<Error | null>(null)
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

  if (fatalError) {
    throw fatalError
  }

  const onSubmit = async (data: z.infer<typeof signupFormSchema>) => {
    try {
      const response = await signup(data)

      if (!response.success) {
        switch (response.error) {
          case SignupError.USER_EXISTS:
            setError("email", {
              type: "manual",
              message: "Użytkownik o podanym adresie email już istnieje",
            })
            return
          case SignupError.VALIDATION_ERROR:
            setError("root", {
              type: "manual",
              message: "Nieprawidłowy adres email",
            })
            return
          case SignupError.INTERNAL_ERROR:
            setError("root", {
              type: "manual",
              message:
                "Wystąpił błąd podczas tworzenia użytkownika. Spróbuj ponownie później.",
            })
            return
          default:
            setError("root", {
              type: "manual",
              message: "Nieznany błąd. Spróbuj ponownie później.",
            })
            return
        }
      }
    } catch (error) {
      setFatalError(error as Error)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <Logo vertical />
            <h1 className="text-xl font-bold">Rejestracja</h1>
            <FieldDescription>
              Masz już konto? <Link href="/login">Zaloguj się</Link>
            </FieldDescription>
          </div>
          <Controller
            name="email"
            control={control}
            render={({ field, fieldState, formState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <InputGroup>
                  <InputGroupAddon>
                    <AtSignIcon />
                    <InputGroupInput
                      {...field}
                      id="email"
                      placeholder="uczen@tm1.edu.pl"
                      aria-invalid={fieldState.invalid}
                      autoComplete="email"
                      disabled={formState.isSubmitting}
                    />
                  </InputGroupAddon>
                </InputGroup>
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
                <InputGroup>
                  <InputGroupAddon>
                    <SquareUserIcon />
                  </InputGroupAddon>
                  <InputGroupInput
                    {...field}
                    id="username"
                    placeholder="J. Doe"
                    aria-invalid={fieldState.invalid}
                    autoComplete="name"
                    disabled={formState.isSubmitting}
                  />
                </InputGroup>
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
          <Field>
            <Button type="submit" disabled={formState.isSubmitting}>
              {formState.isSubmitting ? (
                <>
                  <Spinner /> Tworzenie konta...
                </>
              ) : (
                <>
                  <UserPlusIcon />
                  Stwórz konto
                </>
              )}
            </Button>
            <FieldError errors={[formState.errors.root]} />
          </Field>
        </FieldGroup>
      </form>
      <FieldDescription className="text-center">
        Poprzez kliknięcie przycisku &ldquo;Stwórz konto&rdquo; akceptujesz{" "}
        <a href="#">Regulamin</a> oraz <a href="#">Politykę Prywatności</a>.
      </FieldDescription>
    </div>
  )
}
