import { Router, Request, Response } from "express"
import { CommentRepository } from "@db/comment/commentRepository.js"
import { makeDeleteCommentService } from "@business/comment/delete-comment/deleteCommentService.js"
import { ExpressError, isExpressError } from "@src/errors.js"
import { validateDeleteComment } from "@business/comment/delete-comment/deleteCommentValidator.js"
import { validation } from "@business/aux.js"

export function makeDeleteCommentRouter(commentRepo: CommentRepository) {
  const deleteCommentService = makeDeleteCommentService(commentRepo)

  return Router().delete("/:id",
    validateDeleteComment,
    async (req: Request<{ id: number }, object, object>, res: Response) => {
      if (!validation(req, res)) return
      try {
        const { id } = req.params
        await deleteCommentService.deleteComment({ id, userId: req.userId })
        res.json({ message: "Comment deleted" })
      } catch (error) {
        if (isExpressError(error as Error)) {
          res.status((error as ExpressError).statusCode).json({ message: (error as Error).message })
        } else {
          res.status(500).json({ error: (error as Error).message })
        }
      }
    })
}
