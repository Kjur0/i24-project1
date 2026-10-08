import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import Logo from "@/components/logo"
import Link from "next/link"

export default function Template({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // header shall be split...
  // the title on the left, and the buttons on the right
  return (
    <>
      <header className="sticky top-0 z-50 flex w-full items-center bg-sidebar-primary p-4">
        <Link href="/">
          <Logo />
        </Link>
        <div className="ml-auto flex items-center justify-end gap-4">
          <ButtonGroup>
            <Link href="/login">
              <Button>Zaloguj</Button>
            </Link>
            <Link href="/signup">
              <Button>Zarejestruj</Button>
            </Link>
          </ButtonGroup>
        </div>
      </header>
      <main>{children}</main>
    </>
  )
}
