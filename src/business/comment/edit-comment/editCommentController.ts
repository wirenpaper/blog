import { Router, Request, Response } from "express"
import { CommentRepository } from "@db/comment/commentRepository.js"
import { makeEditCommentService } from "@business/comment/edit-comment/editCommentService.js"
import { ExpressError, isExpressError } from "@src/errors.js"
import { validateEditComment } from "@business/comment/edit-comment/editCommentValidator.js"
import { validation } from "@business/aux.js"

export function makeEditCommentRouter(commentRepo: CommentRepository) {
  const editCommentService = makeEditCommentService(commentRepo)

  return Router().put("/:id",
    validateEditComment,
    async (req: Request<{ id: number }, object, { mComment: string }>, res: Response) => {
      if (!validation(req, res)) return
      try {
        const { id } = req.params
        const { mComment } = req.body
        await editCommentService.editComment({ id, mComment, userId: req.userId })
        res.json({ message: "Comment updated" })
      } catch (error) {
        if (isExpressError(error as Error)) {
          res.status((error as ExpressError).statusCode).json({ message: (error as Error).message })
        } else {
          res.status(500).json({ error: (error as Error).message })
        }
      }
    })
}
