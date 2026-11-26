import { Fragment } from "react"

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

const POSTS_PER_PAGE = 30

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
  const [{ page: requestedPage }, currentUser, totalPosts] = await Promise.all([
    searchParams,
    getCurrentUser(),
    posts.countDocuments({}),
  ])
  const totalPages = Math.max(1, Math.ceil(totalPosts / POSTS_PER_PAGE))
  const rawPage = Array.isArray(requestedPage)
    ? requestedPage[0]
    : requestedPage
  const parsedPage = rawPage && /^\d+$/.test(rawPage) ? Number(rawPage) : 1
  const page =
    Number.isSafeInteger(parsedPage) && parsedPage > 0
      ? Math.min(parsedPage, totalPages)
      : 1
  const pagePosts = await posts
    .find({})
    .sort({ createdAt: -1, _id: -1 })
    .skip((page - 1) * POSTS_PER_PAGE)
    .limit(POSTS_PER_PAGE)
    .toArray()

  const pageNumbers = getPageNumbers(page, totalPages)

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold uppercase">Wpisy</h1>
        {currentUser && <CreatePostDialog />}
      </div>

      {pagePosts.length > 0 ? (
        <ItemGroup>
          {pagePosts.map((post, index) => {
            const postId = post._id.toString()

            return (
              <Fragment key={postId}>
                <Post
                  post={post}
                  postId={postId}
                  currentUserId={currentUser?.id}
                  currentUserRole={currentUser?.role}
                />
                {index < pagePosts.length - 1 && <ItemSeparator />}
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
