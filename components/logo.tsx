import { SwatchBookIcon } from "lucide-react"
import Link from "next/link"

export default function Logo({ vertical = false }: { vertical?: boolean }) {
  if (vertical)
    return (
      <Link href="/" className="flex flex-col items-center gap-2 font-medium">
        <div className="flex size-8 items-center justify-center rounded-md">
          <SwatchBookIcon className="size-6" />
        </div>
        <span>Webmaster.rip</span>
      </Link>
    )
  return (
    <span className="flex flex-row items-center gap-2 font-medium">
      <div className="flex size-8 items-center justify-center rounded-md">
        <SwatchBookIcon className="size-6" />
      </div>
      <span>Webmaster.rip</span>
    </span>
  )
}
