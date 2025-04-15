import { Router, Request } from "express"
import { CommentRepository } from "@db/comment/comment_repository.js"
import { makeDeleteCommentService } from "@business/comment/delete_comment/delete_comment_service.js"
import { userIdExists } from "@business/comment/delete_comment/delete_comment_controller_aux.js"
import { ExpressError, isExpressError } from "@src/errors.js"

export function makeDeleteCommentRouter(commentRepo: CommentRepository) {
  const deleteCommentService = makeDeleteCommentService(commentRepo)

  return Router().delete("/:id", async (req: Request<{ id: number }, object, object>, res) => {
    try {
      const { id } = req.params
      await deleteCommentService.deleteComment({ id, userId: userIdExists(req.userId) })
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
