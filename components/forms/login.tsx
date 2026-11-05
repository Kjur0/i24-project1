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
  const description =
    error === CredentialError.CHALLENGE_NOT_FOUND
      ? "Nie znaleziono wyzwania logowania. Spróbuj ponownie."
      : error === CredentialError.USER_NOT_FOUND
        ? "Nie znaleziono użytkownika dla tego klucza."
        : error === CredentialError.INVALID_CREDENTIAL
          ? "Ten klucz logowania jest nieprawidłowy."
          : error === CredentialError.VERIFICATION_FAILED
            ? "Nie udało się zweryfikować logowania. Spróbuj ponownie."
            : error === CredentialError.SESSION_EXPIRED
              ? "Sesja wygasła. Zaloguj się ponownie."
              : "Nie udało się zalogować przy użyciu klucza. Spróbuj ponownie."

  toast.add({
    title: "Błąd logowania natychmiastowego",
    description,
    type: "error",
  })
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
    startTransition(async () => {
      try {
        const response = await login(data)

        if (!response.success) {
          setError("email", {
            type: "server",
            message:
              response.error === LoginError.USER_NOT_FOUND
                ? "Nie znaleziono użytkownika o podanym adresie email"
                : "Nieprawidłowy adres email",
          })
        }
      } catch (error) {
        setFatalError(error instanceof Error ? error : new Error(String(error)))
      }
    })
  }

  const [autofillRestartKey, setAutofillRestartKey] = useState(0)

  useEffect(() => {
    let isMounted = true

    async function setupAutoFill() {
      if (!window.isSecureContext || !isMounted) {
        return
      }

      try {
        const [supportsAutofill, init] = await Promise.all([
          browserSupportsWebAuthnAutofill(),
          getLoginOptions(),
        ])

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

        if (!isMounted || buttonCeremonyActive.current) {
          return
        }

        if ("error" in init) {
          toast.add({
            title: "Błąd logowania natychmiastowego",
            description: init.error,
            type: "error",
          })
          return
        }

        const credential = await startAuthentication({
          useBrowserAutofill: true,
          optionsJSON: init.options,
        })

        const response = await checkCredential(credential)

        if (!response.success) {
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
          setFatalError(
            error instanceof Error ? error : new Error(String(error))
          )
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
    startTransition(async () => {
      try {
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

        const init = await getLoginOptions()

        if ("error" in init) {
          toast.add({
            title: "Błąd logowania natychmiastowego",
            description: init.error,
            type: "error",
          })
          return
        }

        const credential = await startAuthentication({
          optionsJSON: init.options,
        })

        const response = await checkCredential(credential)

        if (!response.success) {
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
          setFatalError(
            error instanceof Error ? error : new Error(String(error))
          )
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
