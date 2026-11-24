"use client"

import { PostDialog } from "@/components/post-dialog"
import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"

export function CreatePostDialog() {
  return (
    <PostDialog
      initialMode="post-edit"
      trigger={
        <Button type="button" data-post-dialog-action="post-edit">
          <PlusIcon />
          Dodaj wpis
        </Button>
      }
    />
  )
}
