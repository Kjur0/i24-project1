import { Button } from "./ui/button"
import { Collapsible, CollapsibleTrigger } from "./ui/collapsible"

import { Comment } from "@/types/comment"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import { getCurrentUser } from "@/lib/auth"
import { getUserById } from "@/lib/db"
import { SquarePenIcon } from "lucide-react"

export async function Post({
  post,
  muted = false,
}: {
  post: Comment
  muted?: boolean
}) {
  const user = await getUserById(post.author)
  const isAuthor = user?.email === (await getCurrentUser())?.email

  return (
    <Item variant={muted ? "muted" : "default"}>
      <ItemMedia>
        <Avatar>
          <AvatarImage src={"not-available"} alt={"not-available"} />
          <AvatarFallback>{user?.email.substring(0, 2)}</AvatarFallback>
        </Avatar>
      </ItemMedia>
      <ItemContent>
        <ItemTitle>{post.title}</ItemTitle>
        <ItemDescription>{post.content}</ItemDescription>
      </ItemContent>
      {isAuthor && (
        <ItemActions>
          <Button size="icon" variant="outline">
            <SquarePenIcon />
          </Button>
        </ItemActions>
      )}
      <ItemFooter>
        <Collapsible>
          <CollapsibleTrigger>Komentarze</CollapsibleTrigger>
        </Collapsible>
      </ItemFooter>
    </Item>
  )
}
