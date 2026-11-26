"use client"

import { startTransition, useActionState, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import {
  deleteAccount,
  updateProfile,
  type SettingsActionState,
} from "@/app/(main)/settings/actions"

import * as z from "zod"
import { profileSettingsSchema } from "@/components/settings/schemas"

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
            {state.status === "error" && (
              <Field>
                <FieldError>{state.message}</FieldError>
              </Field>
            )}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isPending}
                autoFocus
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
  const { control, handleSubmit, formState } = useForm<
    z.infer<typeof profileSettingsSchema>
  >({
    mode: "onTouched",
    resolver: zodResolver(profileSettingsSchema),
    defaultValues: { username, avatar },
    shouldFocusError: true,
  })

  const onSubmit = handleSubmit((values) => {
    const formData = new FormData()
    formData.set("username", values.username)
    formData.set("avatar", values.avatar)
    startTransition(() => formAction(formData))
  })

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
          <form onSubmit={onSubmit} aria-label="Zmień dane profilu">
            <FieldGroup>
              <Controller
                name="username"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="username">
                      Nazwa użytkownika
                    </FieldLabel>
                    <Input
                      {...field}
                      id="username"
                      autoComplete="nickname"
                      minLength={3}
                      maxLength={50}
                      aria-invalid={fieldState.invalid}
                      required
                    />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
              <Controller
                name="avatar"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="avatar">Adres URL avatara</FieldLabel>
                    <Input
                      {...field}
                      id="avatar"
                      type="url"
                      placeholder="https://example.com/avatar.png"
                      autoComplete="url"
                      maxLength={2048}
                      aria-invalid={fieldState.invalid}
                      aria-describedby="avatar-description"
                    />
                    <FieldDescription id="avatar-description">
                      Pozostaw puste, aby usunąć obecny avatar.
                    </FieldDescription>
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
              <Field>
                {state.status === "error" && (
                  <FieldError>{state.message}</FieldError>
                )}
                {state.status === "success" && (
                  <p role="status" className="text-sm text-muted-foreground">
                    {state.message}
                  </p>
                )}
                <Button
                  type="submit"
                  disabled={isPending || formState.isSubmitting}
                >
                  {isPending || formState.isSubmitting
                    ? "Zapisywanie..."
                    : "Zapisz zmiany"}
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
