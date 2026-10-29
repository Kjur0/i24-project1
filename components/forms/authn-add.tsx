"use client"

import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { useRouter } from "next/navigation"
import {
  RegistrationResponseJSON,
  WebAuthnError,
  browserSupportsWebAuthn,
  startRegistration,
} from "@simplewebauthn/browser"

import * as z from "zod"
import { authnAddFormSchema } from "@/components/forms/schemas"
import { CredentialError, RegistrationError } from "@/lib/authn.types"

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
import { toast } from "@/components/ui/toast"
import { getRegistrationOptions, registerCredential } from "@/lib/authn"
import { cn } from "@/lib/utils"
import { KeyIcon, LogInIcon, UserKeyIcon } from "lucide-react"

type AuthnAddFormProps = React.ComponentProps<"div">

export function AuthnAddForm({ className, ...props }: AuthnAddFormProps) {
  const [isBlocked, setIsBlocked] = useState(false)
  const [fatalError, setFatalError] = useState<Error | null>(null)
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
  const setRegistrationError = (message: string, block = false) => {
    setError("name", {
      type: "manual",
      message,
    })
    if (block) {
      setIsBlocked(true)
    }
  }

  if (fatalError) {
    throw fatalError
  }

  const onSubmit = async (data: z.infer<typeof authnAddFormSchema>) => {
    if (!window.isSecureContext) {
      setRegistrationError(
        "Logowanie natychmiastowe jest niedostępne z powodu bezpieczeństwa.",
        true
      )
      return
    }

    if (!browserSupportsWebAuthn()) {
      setRegistrationError(
        "Twoja przeglądarka nie obsługuje logowania natychmiastowego.",
        true
      )
      return
    }

    const init = await getRegistrationOptions()

    if (!init.success) {
      switch (init.error) {
        case RegistrationError.USER_NOT_FOUND:
          setRegistrationError("Nie znaleziono użytkownika.")
          return
        case RegistrationError.SESSION_EXPIRED:
          toast.add({
            type: "error",
            title: "Sesja wygasła",
            description:
              "Twoja sesja wygasła. Zaloguj się ponownie, aby dodać logowanie natychmiastowe.",
          })
          router.replace("/login")
          return
        default:
          setRegistrationError("Wystąpił nieznany błąd.")
          return
      }
    }

    let credential: RegistrationResponseJSON

    try {
      credential = await startRegistration({ optionsJSON: init.options })
    } catch (error) {
      if (!(error instanceof WebAuthnError)) {
        setFatalError(error as Error)
        throw error
      }
      switch (error.code) {
        case "ERROR_CEREMONY_ABORTED":
          return
        case "ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY": {
          const cause = error.cause

          if (cause instanceof Error && cause.name === "NotAllowedError") {
            return
          }

          setRegistrationError(
            "Nie udało się dokończyć rejestracji. Spróbuj ponownie."
          )
          return
        }
        case "ERROR_INVALID_DOMAIN":
          setRegistrationError(
            `Nieprawidłowa domena. Zgłoś kod ${error.code}.`,
            true
          )
          return
        case "ERROR_INVALID_RP_ID":
          setRegistrationError(
            `Nieprawidłowy identyfikator RP. Zgłoś kod ${error.code}.`,
            true
          )
          return
        case "ERROR_AUTHENTICATOR_PREVIOUSLY_REGISTERED":
          setRegistrationError(
            "Ten klucz jest już zarejestrowany. Spróbuj użyć innego."
          )
          return
        case "ERROR_AUTHENTICATOR_GENERAL_ERROR":
          setRegistrationError(
            "Nie udało się utworzyć klucza. Spróbuj ponownie."
          )
          return
        case "ERROR_AUTHENTICATOR_NO_SUPPORTED_PUBKEYCREDPARAMS_ALG":
          setRegistrationError(
            "To urządzenie nie obsługuje wymaganego algorytmu.",
            true
          )
          return
        case "ERROR_AUTHENTICATOR_MISSING_DISCOVERABLE_CREDENTIAL_SUPPORT":
          setRegistrationError(
            "To urządzenie nie obsługuje wymaganego trybu klucza.",
            true
          )
          return
        case "ERROR_AUTHENTICATOR_MISSING_USER_VERIFICATION_SUPPORT":
          setRegistrationError(
            "To urządzenie nie obsługuje wymaganej weryfikacji.",
            true
          )
          return
        case "ERROR_AUTO_REGISTER_USER_VERIFICATION_FAILURE":
          setRegistrationError(
            "Nie udało się potwierdzić Twojej tożsamości. Spróbuj ponownie."
          )
          return
        case "ERROR_INVALID_USER_ID_LENGTH":
        case "ERROR_MALFORMED_PUBKEYCREDPARAMS":
          const err = new Error(`${error.code}: ${error.message}`, {
            cause: error,
          })
          setFatalError(err)
          throw err
        case "ERROR_SIGNAL_INVALID_ARGUMENT":
          setFatalError(error)
          throw error
      }
    }

    const response = await registerCredential(credential, data.name)

    if (!response.success) {
      switch (response.error) {
        case CredentialError.SESSION_EXPIRED:
          toast.add({
            type: "error",
            title: "Sesja wygasła",
            description:
              "Twoja sesja wygasła. Zaloguj się ponownie, aby dodać logowanie natychmiastowe.",
          })
          router.replace("/login")
          return
        case CredentialError.CHALLENGE_NOT_FOUND:
          setRegistrationError(
            "Nie znaleziono wyzwania rejestracji. Spróbuj ponownie."
          )
          return
        case CredentialError.USER_NOT_FOUND:
          setRegistrationError("Nie znaleziono użytkownika.")
          return
        case CredentialError.VERIFICATION_FAILED:
          setRegistrationError(
            "Nie udało się zweryfikować rejestracji. Spróbuj ponownie."
          )
          return
        case CredentialError.INTERNAL_ERROR:
          setRegistrationError(
            "Nie udało się zarejestrować klucza. Spróbuj ponownie."
          )
          return
        case CredentialError.INVALID_INPUT:
          setRegistrationError("Nazwa klucza jest nieprawidłowa.")
          return
        default:
          setRegistrationError("Wystąpił nieznany błąd.")
          return
      }
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
            <FieldDescription>
              Teraz możesz dodać logowanie natychmiastowe do swojego konta.
              <br />
              Dzięki temu szybciej i bezpieczniej zalogujesz się do aplikacji.
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
            <Button
              type="submit"
              disabled={formState.isSubmitting || isBlocked}
            >
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
