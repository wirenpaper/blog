import { Router, Request } from "express"
import { makeGetPostCommentsService } from "@business/comment/get_post_comments/get_post_comments_service.js"
import { CommentRepository } from "@db/comment/comment_repository.js"
import { CommentError, PostgressDBError } from "@src/errors.js"

export function makeGetPostCommentsRouter(commentRepo: CommentRepository) {
  const getPostCommentsService = makeGetPostCommentsService(commentRepo)

  return Router().get("/:postId", async (req: Request<{ postId: number }, object, object>, res) => {
    const { postId } = req.params
    try {
      const comments = await getPostCommentsService.getPostComments({ postId })
      res.json({ comments })
    } catch (error) {
      if (error instanceof CommentError || error instanceof PostgressDBError) {
        const { statusCode, name, func, message } = error
        res.status(statusCode).json({ name, func, message })
        return
      }
      res.json(error as Error)
    }
  })
}
