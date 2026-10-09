"use client"

import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { useRouter } from "next/navigation"
import {
  browserSupportsWebAuthn,
  startRegistration,
} from "@simplewebauthn/browser"

import * as z from "zod"
import { authnAddFormSchema } from "@/components/forms/schemas"

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
import { getRegistrationOptions, registerCredential } from "@/lib/authn"
import { cn } from "@/lib/utils"
import { KeyIcon, LogInIcon, UserKeyIcon } from "lucide-react"

type AuthnAddFormProps = React.ComponentProps<"div">

export function AuthnAddForm({ className, ...props }: AuthnAddFormProps) {
  const { handleSubmit, control, formState, setError } = useForm<
    z.infer<typeof authnAddFormSchema>
  >({
    mode: "onTouched",
    defaultValues: {
      name: "",
    },
    resolver: zodResolver(authnAddFormSchema),
    resetOptions: {
      keepDirtyValues: false,
    },
    progressive: true,
    criteriaMode: "all",
    shouldFocusError: true,
  })

  const router = useRouter()
  const onSubmit = async (data: z.infer<typeof authnAddFormSchema>) => {
    if (!window.isSecureContext) {
      setError("name", {
        type: "manual",
        message:
          "Logowanie natychmiastowe wymaga HTTPS lub adresu http://localhost.",
      })
      return
    }

    if (!browserSupportsWebAuthn()) {
      setError("name", {
        type: "manual",
        message: "Ta przeglądarka nie obsługuje WebAuthn.",
      })
      return
    }

    const init = await getRegistrationOptions()

    if ("error" in init) {
      setError("name", {
        type: "manual",
        message: init.error,
      })
      return
    }

    const credential = await startRegistration({ optionsJSON: init.options })

    const response = await registerCredential(credential, data.name)

    if ("error" in response) {
      setError("name", {
        type: "manual",
        message: response.error,
      })
      return
    }
  }
  const onSkip = () => {
    router.replace("/dashboard")
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <Logo vertical />
            <h1 className="text-xl font-bold">
              Dodawanie logowania natychmiastowego
            </h1>
            <FieldDescription className="text-center">
              Teraz możesz dodać logowanie natychmiastowe do swojego konta.
            </FieldDescription>
          </div>
          <Controller
            name="name"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="name">Nazwa klucza</FieldLabel>
                <InputGroup>
                  <InputGroupAddon>
                    <KeyIcon />
                  </InputGroupAddon>
                  <InputGroupInput
                    {...field}
                    id="name"
                    placeholder="Windows Hello"
                    aria-invalid={fieldState.invalid}
                    autoComplete="off"
                    disabled={fieldState.isValidating}
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
                  <Spinner />
                  Dodawanie...
                </>
              ) : (
                <>
                  <UserKeyIcon />
                  Dodaj klucz
                </>
              )}
            </Button>
            <Button
              variant="secondary"
              type="button"
              onClick={onSkip}
              disabled={formState.isSubmitting}
            >
              <LogInIcon />
              Pomiń
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </div>
  )
}
