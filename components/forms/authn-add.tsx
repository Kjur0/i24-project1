"use client"

import { cn } from "@/lib/utils"
import Logo from "@/components/logo"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Button } from "@/components/ui/button"
import { LogInIcon, UserKeyIcon } from "lucide-react"
import { useRouter } from "next/dist/client/components/navigation"
import { authnAddFormSchema } from "@/components/forms/schemas"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@/components/ui/input"
import { useForm, Controller } from "react-hook-form"
import { Spinner } from "../ui/spinner"
import { startTransition } from "react"
import { getRegistrationOptions, sendCredential } from "@/lib/authn"
import { startRegistration } from "@simplewebauthn/browser"

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
  const onSubmit = (data: z.infer<typeof authnAddFormSchema>) => {
    startTransition(async () => {
      try {
        const init = await getRegistrationOptions()

        const credential = await startRegistration({ optionsJSON: init })

        await sendCredential(credential, data.name)
      } catch (error) {
        setError("name", {
          type: "manual",
          message: error instanceof Error ? error.message : "Nieznany błąd",
        })
      }
    })
  }
  const onSkip = () => {
    router.push("/")
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
                <Input
                  {...field}
                  id="name"
                  placeholder="Windows Hello"
                  aria-invalid={fieldState.invalid}
                  autoComplete="off"
                  disabled={fieldState.isValidating}
                />
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
