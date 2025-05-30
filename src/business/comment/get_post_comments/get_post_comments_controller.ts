import { Router, Request, Response } from "express"
import { makeGetPostCommentsService } from "@business/comment/get_post_comments/get_post_comments_service.js"
import { CommentRepository } from "@db/comment/comment_repository.js"
import { ExpressError, isExpressError } from "@src/errors.js"
import { validateGetPostComments } from "./get_post_comments_validator"
import { validationResult } from "express-validator"

export function makeGetPostCommentsRouter(commentRepo: CommentRepository) {
  const getPostCommentsService = makeGetPostCommentsService(commentRepo)

  return Router().get("/:postId",
    validateGetPostComments,
    async (req: Request<{ postId: number }, object, object>, res: Response) => {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(err => (err.msg as string)).join(", ")
        res.status(400).json({ message: errorMessages })
        return
      }
      const { postId } = req.params
      try {
        const comments = await getPostCommentsService.getPostComments({ postId })
        res.json({ comments })
      } catch (error) {
        if (isExpressError(error as Error)) {
          res.status((error as ExpressError).statusCode).json({ message: (error as Error).message })
        } else {
          res.status(500).json({ error: (error as Error).message })
        }
      }
    })
}
