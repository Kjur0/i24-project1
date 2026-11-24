"use client"

import {
  useId,
  useRef,
  useState,
  useTransition,
  type FormEvent,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from "react"
import { cn } from "cn"

import { useRouter } from "next/navigation"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import {
  createComment,
  createPost,
  deleteComment,
  deletePost,
  updateComment,
  updatePost,
  type postActionResult,
} from "@/lib/post-actions"
import { MessageSquarePlusIcon, SquarePenIcon, Trash2Icon } from "lucide-react"

type PostDialogMode = "view" | "post-edit" | "comment-edit"

type PostDetail = {
  title: string
  content: string
  authorName?: string
  authorAvatar?: string
  isAuthor: boolean
  comments: Array<{
    key: string
    index: number
    createdAt: number
    title?: string
    content: string
    authorName?: string
    authorAvatar?: string
    isAuthor: boolean
  }>
}

type PostDialogProps = {
  children?: ReactNode
  trigger?: ReactNode
  detail?: PostDetail
  postId?: string
  currentUserId?: string
  initialMode?: PostDialogMode
}

function getTargetElement(target: EventTarget | null) {
  return target instanceof Element ? target : null
}

export function PostDialog({
  children,
  trigger,
  detail,
  postId,
  currentUserId,
  initialMode = "view",
}: PostDialogProps) {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<PostDialogMode>(initialMode)
  const [editingCommentIndex, setEditingCommentIndex] = useState<number | null>(
    null
  )
  const [confirmingCommentIndex, setConfirmingCommentIndex] = useState<
    number | null
  >(null)
  const [confirmingPostDelete, setConfirmingPostDelete] = useState(false)
  const [postError, setPostError] = useState<string | null>(null)
  const [commentDraft, setCommentDraft] = useState("")
  const [commentError, setCommentError] = useState<string | null>(null)
  const [shouldFocusCommentField, setShouldFocusCommentField] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [isCommentPending, startCommentTransition] = useTransition()
  const router = useRouter()
  const id = useId()
  const postContentRef = useRef<HTMLParagraphElement>(null)
  const newCommentRef = useRef<HTMLTextAreaElement>(null)

  function openInMode(nextMode: PostDialogMode, focusCommentField = false) {
    setOpen(true)
    setMode(nextMode)
    setShouldFocusCommentField(focusCommentField)
    setEditingCommentIndex(null)
    setConfirmingCommentIndex(null)
    setConfirmingPostDelete(false)
    setPostError(null)
    setCommentError(null)
  }

  function handleClick(event: MouseEvent<HTMLDivElement>) {
    const target = getTargetElement(event.target)
    const action = target
      ?.closest("[data-post-dialog-action]")
      ?.getAttribute("data-post-dialog-action")

    if (action === "post-edit") {
      openInMode("post-edit")
      return
    }
    if (action === "view") {
      openInMode("view", true)
      return
    }
    if (action === "post-delete") {
      openInMode("view")
      setConfirmingPostDelete(true)
      return
    }
    if (action === "comment-edit" || action === "comment-delete") {
      const actionElement = target?.closest("[data-post-dialog-action]")
      const index = Number(actionElement?.getAttribute("data-comment-index"))

      if (!Number.isSafeInteger(index) || index < 0) return

      openInMode(action === "comment-edit" ? "comment-edit" : "view")
      if (action === "comment-edit") setEditingCommentIndex(index)
      else setConfirmingCommentIndex(index)
      return
    }

    if (target?.closest("[data-post-dialog-open]")) openInMode("view")
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Enter" && event.key !== " ") return

    const target = getTargetElement(event.target)
    if (!target?.closest("[data-post-dialog-open]")) return

    event.preventDefault()
    openInMode("view")
  }

  function handlePostSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPostError(null)
    const formData = new FormData(event.currentTarget)

    startTransition(async () => {
      const result: postActionResult = postId
        ? await updatePost(postId, formData)
        : await createPost(formData)

      if (!result.success) {
        setPostError(result.error)
        return
      }

      if (postId) {
        setMode("view")
      } else {
        setOpen(false)
      }
      router.refresh()
    })
  }

  function handlePostDelete() {
    if (!postId) return

    setPostError(null)
    startTransition(async () => {
      const result: postActionResult = await deletePost(postId)

      if (!result.success) {
        setPostError(result.error)
        return
      }

      setOpen(false)
      router.refresh()
    })
  }

  function handleCommentCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!postId) return

    setCommentError(null)
    const formData = new FormData(event.currentTarget)

    startCommentTransition(async () => {
      const result: postActionResult = await createComment(postId, formData)

      if (!result.success) {
        setCommentError(result.error)
        return
      }

      setCommentDraft("")
      router.refresh()
    })
  }

  const isPostEdit = mode === "post-edit"
  const canCreateComment = Boolean(postId && currentUserId)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div className="contents" onClick={handleClick} onKeyDown={handleKeyDown}>
        {trigger}
        {children}
      </div>
      <DialogContent
        size="wide"
        initialFocus={
          mode === "view" && detail
            ? shouldFocusCommentField
              ? newCommentRef
              : postContentRef
            : undefined
        }
        className={cn(
          "max-h-[90dvh] sm:max-h-[85dvh] sm:w-[90vw]",
          isPostEdit ? "overflow-y-auto" : "flex flex-col overflow-hidden"
        )}
      >
        {isPostEdit ? (
          <>
            <DialogHeader>
              <DialogTitle>
                {postId ? "Edytuj wpis" : "Utwórz wpis"}
              </DialogTitle>
              <DialogDescription>
                Zapisane zmiany zostaną od razu opublikowane.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handlePostSubmit} className="flex flex-col gap-5">
              <Field>
                <FieldLabel htmlFor={`post-title-${id}`}>Tytuł</FieldLabel>
                <Input
                  id={`post-title-${id}`}
                  name="title"
                  defaultValue={detail?.title}
                  required
                  maxLength={200}
                  autoComplete="off"
                  disabled={isPending}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor={`post-content-${id}`}>Treść</FieldLabel>
                <Textarea
                  id={`post-content-${id}`}
                  name="content"
                  defaultValue={detail?.content}
                  required
                  maxLength={10000}
                  rows={9}
                  disabled={isPending}
                />
              </Field>
              {postError && <FieldError>{postError}</FieldError>}
              <ButtonGroup className="ml-auto">
                <Button
                  type="button"
                  variant="secondary"
                  disabled={isPending}
                  onClick={() => {
                    setPostError(null)
                    if (postId) setMode("view")
                    else setOpen(false)
                  }}
                >
                  Anuluj
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending && <Spinner />}
                  {isPending ? "Zapisywanie..." : "Zapisz"}
                </Button>
              </ButtonGroup>
            </form>
          </>
        ) : detail ? (
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 overflow-y-auto">
              <div className="flex flex-col gap-6">
                <DialogHeader>
                  <div className="min-w-0 pr-10">
                    <DialogTitle>{detail.title}</DialogTitle>
                    <DialogDescription>
                      {detail.authorName
                        ? `Autor: ${detail.authorName}`
                        : "Treść wpisu i komentarze."}
                    </DialogDescription>
                  </div>
                </DialogHeader>

                <div className="flex items-start gap-3">
                  <Avatar>
                    <AvatarImage
                      src={detail.authorAvatar}
                      alt={detail.authorName}
                    />
                    <AvatarFallback>
                      {detail.authorName?.substring(0, 2).toUpperCase() ?? "?"}
                    </AvatarFallback>
                  </Avatar>
                  <p
                    ref={postContentRef}
                    tabIndex={-1}
                    className="min-w-0 flex-1 whitespace-pre-wrap break-words text-sm leading-relaxed [overflow-wrap:anywhere]"
                  >
                    {detail.content}
                  </p>
                </div>

                {confirmingPostDelete && (
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
                    <p>Usunąć wpis? Tej czynności nie można cofnąć.</p>
                    <ButtonGroup>
                      <Button
                        type="button"
                        variant="secondary"
                        disabled={isPending}
                        onClick={() => {
                          setConfirmingPostDelete(false)
                          setPostError(null)
                        }}
                      >
                        Anuluj
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        disabled={isPending}
                        onClick={handlePostDelete}
                      >
                        {isPending && <Spinner />}
                        {isPending ? "Usuwanie..." : "Usuń"}
                      </Button>
                    </ButtonGroup>
                  </div>
                )}
                {postError && <FieldError>{postError}</FieldError>}

                <Separator />
                <section
                  aria-labelledby={`comments-heading-${id}`}
                  className="flex flex-col gap-3"
                >
                  <h3
                    id={`comments-heading-${id}`}
                    className="text-sm font-semibold text-muted-foreground"
                  >
                    Komentarze ({detail.comments.length})
                  </h3>
                  {canCreateComment && (
                    <form
                      onSubmit={handleCommentCreate}
                      className="flex items-end gap-3"
                    >
                      <Field className="min-w-0 flex-1">
                        <FieldLabel
                          htmlFor={`new-comment-${id}`}
                          className="sr-only"
                        >
                          Dodaj komentarz
                        </FieldLabel>
                        <Textarea
                          id={`new-comment-${id}`}
                          ref={newCommentRef}
                          name="content"
                          className="min-h-0"
                          value={commentDraft}
                          onChange={(event) =>
                            setCommentDraft(event.target.value)
                          }
                          required
                          maxLength={5000}
                          rows={1}
                          placeholder="Napisz komentarz..."
                          disabled={isCommentPending}
                        />
                      </Field>
                      {commentError && <FieldError>{commentError}</FieldError>}
                      <ButtonGroup className="ml-auto">
                        <Button
                          type="submit"
                          size="sm"
                          disabled={isCommentPending}
                        >
                          {isCommentPending && <Spinner />}
                          {isCommentPending ? "Publikowanie..." : "Opublikuj"}
                          {!isCommentPending && <MessageSquarePlusIcon />}
                        </Button>
                      </ButtonGroup>
                    </form>
                  )}
                  <div className="flex flex-col gap-3">
                    {[...detail.comments]
                      .sort(
                        (first, second) =>
                          second.createdAt - first.createdAt ||
                          second.index - first.index
                      )
                      .map((comment) => (
                        <PostDialogComment
                          key={comment.key}
                          postId={postId}
                          comment={comment}
                          isEditing={
                            mode === "comment-edit" &&
                            editingCommentIndex === comment.index
                          }
                          isConfirmingDelete={
                            confirmingCommentIndex === comment.index
                          }
                          onBeginEdit={() => {
                            setMode("comment-edit")
                            setEditingCommentIndex(comment.index)
                            setConfirmingCommentIndex(null)
                          }}
                          onCancelEdit={() => {
                            setMode("view")
                            setEditingCommentIndex(null)
                          }}
                          onRequestDelete={() => {
                            setMode("view")
                            setConfirmingCommentIndex(comment.index)
                          }}
                          onCancelDelete={() => setConfirmingCommentIndex(null)}
                        />
                      ))}
                    {detail.comments.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        Brak komentarzy.
                      </p>
                    )}
                  </div>
                </section>
              </div>
            </div>
            {postId && detail.isAuthor && (
              <div className="flex shrink-0 flex-col gap-4 pt-4">
                <Separator />
                <ButtonGroup className="ml-auto">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    aria-label="Edytuj wpis"
                    onClick={() => openInMode("post-edit")}
                  >
                    <SquarePenIcon />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    aria-label="Usuń wpis"
                    onClick={() => setConfirmingPostDelete(true)}
                  >
                    <Trash2Icon />
                  </Button>
                </ButtonGroup>
              </div>
            )}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

type PostDialogCommentProps = {
  postId?: string
  comment: PostDetail["comments"][number]
  isEditing: boolean
  isConfirmingDelete: boolean
  onBeginEdit: () => void
  onCancelEdit: () => void
  onRequestDelete: () => void
  onCancelDelete: () => void
}

function PostDialogComment({
  postId,
  comment,
  isEditing,
  isConfirmingDelete,
  onBeginEdit,
  onCancelEdit,
  onRequestDelete,
  onCancelDelete,
}: PostDialogCommentProps) {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const id = useId()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!postId) return

    setError(null)
    const formData = new FormData(event.currentTarget)

    startTransition(async () => {
      const result: postActionResult = await updateComment(
        postId,
        comment.index,
        formData
      )

      if (!result.success) {
        setError(result.error)
        return
      }

      onCancelEdit()
      router.refresh()
    })
  }

  function handleDelete() {
    if (!postId) return

    setError(null)
    startTransition(async () => {
      const result: postActionResult = await deleteComment(
        postId,
        comment.index
      )

      if (!result.success) {
        setError(result.error)
        return
      }

      onCancelDelete()
      router.refresh()
    })
  }

  return (
    <div className="flex items-start gap-3">
      <Avatar>
        <AvatarImage src={comment.authorAvatar} alt={comment.authorName} />
        <AvatarFallback>
          {comment.authorName?.substring(0, 2).toUpperCase() ?? "?"}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex min-h-7 items-center justify-between gap-3">
          {comment.authorName && (
            <p className="text-xs font-semibold uppercase">
              {comment.authorName}
            </p>
          )}
          {postId && comment.isAuthor && !isEditing && (
            <ButtonGroup>
              <Button
                type="button"
                variant="outline"
                size="icon-xs"
                aria-label="Edytuj komentarz"
                disabled={isPending || isConfirmingDelete}
                onClick={onBeginEdit}
              >
                <SquarePenIcon />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon-xs"
                aria-label="Usuń komentarz"
                disabled={isPending}
                onClick={onRequestDelete}
              >
                <Trash2Icon />
              </Button>
            </ButtonGroup>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <Field>
              <FieldLabel htmlFor={`comment-content-${id}`}>
                Treść komentarza
              </FieldLabel>
              <Textarea
                id={`comment-content-${id}`}
                name="content"
                defaultValue={comment.content}
                required
                maxLength={5000}
                rows={3}
                autoFocus
                disabled={isPending}
              />
            </Field>
            {error && <FieldError>{error}</FieldError>}
            <ButtonGroup className="ml-auto">
              <Button
                type="button"
                variant="secondary"
                disabled={isPending}
                onClick={() => {
                  setError(null)
                  onCancelEdit()
                }}
              >
                Anuluj
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Spinner />}
                {isPending ? "Zapisywanie..." : "Zapisz"}
              </Button>
            </ButtonGroup>
          </form>
        ) : (
          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-muted-foreground [overflow-wrap:anywhere]">
            {comment.title && (
              <span className="mb-1 block font-semibold text-foreground">
                {comment.title}
              </span>
            )}
            {comment.content}
          </p>
        )}

        {isConfirmingDelete && (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm">Usunąć komentarz?</p>
            <ButtonGroup>
              <Button
                type="button"
                variant="secondary"
                disabled={isPending}
                onClick={() => {
                  setError(null)
                  onCancelDelete()
                }}
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
          </div>
        )}
        {error && !isEditing && <FieldError>{error}</FieldError>}
      </div>
    </div>
  )
}
