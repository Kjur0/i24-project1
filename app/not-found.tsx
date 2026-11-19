import Link from "next/link"

import Logo from "@/components/logo"
import { buttonVariants } from "@/components/ui/button"
import { HomeIcon } from "lucide-react"

export default function NotFound() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <Logo vertical />
            <h1 className="text-xl font-bold">Nie znaleziono strony</h1>
          </div>
          <Link href="/" className={buttonVariants({ variant: "secondary" })}>
            <HomeIcon />
            Powrót do strony głównej
          </Link>
        </div>
      </div>
    </main>
  )
}
