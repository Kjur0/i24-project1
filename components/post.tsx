import type { post } from "@/types/post"

import { CreateCommentDialog } from "@/components/create-content-dialog"
import { DeleteContentDialog } from "@/components/delete-content-dialog"
import { EditContentDialog } from "@/components/edit-content-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ButtonGroup } from "@/components/ui/button-group"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import { Skeleton } from "@/components/ui/skeleton"
import { getUserById } from "@/lib/db"

type PostProps = {
  post: post
  postId?: string
  currentUserId?: string
}

export function PostSkeleton() {
  return (
    <div className="flex flex-col gap-4 border p-5">
      <div className="flex items-center gap-3">
        <Skeleton className="size-8" />
        <Skeleton className="h-4 w-40" />
      </div>
      <Skeleton className="h-5 w-2/3" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-4 w-28" />
    </div>
  )
}

export async function Post({ post, postId, currentUserId }: PostProps) {
  const user = await getUserById(post.author)
  const isAuthor = user?._id.toString() === currentUserId
  const commentsWithAuthors = await Promise.all(
    (post.comments ?? []).map(async (comment, index) => ({
      comment,
      index,
      author: await getUserById(comment.author),
    }))
  )

  return (
    <Item>
      <ItemMedia>
        <Avatar>
          <AvatarImage src={user?.avatar} alt={user?.username} />
          <AvatarFallback>
            {user?.username.substring(0, 2).toUpperCase() ?? "?"}
          </AvatarFallback>
        </Avatar>
      </ItemMedia>
      <ItemContent>
        <ItemTitle>{post.title}</ItemTitle>
        <ItemDescription>{post.content}</ItemDescription>
      </ItemContent>
      {(isAuthor || (postId && currentUserId)) && (
        <ItemActions>
          <ButtonGroup>
            {isAuthor && (
              <>
                {postId && (
                  <EditContentDialog
                    postId={postId}
                    title={post.title}
                    content={post.content}
                  />
                )}
                {postId && <DeleteContentDialog postId={postId} />}
              </>
            )}
            {postId && currentUserId && <CreateCommentDialog postId={postId} />}
          </ButtonGroup>
        </ItemActions>
      )}
      {(post.comments?.length ?? 0) > 0 && (
        <ItemFooter className="justify-start">
          <Collapsible>
            <CollapsibleTrigger>
              Komentarze ({post.comments?.length})
            </CollapsibleTrigger>
            <CollapsibleContent>
              {commentsWithAuthors.map(({ comment, index, author }) => {
                const isCommentAuthor = author?._id.toString() === currentUserId
                return (
                  <Item
                    key={`${comment.createdAt.toISOString()}-${comment.author.toString()}-${index}`}
                  >
                    <ItemMedia>
                      <Avatar>
                        <AvatarImage
                          src={author?.avatar}
                          alt={author?.username}
                        />
                        <AvatarFallback>
                          {author?.username.substring(0, 2).toUpperCase() ??
                            "?"}
                        </AvatarFallback>
                      </Avatar>
                    </ItemMedia>
                    <ItemContent>
                      {comment.title && <ItemTitle>{comment.title}</ItemTitle>}
                      <ItemDescription>{comment.content}</ItemDescription>
                    </ItemContent>
                    {isCommentAuthor && (
                      <ItemActions>
                        <ButtonGroup>
                          {postId && (
                            <EditContentDialog
                              postId={postId}
                              commentIndex={index}
                              title={comment.title}
                              content={comment.content}
                            />
                          )}
                          {postId && (
                            <DeleteContentDialog
                              postId={postId}
                              commentIndex={index}
                            />
                          )}
                        </ButtonGroup>
                      </ItemActions>
                    )}
                  </Item>
                )
              })}
            </CollapsibleContent>
          </Collapsible>
        </ItemFooter>
      )}
    </Item>
  )
}
