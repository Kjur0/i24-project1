"use client"

import { startTransition, useActionState, useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import Link from "next/link"

import {
  changeEmail,
  removePasskey,
  renamePasskey,
  revokeSession,
  type EmailChangeActionState,
  type SettingsActionState,
} from "@/app/(main)/settings/actions"

import * as z from "zod"
import { otpFormSchema } from "@/components/forms/schemas"
import {
  emailChangeRequestSchema,
  passkeyNameFormSchema,
} from "@/components/settings/schemas"

import { Button, buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { KeyRoundIcon, PlusIcon, Trash2Icon } from "lucide-react"

const initialState: SettingsActionState = { status: "idle" }
const initialEmailChangeState: EmailChangeActionState = { status: "idle" }

export type SettingsPasskey = {
  id: string
  name: string
  createdAt: number
}

export type SettingsSession = {
  id: string
  createdAt: number
  expiresAt: number
  isCurrent: boolean
}

type TemporalApi = {
  Instant: {
    fromEpochMilliseconds: (epochMilliseconds: number) => {
      toZonedDateTimeISO: (timeZone: string) => {
        toLocaleString: (
          locales?: Intl.LocalesArgument,
          options?: Intl.DateTimeFormatOptions
        ) => string
      }
    }
  }
}

function formatSettingsDate(value: number) {
  const options: Intl.DateTimeFormatOptions = {
    dateStyle: "medium",
    timeStyle: "short",
  }
  const temporal = (
    globalThis as typeof globalThis & { Temporal?: TemporalApi }
  ).Temporal

  if (temporal) {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone

    return temporal.Instant.fromEpochMilliseconds(value)
      .toZonedDateTimeISO(timeZone)
      .toLocaleString(undefined, options)
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    throw new RangeError("Invalid settings timestamp.")
  }

  return new Intl.DateTimeFormat(undefined, options).format(date)
}

function LocalDateTime({ value }: { value: number }) {
  const [display, setDisplay] = useState({ value, text: "—" })

  useEffect(() => {
    let text = "—"

    try {
      text = formatSettingsDate(value)
    } catch (error) {
      console.error("Unable to format settings timestamp.", error)
    }

    const frame = window.requestAnimationFrame(() => {
      setDisplay({ value, text })
    })

    return () => window.cancelAnimationFrame(frame)
  }, [value])

  return <time>{display.value === value ? display.text : "—"}</time>
}

function EmailChangeCard({ email }: { email: string }) {
  const [state, formAction, isPending] = useActionState(
    changeEmail,
    initialEmailChangeState
  )
  const requestForm = useForm<z.infer<typeof emailChangeRequestSchema>>({
    mode: "onTouched",
    resolver: zodResolver(emailChangeRequestSchema),
    defaultValues: { email: "" },
    shouldFocusError: true,
  })
  const verificationForm = useForm<z.infer<typeof otpFormSchema>>({
    mode: "onTouched",
    resolver: zodResolver(otpFormSchema),
    defaultValues: { otp: "" },
    shouldFocusError: true,
  })
  const currentEmail =
    state.status === "success"
      ? state.email
      : state.status === "idle"
        ? email
        : state.currentEmail || email
  const verificationEmail =
    state.status === "code_sent" || state.status === "verification_error"
      ? state.email
      : null
  const onRequestSubmit = requestForm.handleSubmit(({ email: newEmail }) => {
    const formData = new FormData()
    formData.set("step", "request")
    formData.set("email", newEmail)
    startTransition(() => formAction(formData))
  })
  const onVerificationSubmit = verificationForm.handleSubmit(({ otp }) => {
    if (!verificationEmail) return

    const formData = new FormData()
    formData.set("step", "verify")
    formData.set("email", verificationEmail)
    formData.set("otp", otp)
    startTransition(() => formAction(formData))
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Adres e-mail</CardTitle>
        <CardDescription>
          Ten adres jest powiązany z Twoim kontem i służy do logowania.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-1">
          <p className="font-medium">{currentEmail}</p>
          <p className="text-sm text-muted-foreground">
            Potwierdź nowy adres kodem weryfikacyjnym, zanim zostanie zapisany.
          </p>
        </div>
        <form
          onSubmit={onRequestSubmit}
          aria-label="Zażądaj zmiany adresu e-mail"
          className="mt-4"
        >
          <FieldGroup>
            <Controller
              name="email"
              control={requestForm.control}
              render={({ field, fieldState }) => (
                <Field
                  data-invalid={
                    fieldState.invalid || state.status === "request_error"
                  }
                >
                  <FieldLabel htmlFor="new-email">Nowy adres e-mail</FieldLabel>
                  <Input
                    {...field}
                    id="new-email"
                    type="email"
                    autoComplete="email"
                    maxLength={254}
                    aria-invalid={
                      fieldState.invalid || state.status === "request_error"
                    }
                    autoCapitalize="none"
                    spellCheck={false}
                    required
                  />
                  <FieldDescription>
                    Wpisz adres, do którego masz dostęp.
                  </FieldDescription>
                  <FieldError errors={[fieldState.error]} />
                  {state.status === "request_error" && (
                    <FieldError>{state.message}</FieldError>
                  )}
                </Field>
              )}
            />
            <Field>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Generowanie kodu..." : "Wyślij kod weryfikacyjny"}
              </Button>
            </Field>
          </FieldGroup>
        </form>

        {verificationEmail && (
          <form
            onSubmit={onVerificationSubmit}
            aria-label="Potwierdź zmianę adresu e-mail"
            className="mt-4"
          >
            <FieldGroup>
              <Controller
                name="otp"
                control={verificationForm.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="email-change-otp">
                      Kod weryfikacyjny
                    </FieldLabel>
                    <FieldDescription>
                      Wpisz ośmioznakowy kod dla {verificationEmail}.
                    </FieldDescription>
                    <Input
                      {...field}
                      id="email-change-otp"
                      type="text"
                      autoComplete="one-time-code"
                      maxLength={8}
                      pattern="[0-9]{6}wr"
                      aria-invalid={
                        fieldState.invalid ||
                        state.status === "verification_error"
                      }
                      autoCapitalize="none"
                      spellCheck={false}
                      required
                    />
                    <FieldError errors={[fieldState.error]} />
                    {state.status === "verification_error" && (
                      <FieldError>{state.message}</FieldError>
                    )}
                  </Field>
                )}
              />
              <Field>
                <Button
                  type="submit"
                  disabled={
                    isPending || verificationForm.formState.isSubmitting
                  }
                >
                  {isPending || verificationForm.formState.isSubmitting
                    ? "Weryfikowanie..."
                    : "Potwierdź nowy adres"}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        )}

        {state.status === "success" && (
          <p role="status" className="mt-4 text-sm text-muted-foreground">
            {state.message}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

function PasskeyItem({ passkey }: { passkey: SettingsPasskey }) {
  const renameAction = renamePasskey.bind(null, passkey.id)
  const [renameState, renameFormAction, isRenaming] = useActionState(
    renameAction,
    initialState
  )
  const renameForm = useForm<z.infer<typeof passkeyNameFormSchema>>({
    mode: "onTouched",
    resolver: zodResolver(passkeyNameFormSchema),
    defaultValues: { name: passkey.name },
    shouldFocusError: true,
  })
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const deleteAction = removePasskey.bind(null, passkey.id)
  const [deleteState, deleteFormAction, isDeleting] = useActionState(
    deleteAction,
    initialState
  )
  const onRenameSubmit = renameForm.handleSubmit(({ name }) => {
    const formData = new FormData()
    formData.set("name", name)
    startTransition(() => renameFormAction(formData))
  })

  return (
    <div className="flex flex-col gap-4 border p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <KeyRoundIcon aria-hidden="true" />
        <div className="min-w-0">
          <p className="truncate font-medium">{passkey.name}</p>
          <p className="text-sm text-muted-foreground">
            Dodano: <LocalDateTime value={passkey.createdAt} />
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <form
          onSubmit={onRenameSubmit}
          aria-label={`Zmień nazwę klucza ${passkey.name}`}
          className="flex flex-wrap items-end gap-2"
        >
          <Controller
            name="name"
            control={renameForm.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={`passkey-name-${passkey.id}`}>
                  Nazwa klucza
                </FieldLabel>
                <Input
                  {...field}
                  id={`passkey-name-${passkey.id}`}
                  autoComplete="off"
                  maxLength={80}
                  aria-invalid={fieldState.invalid}
                  required
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
          <Button type="submit" variant="outline" disabled={isRenaming}>
            {isRenaming ? "Zapisywanie..." : "Zmień nazwę"}
          </Button>
        </form>
        <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <DialogTrigger
            render={
              <Button
                variant="destructive"
                size="icon"
                aria-label={`Usuń klucz ${passkey.name}`}
              />
            }
          >
            <Trash2Icon aria-hidden="true" />
          </DialogTrigger>
          <DialogContent showCloseButton={false}>
            <DialogHeader>
              <DialogTitle>Usunąć klucz dostępu?</DialogTitle>
              <DialogDescription>
                Klucz „{passkey.name}” nie będzie już mógł służyć do logowania.
              </DialogDescription>
            </DialogHeader>
            <form action={deleteFormAction}>
              <FieldGroup>
                {deleteState.status === "error" && (
                  <FieldError>{deleteState.message}</FieldError>
                )}
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDeleteOpen(false)}
                    disabled={isDeleting}
                  >
                    Anuluj
                  </Button>
                  <Button
                    type="submit"
                    variant="destructive"
                    disabled={isDeleting}
                  >
                    {isDeleting ? "Usuwanie..." : "Usuń klucz"}
                  </Button>
                </DialogFooter>
              </FieldGroup>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      {renameState.status === "error" && (
        <p role="alert" className="text-sm text-destructive">
          {renameState.message}
        </p>
      )}
      {renameState.status === "success" && (
        <p role="status" className="text-sm text-muted-foreground">
          {renameState.message}
        </p>
      )}
    </div>
  )
}

function SessionItem({ session }: { session: SettingsSession }) {
  const revokeAction = revokeSession.bind(null, session.id)
  const [state, formAction, isPending] = useActionState(
    revokeAction,
    initialState
  )

  return (
    <div className="flex flex-col gap-3 border p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-medium">
          {session.isCurrent ? "Ta sesja" : "Aktywna sesja"}
        </p>
        <p className="text-sm text-muted-foreground">
          Rozpoczęto: <LocalDateTime value={session.createdAt} /> · Wygasa:{" "}
          <LocalDateTime value={session.expiresAt} />
        </p>
      </div>
      <form action={formAction}>
        <Button
          type="submit"
          variant="outline"
          disabled={isPending}
          aria-label={
            session.isCurrent ? "Wyloguj to urządzenie" : "Zakończ sesję"
          }
        >
          {isPending ? "Kończenie..." : "Zakończ sesję"}
        </Button>
      </form>
      {state.status === "error" && (
        <p role="alert" className="text-sm text-destructive">
          {state.message}
        </p>
      )}
    </div>
  )
}

export function LoginSettings({
  email,
  passkeys,
  sessions,
}: {
  email: string
  passkeys: SettingsPasskey[]
  sessions: SettingsSession[]
}) {
  return (
    <section className="flex flex-col gap-6 p-4 md:p-8">
      <div>
        <h2 className="text-xl font-semibold">Logowanie</h2>
        <p className="text-sm text-muted-foreground">
          Zarządzaj kluczami dostępu i aktywnymi sesjami.
        </p>
      </div>

      <EmailChangeCard email={email} />

      <Card>
        <CardHeader>
          <CardTitle>Klucze dostępu</CardTitle>
          <CardDescription>
            Loguj się szybciej i bezpieczniej za pomocą passkeys.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            {passkeys.length ? (
              <div className="flex flex-col gap-3">
                {passkeys.map((passkey) => (
                  <PasskeyItem
                    key={`${passkey.id}:${passkey.name}`}
                    passkey={passkey}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Nie masz jeszcze żadnych kluczy dostępu.
              </p>
            )}
            <Link href="/authn" className={buttonVariants()}>
              <PlusIcon data-icon="inline-start" aria-hidden="true" />
              Dodaj passkey
            </Link>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sesje</CardTitle>
          <CardDescription>
            Wyloguj urządzenia, na których nie chcesz już pozostawać zalogowany.
            Aplikacja nie zapisuje informacji o urządzeniu ani przeglądarce.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            {sessions.length ? (
              sessions.map((session) => (
                <SessionItem key={session.id} session={session} />
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                Nie znaleziono aktywnych sesji.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
