import { Router, Request, Response } from "express"
import { makeGetPostCommentsService } from "@business/comment/get_post_comments/get_post_comments_service.js"
import { CommentRepository } from "@db/comment/comment_repository.js"
import { ExpressError, isExpressError } from "@src/errors.js"
import { validateGetPostComments } from "./get_post_comments_validator"
import { validation } from "@business/aux.js"

export function makeGetPostCommentsRouter(commentRepo: CommentRepository) {
  const getPostCommentsService = makeGetPostCommentsService(commentRepo)

  return Router().get("/:postId",
    validateGetPostComments,
    async (req: Request<{ postId: number }, object, object>, res: Response) => {
      if (!validation(req, res)) return
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
