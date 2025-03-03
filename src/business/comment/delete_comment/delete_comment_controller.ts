import { Router, Request } from "express";
import { CommentRepository } from "@db/comment/comment_repository.js";
import { makeDeleteCommentService } from "@business/comment/delete_comment/delete_comment_service.js"
import { PostgressDBError, UserError } from "@src/errors.js";

export function makeDeleteCommentRouter(commentRepo: CommentRepository) {
  const deleteCommentService = makeDeleteCommentService(commentRepo)

  return Router().delete("/:id", async (req: Request<{ id: number }, object, object>, res) => {
    const { id } = req.params
    const userId = req.userId

    try {
      if (!userId) {
        throw new UserError(403, makeDeleteCommentRouter, "User id does not exist")
      }
      await deleteCommentService.deleteComment({ id, userId })
      res.json({ message: "Comment deleted" })
    } catch (error) {
      if (error instanceof PostgressDBError || error instanceof UserError || error instanceof UserError) {
        const { statusCode, name, func, message } = error
        res.status(statusCode).json({ name, func, message })
        return
      }
      res.json(error as Error)
    }
  })
}
