"use client"

import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { cn } from "cn"

import Link from "next/link"

import * as z from "zod"
import { formResponse, signupFormSchema } from "@/components/forms/schemas"

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

  const onSubmit = async (data: z.infer<typeof signupFormSchema>) => {
    const response = await signup(data)

    if (!response.success) {
      setError("email", {
        type: "server",
        message: response.error,
      })
    }
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
            render={({ field, fieldState, formState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <InputGroup>
                  <InputGroupAddon>
                    <AtSignIcon />
                    <InputGroupInput
                      {...field}
                      id="email"
                      autoFocus
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
