import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

function SettingsCardSkeleton({
  fields = 0,
  rows = 0,
}: {
  fields?: number
  rows?: number
}) {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-4 w-full max-w-sm" />
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-5">
          {Array.from({ length: fields }, (_, index) => (
            <div key={index} className="flex flex-col gap-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
          {Array.from({ length: rows }, (_, index) => (
            <div
              key={index}
              className="flex flex-col gap-3 border p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-4 w-52 max-w-full" />
              </div>
              <Skeleton className="h-9 w-28" />
            </div>
          ))}
          {fields > 0 && <Skeleton className="h-9 w-32" />}
          {fields === 0 && rows === 0 && <Skeleton className="h-9 w-32" />}
        </div>
      </CardContent>
    </Card>
  )
}

export default function SettingsLoading() {
  return (
    <section
      aria-busy="true"
      aria-label="Ładowanie ustawień"
      className="flex flex-col gap-6 p-4 md:p-8"
    >
      <p role="status" className="sr-only">
        Ładowanie ustawień...
      </p>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-4 w-64 max-w-full" />
      </div>
      <div aria-hidden="true" className="flex flex-col gap-6">
        <SettingsCardSkeleton fields={2} />
        <SettingsCardSkeleton rows={1} />
        <SettingsCardSkeleton rows={2} />
      </div>
    </section>
  )
}
