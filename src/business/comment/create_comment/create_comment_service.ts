import { CommentRepository, CreateComment } from "@db/comment/comment_repository.js"

export function makeCreateCommentService(commentRepo: CommentRepository): CreateComment {
  return {
    async createComment({ mComment, userId, postId }) {
      try {
        await commentRepo.createComment({ mComment, userId, postId })
      } catch (error) {
        throw error
      }
    }
  }
}
