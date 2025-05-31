import { Router, Request, Response } from "express"
import { PostRepository } from "@db/post/post_repository.js"
import { isExpressError, ExpressError } from "@src/errors.js"
import { makeEditPostService } from "@business/post/edit_post/edit_post_service.js"
// import { validationResult } from "express-validator"
import { validateEditPost } from "./edit_post_validator"
import { validation } from "@business/aux.js"

export function makeEditPostRouter(postRepo: PostRepository) {
  const editPostService = makeEditPostService(postRepo)

  return Router().put("/:id",
    validateEditPost,
    async (req: Request<{ id: number }, object, { mPost: string }>, res: Response) => {
      if (!validation(req, res)) return
      const { id } = req.params
      const { mPost } = req.body

      try {
        await editPostService.editPost({ id, mPost, userId: req.userId })
        res.status(200).json({ message: "Post edited" })
      } catch (error) {
        if (isExpressError(error as Error)) {
          res.status((error as ExpressError).statusCode).json({ message: (error as Error).message })
        } else {
          res.status(500).json({ error: (error as Error).message })
        }
      }
    })
}
