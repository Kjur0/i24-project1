"use client"

import { useMemo, useState } from "react"

import Link from "next/link"

import {
  columnFilteringFeature,
  columnVisibilityFeature,
  createColumnHelper,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_basic,
  sortFn_text,
  tableFeatures,
  useTable,
  type SortingState,
} from "@tanstack/react-table"

import { ManagedUserForm } from "@/components/admin/managed-user-form"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  ArrowUpDownIcon,
  Columns3Icon,
  FileUserIcon,
  ListFilterIcon,
  UserCogIcon,
} from "lucide-react"

export type AdminUserRow = {
  id: string
  username: string
  email: string
  role: "user" | "moderator" | "admin"
  verified: boolean
  avatar?: string
}

const roleLabels: Record<AdminUserRow["role"], string> = {
  user: "Użytkownik",
  moderator: "Moderator",
  admin: "Administrator",
}

const roleFilterOptions = [
  { value: "all", label: "Wszystkie role" },
  { value: "user", label: "Użytkownicy" },
  { value: "moderator", label: "Moderatorzy" },
  { value: "admin", label: "Administratorzy" },
]

const verificationFilterOptions = [
  { value: "all", label: "Wszyscy" },
  { value: "verified", label: "Zweryfikowani" },
  { value: "unverified", label: "Niezweryfikowani" },
]

const columnLabels: Record<string, string> = {
  username: "Użytkownik",
  email: "Adres e-mail",
  role: "Rola",
  verified: "Weryfikacja",
}

const features = tableFeatures({
  columnFilteringFeature,
  columnVisibilityFeature,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSortingFeature,
  filteredRowModel: createFilteredRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  sortedRowModel: createSortedRowModel(),
  sortFns: {
    alphanumeric: sortFn_alphanumeric,
    basic: sortFn_basic,
    text: sortFn_text,
  },
})

const columnHelper = createColumnHelper<typeof features, AdminUserRow>()

type FilterMenuProps = {
  label: string
  value: string
  options: { value: string; label: string }[]
  onValueChange: (value: string) => void
}

function FilterMenu({ label, value, options, onValueChange }: FilterMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={label}
          />
        }
      >
        <ListFilterIcon aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel>{label}</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={value} onValueChange={onValueChange}>
            {options.map((option) => (
              <DropdownMenuRadioItem key={option.value} value={option.value}>
                {option.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function sortableHeader(
  column: {
    getIsSorted: () => false | "asc" | "desc"
    toggleSorting: (desc?: boolean) => void
  },
  label: string
) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      {label}
      <ArrowUpDownIcon data-icon="inline-end" aria-hidden="true" />
    </Button>
  )
}

function UserManagementSheet({
  user,
  currentUserId,
}: {
  user: AdminUserRow
  currentUserId: string
}) {
  const isSelf = user.id === currentUserId

  return (
    <Tooltip>
      <Sheet>
        <SheetTrigger
          render={
            <TooltipTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  aria-label={`Zarządzaj użytkownikiem ${user.username}`}
                />
              }
            />
          }
        >
          <UserCogIcon aria-hidden="true" />
        </SheetTrigger>
        <SheetContent side="right" className="w-full sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>Zarządzaj użytkownikiem</SheetTitle>
            <SheetDescription>
              Edytuj konto użytkownika {user.username}.
            </SheetDescription>
          </SheetHeader>
          <div className="min-h-0 flex-1 overflow-y-auto px-8 pb-8">
            <ManagedUserForm
              key={`${user.id}:${user.username}:${user.email}:${user.role}:${user.verified}:${user.avatar ?? ""}`}
              userId={user.id}
              username={user.username}
              email={user.email}
              avatar={user.avatar ?? ""}
              role={user.role}
              verified={user.verified}
              isAdmin
              isSelf={isSelf}
            />
          </div>
        </SheetContent>
      </Sheet>
      <TooltipContent>Zarządzaj</TooltipContent>
    </Tooltip>
  )
}

function createColumns(currentUserId: string) {
  return columnHelper.columns([
    columnHelper.accessor("username", {
      header: ({ column }) => sortableHeader(column, "Użytkownik"),
      sortFn: "alphanumeric",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar className="size-8">
            <AvatarImage
              src={row.original.avatar}
              alt={row.original.username}
            />
            <AvatarFallback>
              {row.original.username.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="truncate font-medium">{row.original.username}</span>
        </div>
      ),
    }),
    columnHelper.accessor("email", {
      header: ({ column }) => sortableHeader(column, "Adres e-mail"),
      sortFn: "text",
    }),
    columnHelper.accessor("role", {
      header: ({ column }) => {
        const filterValue = column.getFilterValue()

        return (
          <div className="flex items-center gap-1">
            {sortableHeader(column, "Rola")}
            <FilterMenu
              label="Filtruj według roli"
              value={typeof filterValue === "string" ? filterValue : "all"}
              options={roleFilterOptions}
              onValueChange={(value) =>
                column.setFilterValue(value === "all" ? undefined : value)
              }
            />
          </div>
        )
      },
      sortFn: "text",
      filterFn: (row, _columnId, value) =>
        value === undefined || row.original.role === value,
      cell: ({ row }) => roleLabels[row.original.role],
    }),
    columnHelper.accessor("verified", {
      header: ({ column }) => {
        const filterValue = column.getFilterValue()

        return (
          <div className="flex items-center gap-1">
            {sortableHeader(column, "Weryfikacja")}
            <FilterMenu
              label="Filtruj według weryfikacji"
              value={
                typeof filterValue === "boolean"
                  ? filterValue
                    ? "verified"
                    : "unverified"
                  : "all"
              }
              options={verificationFilterOptions}
              onValueChange={(value) =>
                column.setFilterValue(
                  value === "all" ? undefined : value === "verified"
                )
              }
            />
          </div>
        )
      },
      sortFn: "basic",
      filterFn: (row, _columnId, value) =>
        value === undefined || row.original.verified === value,
      cell: ({ row }) =>
        row.original.verified ? "Zweryfikowany" : "Niezweryfikowany",
    }),
    columnHelper.display({
      id: "actions",
      header: "Akcje",
      enableHiding: false,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <UserManagementSheet
            user={row.original}
            currentUserId={currentUserId}
          />
          <Tooltip>
            <TooltipTrigger
              render={
                <Link
                  href={`/dashboard/${row.original.id}`}
                  className={buttonVariants({
                    variant: "ghost",
                    size: "icon-sm",
                  })}
                  aria-label={`Panel moderacji użytkownika ${row.original.username}`}
                />
              }
            >
              <FileUserIcon aria-hidden="true" />
            </TooltipTrigger>
            <TooltipContent>Panel moderacji</TooltipContent>
          </Tooltip>
        </div>
      ),
    }),
  ])
}

export function UsersDataTable({
  users,
  currentUserId,
}: {
  users: AdminUserRow[]
  currentUserId: string
}) {
  const [search, setSearch] = useState("")
  const [sorting, setSorting] = useState<SortingState>([])
  const columns = useMemo(() => createColumns(currentUserId), [currentUserId])

  const table = useTable({
    features,
    data: users,
    columns,
    onSortingChange: setSorting,
    onGlobalFilterChange: setSearch,
    state: { sorting, globalFilter: search },
    getColumnCanGlobalFilter: (column) => column.id === "username",
    globalFilterFn: (row, _columnId, filterValue) => {
      const query = String(filterValue ?? "")
        .trim()
        .toLocaleLowerCase()
      if (!query) return true

      const user = row.original
      return [
        user.username,
        user.email,
        user.role,
        roleLabels[user.role],
        user.verified ? "zweryfikowany" : "niezweryfikowany",
      ]
        .join(" ")
        .toLocaleLowerCase()
        .includes(query)
    },
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="sr-only" htmlFor="admin-users-search">
          Szukaj użytkowników
        </label>
        <Input
          id="admin-users-search"
          type="search"
          placeholder="Szukaj po nazwie, e-mailu lub roli"
          value={search}
          onChange={(event) => {
            table.setGlobalFilter(event.target.value)
            table.firstPage()
          }}
          className="w-full sm:max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button type="button" variant="outline">
                <Columns3Icon data-icon="inline-start" aria-hidden="true" />
                Widoczne pola
              </Button>
            }
          />
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Wybierz kolumny</DropdownMenuLabel>
              {table
                .getAllLeafColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    checked={column.getIsVisible()}
                    onCheckedChange={(checked) =>
                      column.toggleVisibility(checked === true)
                    }
                  >
                    {columnLabels[column.id] ?? column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Table
        className="min-w-[48rem]"
        containerProps={{
          role: "region",
          tabIndex: 0,
          "aria-labelledby": "admin-users-table-caption",
          className:
            "rounded-md border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
        }}
      >
        <TableCaption id="admin-users-table-caption" className="sr-only">
          Lista użytkowników
        </TableCaption>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const sort = header.column.getIsSorted()

                return (
                  <TableHead
                    key={header.id}
                    scope="col"
                    aria-sort={
                      header.column.getCanSort()
                        ? sort === "asc"
                          ? "ascending"
                          : sort === "desc"
                            ? "descending"
                            : "none"
                        : undefined
                    }
                  >
                    {header.isPlaceholder ? null : (
                      <table.FlexRender header={header} />
                    )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    <table.FlexRender cell={cell} />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={table.getVisibleLeafColumns().length}
                className="h-24 text-center"
              >
                Nie znaleziono użytkowników.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          Strona {table.state.pagination.pageIndex + 1} z{" "}
          {Math.max(table.getPageCount(), 1)}
        </p>
        <p role="status" className="sr-only">
          Liczba wyników: {table.getFilteredRowModel().rows.length}
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Poprzednia
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Następna
          </Button>
        </div>
      </div>
    </div>
  )
}
