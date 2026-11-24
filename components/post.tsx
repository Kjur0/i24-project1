import type { post } from "@/types/post"

import { PostDialog } from "@/components/post-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
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
import { MessageSquarePlusIcon, SquarePenIcon, Trash2Icon } from "lucide-react"

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
    <PostDialog
      detail={{
        title: post.title,
        content: post.content,
        authorName: user?.username,
        authorAvatar: user?.avatar,
        isAuthor,
        comments: commentsWithAuthors.map(({ comment, index, author }) => ({
          key: `${comment.createdAt.toISOString()}-${comment.author.toString()}-${index}`,
          index,
          createdAt: comment.createdAt.getTime(),
          title: comment.title,
          content: comment.content,
          authorName: author?.username,
          authorAvatar: author?.avatar,
          isAuthor: author?._id.toString() === currentUserId,
        })),
      }}
      postId={postId}
      currentUserId={currentUserId}
    >
      <Item>
        <ItemMedia>
          <Avatar>
            <AvatarImage src={user?.avatar} alt={user?.username} />
            <AvatarFallback>
              {user?.username.substring(0, 2).toUpperCase() ?? "?"}
            </AvatarFallback>
          </Avatar>
        </ItemMedia>
        <ItemContent
          data-post-dialog-open=""
          role="button"
          tabIndex={0}
          aria-haspopup="dialog"
          className="cursor-pointer"
        >
          <ItemTitle>{post.title}</ItemTitle>
          <ItemDescription>{post.content}</ItemDescription>
        </ItemContent>
        {postId && (isAuthor || currentUserId) && (
          <ItemActions>
            <ButtonGroup>
              {isAuthor && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    aria-label="Edytuj wpis"
                    data-post-dialog-action="post-edit"
                  >
                    <SquarePenIcon />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    aria-label="Usuń wpis"
                    data-post-dialog-action="post-delete"
                  >
                    <Trash2Icon />
                  </Button>
                </>
              )}
              {currentUserId && (
                <Button type="button" size="sm" data-post-dialog-action="view">
                  <MessageSquarePlusIcon />
                  Dodaj komentarz
                </Button>
              )}
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
                  const isCommentAuthor =
                    author?._id.toString() === currentUserId
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
                      <ItemContent
                        data-post-dialog-open=""
                        role="button"
                        tabIndex={0}
                        aria-haspopup="dialog"
                        className="cursor-pointer"
                      >
                        {comment.title && (
                          <ItemTitle>{comment.title}</ItemTitle>
                        )}
                        <ItemDescription>{comment.content}</ItemDescription>
                      </ItemContent>
                      {postId && isCommentAuthor && (
                        <ItemActions>
                          <ButtonGroup>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon-xs"
                              aria-label="Edytuj komentarz"
                              data-post-dialog-action="comment-edit"
                              data-comment-index={index}
                            >
                              <SquarePenIcon />
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon-xs"
                              aria-label="Usuń komentarz"
                              data-post-dialog-action="comment-delete"
                              data-comment-index={index}
                            >
                              <Trash2Icon />
                            </Button>
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
    </PostDialog>
  )
}
