"use client"

import { useState, useTransition } from "react"

import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { FieldError } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import {
  deleteComment,
  deletePost,
  type postActionResult,
} from "@/lib/post-actions"
import { Trash2Icon } from "lucide-react"

type DeleteContentDialogProps = {
  postId: string
  commentIndex?: number
}

export function DeleteContentDialog({
  postId,
  commentIndex,
}: DeleteContentDialogProps) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const isComment = commentIndex !== undefined

  function handleDelete() {
    setError(null)

    startTransition(async () => {
      const result: postActionResult = isComment
        ? await deleteComment(postId, commentIndex)
        : await deletePost(postId)

      if (!result.success) {
        setError(result.error)
        return
      }

      setOpen(false)
      router.refresh()
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)
        if (nextOpen) setError(null)
      }}
    >
      <DialogTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label={isComment ? "Usuń komentarz" : "Usuń wpis"}
          >
            <Trash2Icon />
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isComment ? "Usunąć komentarz?" : "Usunąć wpis?"}
          </DialogTitle>
          <DialogDescription>Tej czynności nie można cofnąć.</DialogDescription>
        </DialogHeader>
        {error && <FieldError>{error}</FieldError>}
        <ButtonGroup className="ml-auto">
          <Button
            type="button"
            variant="secondary"
            disabled={isPending}
            onClick={() => setOpen(false)}
          >
            Anuluj
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={isPending}
            onClick={handleDelete}
          >
            {isPending && <Spinner />}
            {isPending ? "Usuwanie..." : "Usuń"}
          </Button>
        </ButtonGroup>
      </DialogContent>
    </Dialog>
  )
}
