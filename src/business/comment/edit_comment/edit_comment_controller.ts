import { Router, Request } from "express";
import { CommentRepository } from "@db/comment/comment_repository.js";
import { makeEditCommentService } from "@business/comment/edit_comment/edit_comment_service.js"
import { PostgressDBError, UserError } from "@src/errors.js";

export function makeEditCommentRouter(commentRepo: CommentRepository) {
  const editCommentService = makeEditCommentService(commentRepo)

  return Router().put("/:id", async (req: Request<{ id: number }, object, { mComment: string }>, res) => {
    try {
      const { id } = req.params
      const { mComment } = req.body
      const userId = req.userId
      if (!userId) {
        throw new UserError(403, makeEditCommentRouter, "User id does not exist")
      }
      await editCommentService.editComment({ id, mComment, userId })
      res.json({ message: "Comment updated" })
    } catch (error) {
      if (error instanceof PostgressDBError || error instanceof UserError) {
        const { statusCode, name, func, message } = error
        res.status(statusCode).json({ name, func, message })
        return
      }
      res.json(error as Error)
    }
  })
}
