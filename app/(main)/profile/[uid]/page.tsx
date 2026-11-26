import Link from "next/link"
import { notFound } from "next/navigation"

import { Post } from "@/components/post"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { buttonVariants } from "@/components/ui/button"
import { ItemGroup, ItemSeparator } from "@/components/ui/item"
import { getCurrentUser } from "@/lib/auth"
import { getUserById, posts } from "@/lib/db"
import { ObjectId } from "mongodb"

type ProfilePageProps = {
  params: Promise<{ uid: string }>
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const [{ uid }, currentUser] = await Promise.all([params, getCurrentUser()])

  if (!/^[\da-f]{24}$/i.test(uid)) notFound()

  const profile = await getUserById(uid)
  if (!profile) notFound()

  const profileId = new ObjectId(uid)
  const profilePosts = await posts
    .find({ author: profileId })
    .sort({ createdAt: -1, _id: -1 })
    .toArray()

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-4">
      <header className="flex items-center gap-4 border-b pb-6">
        <Avatar className="size-16">
          <AvatarImage src={profile.avatar} alt={profile.username} />
          <AvatarFallback>
            {profile.username.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-xl font-semibold">{profile.username}</h1>
          <p className="text-sm text-muted-foreground">
            {profile.role === "admin"
              ? "Administrator"
              : profile.role === "moderator"
                ? "Moderator"
                : "Użytkownik"}
          </p>
        </div>
        {(currentUser?.role === "admin" ||
          currentUser?.role === "moderator") && (
          <Link
            href={`/dashboard/${uid}`}
            className={buttonVariants({
              variant: "outline",
              size: "sm",
              className: "ml-auto",
            })}
          >
            Otwórz panel moderacji
          </Link>
        )}
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold uppercase">Wpisy</h2>
        {profilePosts.length ? (
          <ItemGroup>
            {profilePosts.map((post, index) => {
              const postId = post._id.toString()
              return (
                <div key={postId}>
                  <Post
                    post={post}
                    postId={postId}
                    currentUserId={currentUser?.id}
                    currentUserRole={currentUser?.role}
                  />
                  {index < profilePosts.length - 1 && <ItemSeparator />}
                </div>
              )
            })}
          </ItemGroup>
        ) : (
          <p className="text-sm text-muted-foreground">
            Ten profil nie ma jeszcze żadnych wpisów.
          </p>
        )}
      </section>
    </div>
  )
}
