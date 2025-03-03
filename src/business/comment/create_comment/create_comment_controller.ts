import { Router, Request } from "express"
import { CommentRepository } from "@db/comment/comment_repository.js"
import { makeCreateCommentService } from "@business/comment/create_comment/create_comment_service.js"
import { PostgressDBError, UserError } from "@src/errors.js"

interface CreateCommentRequest {
  mComment: string
  postId: number
}

export function makeCreateCommentRouter(commentRepo: CommentRepository) {
  const createCommentService = makeCreateCommentService(commentRepo)
  return Router().post("/", async (req: Request<object, object, CreateCommentRequest>, res) => {
    try {
      const { mComment, postId } = req.body
      const userId = req.userId

      if (!userId) {
        throw new UserError(403, makeCreateCommentRouter, "User id does not exist")
      }
      await createCommentService.createComment({ mComment, userId, postId })
      res.json({ message: "Comment created" })
    } catch (error) {
      if (error instanceof PostgressDBError || error instanceof UserError) {
        const { statusCode, name, func, message, } = error
        res.status(statusCode).json({ name, func, message })
      }

      res.status(500).json(error as Error)
    }
  })
}
