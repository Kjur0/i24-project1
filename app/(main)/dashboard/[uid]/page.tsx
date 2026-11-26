import Link from "next/link"
import { notFound, redirect } from "next/navigation"

import { ManagedUserForm } from "@/components/admin/managed-user-form"
import { CreatePostDialog } from "@/components/create-content-dialog"
import { Post } from "@/components/post"
import { Button, buttonVariants } from "@/components/ui/button"
import { getCurrentUser } from "@/lib/auth"
import { getUserById, posts } from "@/lib/db"
import { ObjectId } from "mongodb"

type UserDashboardProps = {
  params: Promise<{ uid: string }>
}

export default async function UserDashboard({ params }: UserDashboardProps) {
  const [{ uid }, currentUser] = await Promise.all([params, getCurrentUser()])
  if (!currentUser) redirect("/login")
  if (!/^[\da-f]{24}$/i.test(uid)) notFound()

  const isSelf = uid === currentUser.id
  const canManage =
    currentUser.role === "admin" || currentUser.role === "moderator"

  if (!isSelf && !canManage) redirect("/dashboard")

  const profile = await getUserById(uid)
  if (!profile) notFound()

  const userId = new ObjectId(uid)
  const userPosts = await posts
    .find({
      $or: [{ author: userId }, { "comments.author": userId }],
    })
    .sort({ createdAt: -1, _id: -1 })
    .toArray()

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-4">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold uppercase">
            {isSelf ? "Moje konto" : `Panel moderacji: ${profile.username}`}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isSelf
              ? "Twoje wpisy i wpisy, które komentowałeś."
              : "Aktywność i dostępne działania dla tego użytkownika."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/profile/${uid}`}>
            <Button variant="outline" size="sm">
              Zobacz profil
            </Button>
          </Link>
          {currentUser.role === "admin" && (
            <Link
              href="/admin"
              className={buttonVariants({
                variant: "outline",
                size: "sm",
                className: "max-md:hidden",
              })}
            >
              Powrót do panelu administratora
            </Link>
          )}
        </div>
      </header>

      {canManage && (
        <section className="flex flex-col gap-4 border p-5">
          <div>
            <h2 className="text-lg font-semibold">Zarządzaj użytkownikiem</h2>
            <p className="text-sm text-muted-foreground">
              {currentUser.role === "admin"
                ? "Edytuj konto, dostęp i uprawnienia."
                : "Moderatorzy mogą zmienić nazwę użytkownika i avatar."}
            </p>
          </div>
          <ManagedUserForm
            userId={uid}
            username={profile.username}
            email={currentUser.role === "admin" ? profile.email : undefined}
            avatar={profile.avatar ?? ""}
            role={currentUser.role === "admin" ? profile.role : undefined}
            verified={
              currentUser.role === "admin" ? profile.verified : undefined
            }
            isAdmin={currentUser.role === "admin"}
            isSelf={isSelf}
          />
        </section>
      )}

      {isSelf && (
        <div className="flex flex-wrap gap-2">
          <CreatePostDialog />
          <Link href="/settings/profile">
            <Button variant="outline" size="sm">
              Ustawienia profilu
            </Button>
          </Link>
        </div>
      )}

      <section className="flex flex-col gap-6">
        <h2 className="text-sm font-semibold uppercase">Aktywność</h2>
        {userPosts.length ? (
          userPosts.map((post) => {
            const postId = post._id.toString()
            return (
              <Post
                key={postId}
                post={post}
                postId={postId}
                currentUserId={currentUser.id}
                currentUserRole={currentUser.role}
              />
            )
          })
        ) : (
          <p className="text-sm text-muted-foreground">
            Nie znaleziono wpisów ani komentarzy użytkownika.
          </p>
        )}
      </section>
    </div>
  )
}
