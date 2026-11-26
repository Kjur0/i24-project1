"use client"

import { useActionState, useState } from "react"

import {
  deleteAccount,
  updateProfile,
  type SettingsActionState,
} from "@/app/(main)/settings/actions"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
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
import { TriangleAlertIcon } from "lucide-react"

const initialState: SettingsActionState = { status: "idle" }

type ProfileSettingsProps = {
  username: string
  avatar: string
}

function DeleteAccountDialog() {
  const [open, setOpen] = useState(false)
  const [state, formAction, isPending] = useActionState(
    deleteAccount,
    initialState
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="destructive" />}>
        Usuń konto
      </DialogTrigger>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Trwale usunąć konto?</DialogTitle>
          <DialogDescription>
            Tej operacji nie można cofnąć. Konto, klucze dostępu, sesje, Twoje
            wpisy i komentarze zostaną trwale usunięte.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="delete-confirmation">
                Wpisz USUŃ, aby potwierdzić
              </FieldLabel>
              <Input
                id="delete-confirmation"
                name="confirmation"
                autoComplete="off"
                required
              />
              <FieldDescription>
                Usuniemy także komentarze dodane przez Ciebie do cudzych wpisów.
              </FieldDescription>
            </Field>
            {state.status === "error" && (
              <FieldError>{state.message}</FieldError>
            )}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isPending}
              >
                Anuluj
              </Button>
              <Button type="submit" variant="destructive" disabled={isPending}>
                {isPending ? "Usuwanie..." : "Usuń konto i wszystkie dane"}
              </Button>
            </DialogFooter>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function ProfileSettings({ username, avatar }: ProfileSettingsProps) {
  const [state, formAction, isPending] = useActionState(
    updateProfile,
    initialState
  )

  return (
    <section className="flex flex-col gap-6 p-4 md:p-8">
      <div>
        <h2 className="text-xl font-semibold">Profil</h2>
        <p className="text-sm text-muted-foreground">
          Zmień nazwę użytkownika i zdjęcie profilowe.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dane profilu</CardTitle>
          <CardDescription>
            Zaktualizuj nazwę użytkownika i adres URL zdjęcia profilowego.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="username">Nazwa użytkownika</FieldLabel>
                <Input
                  id="username"
                  name="username"
                  defaultValue={username}
                  autoComplete="nickname"
                  minLength={3}
                  maxLength={50}
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="avatar">Adres URL avatara</FieldLabel>
                <Input
                  id="avatar"
                  name="avatar"
                  type="url"
                  defaultValue={avatar}
                  placeholder="https://example.com/avatar.png"
                  autoComplete="url"
                  maxLength={2048}
                  aria-describedby="avatar-description"
                />
                <FieldDescription id="avatar-description">
                  Pozostaw puste, aby usunąć obecny avatar.
                </FieldDescription>
              </Field>
              <Field>
                {state.status === "error" && (
                  <FieldError>{state.message}</FieldError>
                )}
                {state.status === "success" && (
                  <p role="status" className="text-sm text-muted-foreground">
                    {state.message}
                  </p>
                )}
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Zapisywanie..." : "Zapisz zmiany"}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Usuń konto</CardTitle>
          <CardDescription>
            Trwale usuń konto i powiązane z nim dane.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-start gap-4">
            <Alert variant="destructive">
              <TriangleAlertIcon />
              <AlertTitle>To działanie jest nieodwracalne</AlertTitle>
              <AlertDescription>
                Usuniemy profil, passkeys, sesje, Twoje wpisy oraz komentarze.
              </AlertDescription>
            </Alert>
            <DeleteAccountDialog />
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
