import { userIdExists, verifyUser } from "@business/aux.js"
import { CommentRepository } from "@db/comment/comment_repository.js"
import { createExpressError } from "@src/errors.js"

interface deleteCommentParams {
  id: number,
  userId?: number
}
export interface MakeDeleteCommentService {
  deleteComment: (params: deleteCommentParams) => Promise<void>
}

export function makeDeleteCommentService(commentRepo: CommentRepository): MakeDeleteCommentService {
  return {
    async deleteComment({ id, userId }) {
      const comment_ownership = await commentRepo.checkCommentOwnership({ id })
      if (!comment_ownership)
        throw createExpressError(403, "User does not own comment")
      userIdExists(userId)
      verifyUser(userId, comment_ownership.userId)
      await commentRepo.deleteComment({ id })
    }
  }
}
