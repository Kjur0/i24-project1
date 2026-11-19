import { ItemGroup } from "@/components/ui/item"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

export default function Page() {
  const page = 1
  const maxPages = 10

  const getPages = (range: number) => {
    const pages: (number | "ellipsis")[] = []

    for (let pageNumber = 1; pageNumber <= maxPages; pageNumber++) {
      if (
        pageNumber === 1 ||
        pageNumber === maxPages ||
        Math.abs(pageNumber - page) <= range
      ) {
        pages.push(pageNumber)
      } else if (pages[pages.length - 1] !== "ellipsis") {
        pages.push("ellipsis")
      }
    }

    return pages
  }

  const mobilePages = getPages(1)
  const tabletPages = getPages(2)
  const desktopPages = getPages(3)

  return (
    <>
      <ItemGroup className="mt-20"></ItemGroup>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious text="Poprzednia" />
          </PaginationItem>
          {mobilePages.map((pageNumber, index) => (
            <PaginationItem
              key={`mobile-${pageNumber}-${index}`}
              className="md:hidden"
            >
              {pageNumber === "ellipsis" ? (
                <PaginationEllipsis />
              ) : (
                <PaginationLink isActive={pageNumber === page}>
                  {pageNumber}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}
          {tabletPages.map((pageNumber, index) => (
            <PaginationItem
              key={`tablet-${pageNumber}-${index}`}
              className="hidden md:flex lg:hidden"
            >
              {pageNumber === "ellipsis" ? (
                <PaginationEllipsis />
              ) : (
                <PaginationLink isActive={pageNumber === page}>
                  {pageNumber}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}
          {desktopPages.map((pageNumber, index) => (
            <PaginationItem
              key={`desktop-${pageNumber}-${index}`}
              className="hidden lg:flex"
            >
              {pageNumber === "ellipsis" ? (
                <PaginationEllipsis />
              ) : (
                <PaginationLink isActive={pageNumber === page}>
                  {pageNumber}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext text="Następna" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </>
  )
}
