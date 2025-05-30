import { Router, Request, Response } from "express"
import { PostRepository } from "@db/post/post_repository.js"
import { makeDeletePostService } from "@business/post/delete_post/delete_post_service.js"
import { isExpressError, ExpressError } from "@src/errors.js"
import { validationResult } from "express-validator"
import { validateDeletePost } from "./delete_post_validator"

export function makeDeletePostRouter(repo: PostRepository) {
  const deletePostService = makeDeletePostService(repo)

  return Router().delete("/:id",
    validateDeletePost,
    async (req: Request<{ id: number }, object, object>, res: Response) => {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(err => (err.msg as string)).join(", ")
        res.status(400).json({ message: errorMessages })
        return
      }
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
