"use client"

import { useActionState, useState } from "react"

import {
  deleteManagedUser,
  sendUserOTP,
  updateManagedUser,
  type ManagementActionState,
} from "@/app/(main)/management-actions"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"

const initialState: ManagementActionState = { status: "idle" }

type ManagedUserFormProps = {
  userId: string
  username: string
  email?: string
  avatar: string
  role?: "user" | "moderator" | "admin"
  verified?: boolean
  isAdmin: boolean
  isSelf: boolean
}

function ActionMessage({ state }: { state: ManagementActionState }) {
  if (state.status === "idle") return null

  return (
    <p
      role={state.status === "error" ? "alert" : "status"}
      className={
        state.status === "error"
          ? "text-sm text-destructive"
          : "text-sm text-muted-foreground"
      }
    >
      {state.message}
    </p>
  )
}

export function ManagedUserForm({
  userId,
  username,
  email,
  avatar,
  role,
  verified,
  isAdmin,
  isSelf,
}: ManagedUserFormProps) {
  const [updateState, updateAction, isUpdating] = useActionState(
    updateManagedUser.bind(null, userId),
    initialState
  )
  const [otpState, otpAction, isSendingOTP] = useActionState(
    sendUserOTP.bind(null, userId),
    initialState
  )
  const [deleteState, deleteAction, isDeleting] = useActionState(
    deleteManagedUser.bind(null, userId),
    initialState
  )
  const [confirmDelete, setConfirmDelete] = useState(false)

  return (
    <div className="flex flex-col gap-8">
      <form action={updateAction} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor={`managed-username-${userId}`}>
            Nazwa użytkownika
          </label>
          <Input
            id={`managed-username-${userId}`}
            name="username"
            defaultValue={username}
            autoComplete="nickname"
            minLength={3}
            maxLength={50}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor={`managed-avatar-${userId}`}>Avatar URL</label>
          <Input
            id={`managed-avatar-${userId}`}
            name="avatar"
            type="url"
            defaultValue={avatar}
            maxLength={2048}
          />
        </div>

        {isAdmin && (
          <>
            <div className="flex flex-col gap-2">
              <label htmlFor={`managed-email-${userId}`}>Adres e-mail</label>
              <Input
                id={`managed-email-${userId}`}
                name="email"
                type="email"
                defaultValue={email}
                autoComplete="email"
                maxLength={254}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor={`managed-role-${userId}`}>Rola</label>
              <select
                id={`managed-role-${userId}`}
                name="role"
                defaultValue={role ?? "user"}
                className="h-10 border border-input bg-background px-3 text-sm"
                disabled={isSelf}
              >
                <option value="user">Użytkownik</option>
                <option value="moderator">Moderator</option>
                <option value="admin">Administrator</option>
              </select>
              {isSelf && (
                <input type="hidden" name="role" value={role ?? "user"} />
              )}
            </div>
            <label className="flex items-center justify-between gap-4 text-sm">
              <span>Weryfikacja</span>
              <Switch
                id={`managed-verified-${userId}`}
                name="verified"
                defaultChecked={verified ?? false}
                value="true"
                uncheckedValue="false"
              />
            </label>

            {!isSelf && (
              <fieldset className="flex flex-col gap-3 border p-4">
                <legend className="px-1 text-sm font-medium">
                  Zarządzanie dostępem
                </legend>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="clearSessions" />
                  Zakończ wszystkie sesje
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="clearPasskeys" />
                  Usuń wszystkie passkeys
                </label>
              </fieldset>
            )}
          </>
        )}

        <ActionMessage state={updateState} />
        <Button type="submit" disabled={isUpdating}>
          {isUpdating ? "Zapisywanie..." : "Zapisz zmiany"}
        </Button>
      </form>

      {isAdmin && (
        <div className="flex flex-col gap-4 border-t pt-6">
          <div>
            <h3 className="font-semibold">Kod jednorazowy</h3>
            <p className="text-sm text-muted-foreground">
              Wysyłka e-mail nie jest skonfigurowana; używana jest obecna
              obsługa kodów OTP aplikacji.
            </p>
          </div>
          <form action={otpAction} className="flex flex-col items-start gap-3">
            <ActionMessage state={otpState} />
            <Button type="submit" variant="outline" disabled={isSendingOTP}>
              {isSendingOTP ? "Generowanie..." : "Wygeneruj kod OTP"}
            </Button>
          </form>

          {!isSelf && (
            <div className="flex flex-col items-start gap-3 border-t pt-6">
              <h3 className="font-semibold text-destructive">Usuń konto</h3>
              {!confirmDelete ? (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setConfirmDelete(true)}
                >
                  Usuń użytkownika
                </Button>
              ) : (
                <form action={deleteAction} className="flex flex-col gap-3">
                  <p className="text-sm">
                    Konto, passkeys, sesje, wpisy i komentarze użytkownika
                    zostaną trwale usunięte.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isDeleting}
                      onClick={() => setConfirmDelete(false)}
                    >
                      Anuluj
                    </Button>
                    <Button
                      type="submit"
                      variant="destructive"
                      disabled={isDeleting}
                    >
                      {isDeleting ? "Usuwanie..." : "Potwierdź usunięcie"}
                    </Button>
                  </div>
                  <ActionMessage state={deleteState} />
                </form>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
