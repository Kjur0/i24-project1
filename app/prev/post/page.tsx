import { Comment } from "@/types/comment"

import { Post } from "@/components/post"
import { ObjectId } from "mongodb"

const post: Comment = {
  content:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin volutpat feugiat maximus. Donec suscipit massa vitae tempus maximus. Pellentesque mollis congue erat, vitae ultrices quam aliquet at. Vivamus maximus ornare bibendum. Nam luctus facilisis quam, et fringilla risus vestibulum id. Praesent nec augue finibus, convallis odio id, ultricies massa. Vestibulum porttitor consequat rutrum. Vivamus rhoncus laoreet posuere. Donec vel odio eget ex suscipit molestie quis a sapien. Integer aliquam pellentesque lobortis. Quisque lobortis aliquam metus a maximus. Nulla fermentum ultricies felis, tristique gravida sapien placerat sed. Duis at condimentum arcu, eu condimentum erat. Phasellus malesuada auctor nunc. Suspendisse ac accumsan est, id consectetur lacus. Cras tristique, justo a elementum tempus, diam mauris rutrum nulla, lobortis placerat ante ligula eu turpis.",
  author: new ObjectId("6ac967be270418e00e38335f"),
  createdAt: new Date("2024-06-01T12:00:00Z"),
  title: "Sample Post",
}

export default function Preview() {
  return (
    <div className="flex flex-col gap-2 p-4">
      <Post post={post} />
    </div>
  )
}
