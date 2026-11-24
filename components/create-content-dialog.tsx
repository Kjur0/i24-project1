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
  createComment,
  createPost,
  type postActionResult,
} from "@/lib/post-actions"
import { MessageSquarePlusIcon, PlusIcon } from "lucide-react"

type ContentDialogProps = {
  postId?: string
}

export function CreatePostDialog() {
  return <ContentDialog />
}

export function CreateCommentDialog({ postId }: { postId: string }) {
  return <ContentDialog postId={postId} />
}

function ContentDialog({ postId }: ContentDialogProps) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const formRef = useRef<HTMLFormElement>(null)
  const router = useRouter()
  const id = useId()
  const isComment = postId !== undefined

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    const formData = new FormData(event.currentTarget)

    startTransition(async () => {
      const result: postActionResult = postId
        ? await createComment(postId, formData)
        : await createPost(formData)

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
          <Button type="button" size={isComment ? "sm" : "default"}>
            {isComment ? <MessageSquarePlusIcon /> : <PlusIcon />}
            {isComment ? "Dodaj komentarz" : "Dodaj wpis"}
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isComment ? "Dodaj komentarz" : "Utwórz wpis"}
          </DialogTitle>
          <DialogDescription>
            {isComment
              ? "Podziel się swoją opinią."
              : "Dodaj nowy wpis do strony."}
          </DialogDescription>
        </DialogHeader>
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="flex flex-col gap-5"
        >
          {!isComment && (
            <Field>
              <FieldLabel htmlFor={`post-title-${id}`}>Tytuł</FieldLabel>
              <Input
                id={`post-title-${id}`}
                name="title"
                required
                maxLength={200}
                autoComplete="off"
                disabled={isPending}
              />
            </Field>
          )}
          <Field>
            <FieldLabel
              htmlFor={`${isComment ? "comment-content" : "post-content"}-${id}`}
            >
              Treść
            </FieldLabel>
            <Textarea
              id={`${isComment ? "comment-content" : "post-content"}-${id}`}
              name="content"
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
