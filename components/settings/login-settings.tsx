"use client"

import { useActionState, useEffect, useState } from "react"

import Link from "next/link"

import {
  removePasskey,
  renamePasskey,
  revokeSession,
  type SettingsActionState,
} from "@/app/(main)/settings/actions"

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
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { KeyRoundIcon, PlusIcon, Trash2Icon } from "lucide-react"

const initialState: SettingsActionState = { status: "idle" }

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

function PasskeyItem({ passkey }: { passkey: SettingsPasskey }) {
  const renameAction = renamePasskey.bind(null, passkey.id)
  const [renameState, renameFormAction, isRenaming] = useActionState(
    renameAction,
    initialState
  )
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const deleteAction = removePasskey.bind(null, passkey.id)
  const [deleteState, deleteFormAction, isDeleting] = useActionState(
    deleteAction,
    initialState
  )

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
          action={renameFormAction}
          className="flex flex-wrap items-end gap-2"
        >
          <Field>
            <FieldLabel htmlFor={`passkey-name-${passkey.id}`}>
              Nazwa klucza
            </FieldLabel>
            <Input
              id={`passkey-name-${passkey.id}`}
              name="name"
              defaultValue={passkey.name}
              autoComplete="off"
              maxLength={80}
              required
            />
          </Field>
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

      <Card>
        <CardHeader>
          <CardTitle>Adres e-mail</CardTitle>
          <CardDescription>
            Ten adres jest powiązany z Twoim kontem i służy do logowania.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="font-medium">{email}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Zmiana adresu e-mail będzie dostępna po wdrożeniu weryfikacji kodem.
          </p>
        </CardContent>
      </Card>

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
