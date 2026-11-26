import Link from "next/link"
import { redirect } from "next/navigation"

import { Post } from "@/components/post"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item"
import { getCurrentUser } from "@/lib/auth"
import { posts } from "@/lib/db"
import { ObjectId } from "mongodb"

export default async function Dashboard() {
  const currentUser = await getCurrentUser()

  if (!currentUser) redirect("/login")

  const userId = new ObjectId(currentUser.id)
  const userPosts = await posts
    .find({
      $or: [{ author: userId }, { "comments.author": userId }],
    })
    .sort({ createdAt: -1, _id: -1 })
    .toArray()

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-4">
      <header className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold uppercase">Moje konto</h1>
        <p className="text-sm text-muted-foreground">
          Twoje wpisy i wpisy, które komentowałeś.
        </p>
      </header>

      {userPosts.length > 0 ? (
        <div className="flex flex-col gap-6">
          {userPosts.map((post) => {
            const postId = post._id.toString()
            const isAuthor = post.author.equals(userId)
            const ownComments = (post.comments ?? []).filter((comment) =>
              comment.author.equals(userId)
            )

            return (
              <section
                key={postId}
                className="flex flex-col gap-3 border-b pb-6 last:border-b-0"
              >
                <p className="text-sm font-medium text-muted-foreground">
                  {isAuthor ? "Twój wpis" : "Wpis, który skomentowałeś"}
                </p>
                <Post
                  post={post}
                  postId={postId}
                  currentUserId={currentUser.id}
                />
                {ownComments.map((comment, index) => (
                  <Item
                    key={`${comment.createdAt.toISOString()}-${index}`}
                    variant="muted"
                    size="sm"
                    className="min-w-0"
                  >
                    <ItemContent className="min-w-0">
                      <ItemTitle>Twój komentarz</ItemTitle>
                      <ItemDescription className="wrap-anywhere">
                        {comment.title && (
                          <span className="font-medium">{comment.title}: </span>
                        )}
                        {comment.content}
                      </ItemDescription>
                    </ItemContent>
                  </Item>
                ))}
              </section>
            )
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 py-12 text-center">
          <p className="text-muted-foreground">
            Nie masz jeszcze żadnych wpisów ani komentarzy.
          </p>
          <Link href="/" className="text-sm font-medium underline">
            Przeglądaj wpisy
          </Link>
        </div>
      )}
    </div>
  )
}
