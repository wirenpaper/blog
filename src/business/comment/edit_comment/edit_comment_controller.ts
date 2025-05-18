import { Router, Request } from "express"
import { CommentRepository } from "@db/comment/comment_repository.js"
import { makeEditCommentService } from "@business/comment/edit_comment/edit_comment_service.js"
import { ExpressError, isExpressError } from "@src/errors.js"
// import { userIdExists } from "@business/comment/edit_comment/edit_comment_controller_aux.js"

export function makeEditCommentRouter(commentRepo: CommentRepository) {
  const editCommentService = makeEditCommentService(commentRepo)

  return Router().put("/:id", async (req: Request<{ id: number }, object, { mComment: string }>, res) => {
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
