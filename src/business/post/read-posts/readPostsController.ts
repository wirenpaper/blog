import { PostRepository } from "@db/post/post_repository.js"
import { Router } from "express"
import { makeReadPostsService } from "@business/post/read-posts/readPostsService.js"
import { isExpressError, ExpressError } from "@src/errors.js"

export function makeReadPostsRouter(postRepo: PostRepository) {
  const readPostsService = makeReadPostsService(postRepo)

  return Router().get("/", async (_, res) => {
    try {
      const result = await readPostsService.readPosts()
      res.json(result)
    } catch (error) {
      if (isExpressError(error as Error)) {
        res.status((error as ExpressError).statusCode).json({ message: (error as Error).message })
      } else {
        res.status(500).json({ error: (error as Error).message })
      }
    }
  })
}
