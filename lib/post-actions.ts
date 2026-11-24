"use server"

import { revalidatePath } from "next/cache"

import * as z from "zod"

import { getCurrentUser } from "@/lib/auth"
import { posts } from "@/lib/db"
import { ObjectId } from "mongodb"

export type postActionResult =
  { success: true } | { success: false; error: string }

const postSchema = z.object({
  title: z.string().trim().min(1, "Wpis musi mieć tytuł").max(200),
  content: z.string().trim().min(1, "Treść jest wymagana").max(10000),
})

const commentSchema = z.object({
  content: z.string().trim().min(1, "Treść jest wymagana").max(5000),
})

export async function createPost(
  formData: FormData
): Promise<postActionResult> {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    return { success: false, error: "Zaloguj się, aby dodać wpis." }
  }

  const parsed = postSchema.safeParse({
    title: formData.get("title"),
    content: formData.get("content"),
  })

  if (!parsed.success) {
    return {
      success: false,
      error:
        parsed.error.issues[0]?.message ??
        "Nieprawidłowy tytuł lub treść wpisu.",
    }
  }

  await posts.insertOne({
    ...parsed.data,
    author: new ObjectId(currentUser.id),
    createdAt: new Date(),
    comments: [],
  })

  revalidatePath("/")
  return { success: true }
}

export async function createComment(
  postId: string,
  formData: FormData
): Promise<postActionResult> {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    return { success: false, error: "Zaloguj się, aby dodać komentarz." }
  }

  if (!/^[\da-f]{24}$/i.test(postId)) {
    return { success: false, error: "Nie znaleziono wpisu." }
  }

  const parsed = commentSchema.safeParse({
    content: formData.get("content"),
  })

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Nieprawidłowy komentarz.",
    }
  }

  const result = await posts.updateOne(
    { _id: new ObjectId(postId) },
    {
      $push: {
        comments: {
          ...parsed.data,
          author: new ObjectId(currentUser.id),
          createdAt: new Date(),
        },
      },
    }
  )

  if (result.matchedCount === 0) {
    return { success: false, error: "Nie znaleziono wpisu." }
  }

  revalidatePath("/")
  return { success: true }
}

export async function updatePost(
  postId: string,
  formData: FormData
): Promise<postActionResult> {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    return { success: false, error: "Zaloguj się, aby edytować wpis." }
  }

  if (!/^[\da-f]{24}$/i.test(postId)) {
    return { success: false, error: "Nie znaleziono wpisu." }
  }

  const parsed = postSchema.safeParse({
    title: formData.get("title"),
    content: formData.get("content"),
  })

  if (!parsed.success) {
    return {
      success: false,
      error:
        parsed.error.issues[0]?.message ??
        "Nieprawidłowy tytuł lub treść wpisu.",
    }
  }

  const result = await posts.updateOne(
    {
      _id: new ObjectId(postId),
      author: new ObjectId(currentUser.id),
    },
    { $set: parsed.data }
  )

  if (result.matchedCount === 0) {
    return {
      success: false,
      error: "Nie znaleziono wpisu lub nie masz uprawnień, aby go edytować.",
    }
  }

  revalidatePath("/")
  return { success: true }
}

export async function updateComment(
  postId: string,
  commentIndex: number,
  formData: FormData
): Promise<postActionResult> {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    return { success: false, error: "Zaloguj się, aby edytować komentarz." }
  }

  if (
    !/^[\da-f]{24}$/i.test(postId) ||
    !Number.isSafeInteger(commentIndex) ||
    commentIndex < 0
  ) {
    return { success: false, error: "Nie znaleziono komentarza." }
  }

  const parsed = commentSchema.safeParse({
    content: formData.get("content"),
  })

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Nieprawidłowy komentarz.",
    }
  }

  const result = await posts.updateOne(
    {
      _id: new ObjectId(postId),
      [`comments.${commentIndex}.author`]: new ObjectId(currentUser.id),
    },
    {
      $set: {
        [`comments.${commentIndex}.content`]: parsed.data.content,
      },
    }
  )

  if (result.matchedCount === 0) {
    return {
      success: false,
      error:
        "Nie znaleziono komentarza lub nie masz uprawnień, aby go edytować.",
    }
  }

  revalidatePath("/")
  return { success: true }
}

export async function deletePost(postId: string): Promise<postActionResult> {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    return { success: false, error: "Zaloguj się, aby usunąć wpis." }
  }

  if (!/^[\da-f]{24}$/i.test(postId)) {
    return { success: false, error: "Nie znaleziono wpisu." }
  }

  const result = await posts.deleteOne({
    _id: new ObjectId(postId),
    author: new ObjectId(currentUser.id),
  })

  if (result.deletedCount === 0) {
    return {
      success: false,
      error: "Nie znaleziono wpisu lub nie masz uprawnień, aby go usunąć.",
    }
  }

  revalidatePath("/")
  return { success: true }
}

export async function deleteComment(
  postId: string,
  commentIndex: number
): Promise<postActionResult> {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    return { success: false, error: "Zaloguj się, aby usunąć komentarz." }
  }

  if (
    !/^[\da-f]{24}$/i.test(postId) ||
    !Number.isSafeInteger(commentIndex) ||
    commentIndex < 0
  ) {
    return { success: false, error: "Nie znaleziono komentarza." }
  }

  const result = await posts.updateOne(
    {
      _id: new ObjectId(postId),
      [`comments.${commentIndex}.author`]: new ObjectId(currentUser.id),
    },
    [
      {
        $set: {
          comments: {
            $concatArrays: [
              { $slice: ["$comments", commentIndex] },
              {
                $slice: [
                  "$comments",
                  commentIndex + 1,
                  { $subtract: [{ $size: "$comments" }, commentIndex + 1] },
                ],
              },
            ],
          },
        },
      },
    ]
  )

  if (result.matchedCount === 0) {
    return {
      success: false,
      error: "Nie znaleziono komentarza lub nie masz uprawnień, aby go usunąć.",
    }
  }

  revalidatePath("/")
  return { success: true }
}
