"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { cn } from "cn"

import Link from "next/link"
import {
  WebAuthnAbortService,
  WebAuthnError,
  browserSupportsWebAuthn,
  browserSupportsWebAuthnAutofill,
  startAuthentication,
} from "@simplewebauthn/browser"

import * as z from "zod"
import { formResponse, loginFormSchema } from "@/components/forms/schemas"
import { LoginError } from "@/components/forms/error.types"
import { CredentialError } from "@/lib/authn.types"

import Logo from "@/components/logo"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "@/components/ui/toast"
import { checkCredential, getLoginOptions } from "@/lib/authn"
import { LogInIcon, SquareUserIcon, UserKeyIcon } from "lucide-react"

function showCredentialError(error: CredentialError | undefined) {
  switch (error) {
    case CredentialError.CHALLENGE_NOT_FOUND:
      toast.add({
        title: "Błąd logowania natychmiastowego",
        description: "Nie znaleziono wyzwania logowania. Spróbuj ponownie.",
        type: "error",
      })
      break
    case CredentialError.USER_NOT_FOUND:
      toast.add({
        title: "Błąd logowania natychmiastowego",
        description: "Nie znaleziono użytkownika dla tego klucza.",
        type: "error",
      })
      break
    case CredentialError.INVALID_CREDENTIAL:
      toast.add({
        title: "Błąd logowania natychmiastowego",
        description: "Ten klucz logowania jest nieprawidłowy.",
        type: "error",
      })
      break
    case CredentialError.VERIFICATION_FAILED:
      toast.add({
        title: "Błąd logowania natychmiastowego",
        description: "Nie udało się zweryfikować logowania. Spróbuj ponownie.",
        type: "error",
      })
      break
    case CredentialError.SESSION_EXPIRED:
      toast.add({
        title: "Błąd logowania natychmiastowego",
        description: "Sesja wygasła. Zaloguj się ponownie.",
        type: "error",
      })
      break
    default:
      toast.add({
        title: "Błąd logowania natychmiastowego",
        description:
          "Nie udało się zalogować przy użyciu klucza. Spróbuj ponownie.",
        type: "error",
      })
  }
}

type LoginFormProps = {
  login: (
    data: z.infer<typeof loginFormSchema>
  ) => Promise<formResponse<LoginError>>
} & React.ComponentProps<"div">

export function LoginForm({ login, className, ...props }: LoginFormProps) {
  const [isPending, startTransition] = useTransition()
  const [fatalError, setFatalError] = useState<Error | null>(null)
  const buttonCeremonyActive = useRef(false)

  const { handleSubmit, control, setError, formState } = useForm<
    z.infer<typeof loginFormSchema>
  >({
    mode: "onChange",
    defaultValues: {
      email: "",
    },
    resolver: zodResolver(loginFormSchema),
    resetOptions: {
      keepDirtyValues: true,
    },
    progressive: true,
    criteriaMode: "all",
    shouldFocusError: true,
  })

  const onSubmit = async (data: z.infer<typeof loginFormSchema>) => {
    try {
      const response = await login(data)

      if (!response.success) {
        switch (response.error) {
          case LoginError.USER_NOT_FOUND:
            setError("email", {
              type: "server",
              message: "Nie znaleziono użytkownika o podanym adresie email",
            })
            break
          case LoginError.VALIDATION_ERROR:
            setError("email", {
              type: "server",
              message: "Nieprawidłowy adres email",
            })
            break
          default:
            toast.add({
              title: "Błąd logowania",
              description:
                "Nie udało się zalogować. Spróbuj ponownie lub skontaktuj się z administratorem.",
              type: "error",
            })
        }
      }
    } catch (error) {
      setFatalError(error as Error)
    }
  }

  const [autofillRestartKey, setAutofillRestartKey] = useState(0)

  useEffect(() => {
    let isMounted = true

    async function setupAutoFill() {
      if (!window.isSecureContext || !isMounted) {
        return
      }

      try {
        const supportsAutofill = await browserSupportsWebAuthnAutofill()

        if (!isMounted || buttonCeremonyActive.current) {
          return
        }

        if (!supportsAutofill) {
          toast.add({
            title: "Błąd logowania natychmiastowego",
            description:
              "Twoja przeglądarka nie obsługuje logowania natychmiastowego.",
            type: "warn",
          })
          return
        }

        const options = await getLoginOptions()

        const credential = await startAuthentication({
          useBrowserAutofill: true,
          optionsJSON: options,
        })

        const response = await checkCredential(credential)

        if (!isMounted || buttonCeremonyActive.current) {
          return
        }

        if (!response.success && isMounted && !buttonCeremonyActive.current) {
          showCredentialError(response.error)
          setAutofillRestartKey((key) => key + 1)
        }
      } catch (error) {
        if (
          error instanceof WebAuthnError &&
          error.code === "ERROR_CEREMONY_ABORTED"
        ) {
          return
        }

        if (!(error instanceof WebAuthnError)) {
          setFatalError(error as Error)
          return
        }

        toast.add({
          title: "Błąd logowania natychmiastowego",
          description: "Nie udało się dokończyć logowania. Spróbuj ponownie.",
          type: "error",
        })
      }
    }

    void setupAutoFill()
    return () => {
      isMounted = false
      WebAuthnAbortService.cancelCeremony()
    }
  }, [autofillRestartKey])

  const onWebAuthN = () => {
    buttonCeremonyActive.current = true
    WebAuthnAbortService.cancelCeremony()
    startTransition(async () => {
      if (!window.isSecureContext) {
        toast.add({
          title: "Błąd logowania natychmiastowego",
          description:
            "Logowanie natychmiastowe wymaga HTTPS lub adresu http://localhost.",
          type: "error",
        })
        return
      }

      if (!browserSupportsWebAuthn()) {
        toast.add({
          title: "Błąd logowania natychmiastowego",
          description: "Twoja przeglądarka nie obsługuje WebAuthN.",
          type: "error",
        })
        return
      }

      try {
        const options = await getLoginOptions()

        const credential = await startAuthentication({
          optionsJSON: options,
        })

        if (!buttonCeremonyActive.current) {
          return
        }

        const response = await checkCredential(credential)

        if (buttonCeremonyActive.current && !response.success) {
          showCredentialError(response.error)
        }
      } catch (error) {
        if (
          error instanceof WebAuthnError &&
          error.code === "ERROR_CEREMONY_ABORTED"
        ) {
          return
        }

        if (!(error instanceof WebAuthnError)) {
          setFatalError(error as Error)
          return
        }

        toast.add({
          title: "Błąd logowania natychmiastowego",
          description: "Nie udało się dokończyć logowania. Spróbuj ponownie.",
          type: "error",
        })
      } finally {
        buttonCeremonyActive.current = false
        setAutofillRestartKey((key) => key + 1)
      }
    })
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
            <h1 className="text-xl font-bold">Logowanie</h1>
            <FieldDescription>
              Nie masz konta? <Link href="/signup">Zarejestruj się</Link>
            </FieldDescription>
          </div>
          <Controller
            name="email"
            control={control}
            render={({ field, fieldState, formState }) => (
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <InputGroup>
                  <InputGroupAddon>
                    <SquareUserIcon />
                  </InputGroupAddon>
                  <InputGroupInput
                    {...field}
                    id="email"
                    placeholder="uczen@tm1.edu.pl"
                    aria-invalid={fieldState.invalid}
                    autoComplete="username webauthn"
                    disabled={formState.isSubmitting || isPending}
                  />
                </InputGroup>
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
          <Field>
            <Button
              type="submit"
              disabled={formState.isSubmitting || isPending}
            >
              {formState.isSubmitting ? (
                <>
                  <Spinner /> Logowanie...
                </>
              ) : (
                <>
                  <LogInIcon />
                  Zaloguj się
                </>
              )}
            </Button>
          </Field>
          <FieldSeparator>LUB</FieldSeparator>
          <Field>
            <Button
              type="button"
              disabled={formState.isSubmitting || isPending}
              onClick={onWebAuthN}
            >
              {isPending ? (
                <>
                  <Spinner /> Logowanie natychmiastowe...
                </>
              ) : (
                <>
                  <UserKeyIcon />
                  Użyj logowania natychmiastowego
                </>
              )}
            </Button>
          </Field>
        </FieldGroup>
      </form>
      <FieldDescription className="text-center">
        Poprzez kliknięcie przycisku &ldquo;Zaloguj się&rdquo; akceptujesz{" "}
        <a href="#">Regulamin</a> oraz <a href="#">Politykę Prywatności</a>.
      </FieldDescription>
    </div>
  )
}
