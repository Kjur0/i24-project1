import { redirect } from "next/navigation"

import {
  UsersDataTable,
  type AdminUserRow,
} from "@/components/admin/users-data-table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { getCurrentUser } from "@/lib/auth"
import { users } from "@/lib/db"

export default async function AdminPage() {
  const currentUser = await getCurrentUser()
  if (!currentUser) redirect("/login")
  if (currentUser.role !== "admin") redirect("/dashboard")

  const allUsers = await users
    .find(
      {},
      {
        projection: {
          username: 1,
          email: 1,
          role: 1,
          verified: 1,
          avatar: 1,
        },
      }
    )
    .sort({ username: 1, _id: 1 })
    .toArray()

  const userRows: AdminUserRow[] = allUsers.map((user) => ({
    id: user._id.toString(),
    username: user.username,
    email: user.email,
    role: user.role,
    verified: user.verified,
    avatar: user.avatar,
  }))

  return (
    <>
      <section className="mx-auto hidden w-full max-w-5xl flex-col gap-6 p-4 md:flex">
        <header>
          <h1 className="text-xl font-semibold uppercase">
            Panel administratora
          </h1>
          <p className="text-sm text-muted-foreground">
            Lista użytkowników i ich kont. Wybierz konto, aby zarządzać nim.
          </p>
        </header>
        <UsersDataTable users={userRows} currentUserId={currentUser.id} />
      </section>
      <div className="mx-auto w-full max-w-xl p-4 md:hidden">
        <Alert role="status">
          <AlertTitle>
            Panel administratora dostępny tylko na komputerze
          </AlertTitle>
          <AlertDescription>
            Otwórz tę stronę na większym ekranie, aby zarządzać kontami.
          </AlertDescription>
        </Alert>
      </div>
    </>
  )
}
