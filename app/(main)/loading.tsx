import { PostSkeleton } from "@/components/post"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-24" />
      </div>
      <div className="flex flex-col gap-4" aria-hidden="true">
        <PostSkeleton />
        <PostSkeleton />
        <PostSkeleton />
      </div>
    </div>
  )
}
