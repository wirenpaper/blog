import { Router, Request } from "express"
import { CommentRepository } from "@db/comment/comment_repository.js"
import { makeCreateCommentService } from "@business/comment/create_comment/create_comment_service.js"
import { ExpressError, isExpressError } from "@src/errors.js"

export interface CreateCommentRequest {
  mComment: string
  postId: number
}

export function makeCreateCommentRouter(commentRepo: CommentRepository) {
  const createCommentService = makeCreateCommentService(commentRepo)
  return Router().post("/", async (req: Request<object, object, CreateCommentRequest>, res) => {
    try {
      const { mComment, postId } = req.body
      await createCommentService.createComment({ mComment, userId: req.userId, postId })
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
