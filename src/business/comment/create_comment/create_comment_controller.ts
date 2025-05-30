import { Router, Request, Response } from "express"
import { CommentRepository } from "@db/comment/comment_repository.js"
import { makeCreateCommentService } from "@business/comment/create_comment/create_comment_service.js"
import { ExpressError, isExpressError } from "@src/errors.js"
import { validateCreateComment } from "./create_comment_validator"
import { validationResult } from "express-validator"

export interface CreateCommentRequest {
  mComment: string
  postId: number
}

export function makeCreateCommentRouter(commentRepo: CommentRepository) {
  const createCommentService = makeCreateCommentService(commentRepo)
  return Router().post("/",
    validateCreateComment,
    async (req: Request<object, object, CreateCommentRequest>, res: Response) => {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(err => (err.msg as string)).join(", ")
        res.status(400).json({ message: errorMessages })
        return
      }
      try {
        const { mComment, postId } = req.body
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
