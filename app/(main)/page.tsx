import { Fragment } from "react"

import { type comment } from "@/types/post"

import { CreatePostDialog } from "@/components/create-content-dialog"
import { Post } from "@/components/post"
import { ItemGroup, ItemSeparator } from "@/components/ui/item"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { getCurrentUser } from "@/lib/auth"
import { posts } from "@/lib/db"

const COMMENTS_PER_PAGE = 30

type PageProps = {
  searchParams: Promise<{ page?: string | string[] }>
}

function getPageHref(page: number) {
  return page === 1 ? "/" : `/?page=${page}`
}

function getPageNumbers(page: number, totalPages: number) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const pages: Array<number | "ellipsis"> = [1]

  if (page > 3) pages.push("ellipsis")

  for (
    let pageNumber = Math.max(2, page - 1);
    pageNumber <= Math.min(totalPages - 1, page + 1);
    pageNumber++
  ) {
    pages.push(pageNumber)
  }

  if (page < totalPages - 2) pages.push("ellipsis")

  pages.push(totalPages)
  return pages
}

export default async function Page({ searchParams }: PageProps) {
  const [{ page: requestedPage }, currentUser, allPosts] = await Promise.all([
    searchParams,
    getCurrentUser(),
    posts.find({}).sort({ createdAt: -1 }).toArray(),
  ])
  const comments = allPosts.flatMap((post) =>
    (post.comments ?? []).map((comment, index) => ({
      postId: post._id.toString(),
      comment,
      index,
    }))
  )
  const totalPages = Math.max(1, Math.ceil(comments.length / COMMENTS_PER_PAGE))
  const rawPage = Array.isArray(requestedPage)
    ? requestedPage[0]
    : requestedPage
  const parsedPage = rawPage && /^\d+$/.test(rawPage) ? Number(rawPage) : 1
  const page =
    Number.isSafeInteger(parsedPage) && parsedPage > 0
      ? Math.min(parsedPage, totalPages)
      : 1
  const pageStart = (page - 1) * COMMENTS_PER_PAGE
  const pageComments = comments.slice(pageStart, pageStart + COMMENTS_PER_PAGE)
  const visibleCommentsByPostId = new Map<
    string,
    Array<{ comment: comment; index: number }>
  >()

  for (const { postId, comment, index } of pageComments) {
    const visibleComments = visibleCommentsByPostId.get(postId) ?? []
    visibleComments.push({ comment, index })
    visibleCommentsByPostId.set(postId, visibleComments)
  }

  const pageNumbers = getPageNumbers(page, totalPages)

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold uppercase">Wpisy</h1>
        {currentUser && <CreatePostDialog />}
      </div>

      {allPosts.length > 0 ? (
        <ItemGroup>
          {allPosts.map((post, index) => {
            const postId = post._id.toString()

            return (
              <Fragment key={postId}>
                <Post
                  post={post}
                  postId={postId}
                  currentUserId={currentUser?.id}
                  comments={visibleCommentsByPostId.get(postId) ?? []}
                  totalComments={post.comments?.length ?? 0}
                />
                {index < allPosts.length - 1 && <ItemSeparator />}
              </Fragment>
            )
          })}
        </ItemGroup>
      ) : (
        <p className="py-12 text-center text-muted-foreground">
          Nie ma jeszcze żadnych wpisów.
        </p>
      )}

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                text="Poprzednia"
                href={page > 1 ? getPageHref(page - 1) : undefined}
                aria-disabled={page === 1}
                className={page === 1 ? "pointer-events-none" : ""}
              />
            </PaginationItem>
            {pageNumbers.map((pageNumber, index) => (
              <PaginationItem key={`${pageNumber}-${index}`}>
                {pageNumber === "ellipsis" ? (
                  <PaginationEllipsis />
                ) : (
                  <PaginationLink
                    href={getPageHref(pageNumber)}
                    isActive={pageNumber === page}
                    aria-label={`Go to page ${pageNumber}`}
                  >
                    {pageNumber}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                text="Następna"
                href={page < totalPages ? getPageHref(page + 1) : undefined}
                aria-disabled={page === totalPages}
                className={page === totalPages ? "pointer-events-none" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}
