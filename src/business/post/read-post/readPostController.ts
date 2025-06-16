import { PostRepository } from "@db/post/post_repository.js"
import { makeReadPostService } from "@business/post/read-post/readPostService.js"
import { isExpressError, ExpressError } from "@src/errors.js"
import { Router, Request, Response } from "express"
import { validateReadPost } from "@business/post/read-post/readPostValidator.js"
import { validation } from "@business/aux.js"

export function makeReadPostRouter(postRepo: PostRepository) {
  const readPostService = makeReadPostService(postRepo)

  return Router().get("/:id",
    validateReadPost,
    async (req: Request, res: Response) => {
      if (!validation(req, res)) return
      const { id } = req.params
      try {
        const post = await readPostService.readPost({ id: Number(id) })
        res.json(post)
      } catch (error) {
        if (isExpressError(error as Error)) {
          res.status((error as ExpressError).statusCode).json({ message: (error as Error).message })
        } else {
          res.status(500).json({ error: (error as Error).message })
        }
      }
    })
}
