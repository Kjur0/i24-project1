import { use } from "react"

import Link from "next/link"

import { CurrentUser } from "@/models/User"

import Logo from "@/components/logo"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getCurrentUser, isAuthenticated, logout } from "@/lib/auth"
import { LogOutIcon } from "lucide-react"

type UserMenuProps = {
  user: CurrentUser
}

export function SiteHeader() {
  const loggedIn = use(isAuthenticated())
  const user = use(loggedIn ? getCurrentUser() : Promise.resolve(null))

  return (
    <header className="sticky top-0 z-50 flex w-full items-center bg-sidebar-primary p-4">
      <Link href="/">
        <Logo />
      </Link>
      <div className="ml-auto flex items-center justify-end gap-4">
        {loggedIn ? (
          <UserMenu user={user!} />
        ) : (
          <ButtonGroup>
            <Link href="/login">
              <Button>Zaloguj</Button>
            </Link>
            <Link href="/signup">
              <Button>Zarejestruj</Button>
            </Link>
          </ButtonGroup>
        )}
      </div>
    </header>
  )
}

export function UserMenu({ user }: UserMenuProps) {
  return (
    <ButtonGroup>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button variant="ghost" className="pl-2" />}
        >
          <Avatar>
            <AvatarImage src={"not-available"} alt={"not-available"} />
            <AvatarFallback>{user.email.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">{user.username}</span>
            <span className="truncate text-xs text-foreground/70">
              {user.email}
            </span>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="bottom" align="center">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Ustawnienia</DropdownMenuLabel>
            <DropdownMenuItem>Profil</DropdownMenuItem>
            <DropdownMenuItem>Logowanie</DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem variant="destructive" onClick={logout}>
              <LogOutIcon />
              Wyloguj
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <Button variant="ghost" size="icon" onClick={logout}>
        <LogOutIcon />
      </Button>
    </ButtonGroup>
  )
}
