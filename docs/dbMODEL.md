---
Assignment: 1
---

## Users

```ts
interface User {
    _id: ObjectId
    username: String
    idp: String
    role: String
    currentRating: Double
}
```

| Pole            | Typ        | Opis                                                     |
|-----------------|------------|----------------------------------------------------------|
| `_id`           | `ObjectId` | Unikalny identyfikator użytkownika                       |
| `username`      | `String`   | Nazwa użytkownika                                        |
| `idp`           | `String`   | Identyfikator dostawcy tożsamości (np. Google, Facebook) |
| `role`          | `String`   | Rola użytkownika (admin, moderator, user)                |
| `currentRating` | `Double`   | Aktualna ocena użytkownika                               |


## Comments

```ts
interface Comment {
    _id: ObjectId
    author: ObjectId
    createdAt: Date
    content: String
    comments: Array<Exclude<Comment, "comments">>
}
```

| Pole        | Typ                                   | Opis                                                       |
|-------------|---------------------------------------|------------------------------------------------------------|
| `_id`       | `ObjectId`                            | Unikalny identyfikator komentarza                          |
| `author`    | `ObjectId`                            | Identyfikator autora komentarza (odwołanie do użytkownika) |
| `createdAt` | `Date`                                | Data utworzenia komentarza                                 |
| `content`   | `String`                              | Treść komentarza                                           |
| `comments`  | `Array<Exclude<Comment, "comments">>` | Tablica komentarzy do tego komentarza                      |
