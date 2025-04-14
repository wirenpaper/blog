import { CommentRepository, CreateComment } from "@db/comment/comment_repository.js"

export function makeCreateCommentService(commentRepo: CommentRepository): CreateComment {
  return {
    async createComment({ mComment, userId, postId }) {
      await commentRepo.createComment({ mComment, userId, postId })
    }
  }
}
