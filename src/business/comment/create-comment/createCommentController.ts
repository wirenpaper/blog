import { Router, Request, Response } from "express"
import { CommentRepository } from "@db/comment/commentRepository.js"
import { makeCreateCommentService } from "@business/comment/create-comment/createCommentService.js"
import { ExpressError, isExpressError } from "@src/errors.js"
import { validateCreateComment } from "@business/comment/create-comment/createCommentValidator.js"
import { validation } from "@business/aux.js"

export function makeCreateCommentRouter(commentRepo: CommentRepository) {
  const createCommentService = makeCreateCommentService(commentRepo)
  return Router().post("/:postId",
    validateCreateComment,
    async (req: Request<{ postId: number }, object, { mComment: string }>, res: Response) => {
      if (!validation(req, res)) return
      try {
        const { postId } = req.params
        const { mComment } = req.body
        await createCommentService.createComment({ mComment, userId: req.userId!, postId })
        res.json({ message: "Comment created" })
      } catch (error) {
        if (isExpressError(error as Error)) {
          res.status((error as ExpressError).statusCode).json({ message: (error as Error).message })
        } else {
          res.status(500).json({ error: (error as Error).message })
        }
      }
    })
}
