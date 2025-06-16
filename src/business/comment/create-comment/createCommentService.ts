import { userIdExists } from "@business/aux.js"
import { CommentRepository, CreateComment } from "@db/comment/commentRepository.js"

export function makeCreateCommentService(commentRepo: CommentRepository): CreateComment {
  return {
    async createComment({ mComment, userId, postId }) {
      userIdExists(userId)
      await commentRepo.createComment({ mComment, userId, postId })
    }
  }
}
