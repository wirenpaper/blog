import { userIdExists, verifyUser, verifyUserBool } from "@business/aux.js"
import { CommentRepository } from "@db/comment/commentRepository.js"

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
      userIdExists(userId)
      if (!verifyUserBool(userId, comment_ownership.userId)) {
        const comment_post_ownership = await commentRepo.checkCommentPostOwnership({ id })
        verifyUser(userId, comment_post_ownership.userId)
      }
      await commentRepo.deleteComment({ id })
    }
  }
}
