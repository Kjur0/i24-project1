"use client"

import { useId, useRef, useState, useTransition, type FormEvent } from "react"

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
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import {
  updateComment,
  updatePost,
  type postActionResult,
} from "@/lib/post-actions"
import { SquarePenIcon } from "lucide-react"

type EditContentDialogProps = {
  postId: string
  commentIndex?: number
  title?: string
  content: string
}

export function EditContentDialog({
  postId,
  commentIndex,
  title,
  content,
}: EditContentDialogProps) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)
  const router = useRouter()
  const id = useId()
  const isComment = commentIndex !== undefined

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    const formData = new FormData(event.currentTarget)

    startTransition(async () => {
      const result: postActionResult = isComment
        ? await updateComment(postId, commentIndex, formData)
        : await updatePost(postId, formData)

      if (!result.success) {
        setError(result.error)
        return
      }

      formRef.current?.reset()
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
            aria-label={isComment ? "Edytuj komentarz" : "Edytuj wpis"}
          >
            <SquarePenIcon />
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isComment ? "Edytuj komentarz" : "Edytuj wpis"}
          </DialogTitle>
          <DialogDescription>
            Zapisane zmiany zostaną od razu opublikowane.
          </DialogDescription>
        </DialogHeader>
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="flex flex-col gap-5"
        >
          {!isComment && (
            <Field>
              <FieldLabel htmlFor={`edit-title-${id}`}>Tytuł</FieldLabel>
              <Input
                id={`edit-title-${id}`}
                name="title"
                defaultValue={title}
                required
                maxLength={200}
                autoComplete="off"
                disabled={isPending}
              />
            </Field>
          )}
          <Field>
            <FieldLabel htmlFor={`edit-content-${id}`}>Treść</FieldLabel>
            <Textarea
              id={`edit-content-${id}`}
              name="content"
              defaultValue={content}
              required
              maxLength={isComment ? 5000 : 10000}
              rows={5}
              disabled={isPending}
            />
          </Field>
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
            <Button type="submit" disabled={isPending}>
              {isPending && <Spinner />}
              {isPending ? "Zapisywanie..." : "Zapisz"}
            </Button>
          </ButtonGroup>
        </form>
      </DialogContent>
    </Dialog>
  )
}
