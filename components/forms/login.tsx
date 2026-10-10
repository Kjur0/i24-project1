"use client";

import { useEffect, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "cn";



import Link from "next/link";
import { useRouter } from "next/navigation";
import { browserSupportsWebAuthn, browserSupportsWebAuthnAutofill, startAuthentication } from "@simplewebauthn/browser";



import * as z from "zod";
import { formResponse, loginFormSchema } from "@/components/forms/schemas";



import Logo from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldSeparator } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { checkCredential, getLoginOptions } from "@/lib/authn";
import { LogInIcon, SquareUserIcon, UserKeyIcon } from "lucide-react";





type LoginFormProps = {
  login: (data: z.infer<typeof loginFormSchema>) => Promise<formResponse>
} & React.ComponentProps<"div">

export function LoginForm({ login, className, ...props }: LoginFormProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const { handleSubmit, control, setError, formState } = useForm<
    z.infer<typeof loginFormSchema>
  >({
    mode: "onTouched",
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
    const response = await login(data)

    if (!response.success) {
      setError("email", {
        type: "server",
        message: response.error,
      })
    }
  }

  useEffect(() => {
    let isMounted = true

    async function setupAutoFill() {
      if (!window.isSecureContext || !isMounted) {
        return
      }

      if (!browserSupportsWebAuthnAutofill() || !isMounted) {
        toast.add({
          title: "Błąd logowania natychmiastowego",
          description:
            "Twoja przeglądarka nie obsługuje logowania natychmiastowego.",
          type: "warn",
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
        useBrowserAutofill: true,
        optionsJSON: init.options,
      })

      const response = await checkCredential(credential)

      if ("error" in response) {
        toast.add({
          title: "Błąd logowania natychmiastowego",
          description: response.error,
          type: "error",
        })
        return
      }
    }

    setupAutoFill()
    return () => {
      isMounted = false
    }
  }, [router])

  const onWebAuthN = () => {
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

      if ("error" in response) {
        toast.add({
          title: "Błąd logowania natychmiastowego",
          description: response.error,
          type: "error",
        })
        return
      }
    })
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <Logo vertical />
            <h1 className="text-xl font-bold">Logowanie</h1>
            <FieldDescription className="text-center">
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
                    autoComplete="email webauthn"
                    disabled={formState.isSubmitting}
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
      <FieldDescription className="px-6 text-center">
        Poprzez kliknięcie przycisku &ldquo;Zaloguj się&rdquo; akceptujesz{" "}
        <a href="#">Regulamin</a> oraz <a href="#">Politykę Prywatności</a>.
      </FieldDescription>
    </div>
  )
}