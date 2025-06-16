import { Router, Request, Response } from "express"
import { PostRepository } from "@db/post/postRepository.js"
import { makeDeletePostService } from "@business/post/delete-post/deletePostService.js"
import { isExpressError, ExpressError } from "@src/errors.js"
import { validateDeletePost } from "@business/post/delete-post/deletePostValidator.js"
import { validation } from "@business/aux.js"

export function makeDeletePostRouter(repo: PostRepository) {
  const deletePostService = makeDeletePostService(repo)

  return Router().delete("/:id",
    validateDeletePost,
    async (req: Request<{ id: number }, object, object>, res: Response) => {
      if (!validation(req, res)) return
      const { id } = req.params
      try {
        await deletePostService.deletePost({ id, userId: req.userId })
        res.json({ message: "Post deleted" })
      } catch (error) {
        if (isExpressError(error as Error)) {
          res.status((error as ExpressError).statusCode).json({ message: (error as Error).message })
        } else {
          res.status(500).json({ error: (error as Error).message })
        }
      }
    })
}
