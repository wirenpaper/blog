import { CommentRepository, GetPostCommentsSpecifications } from "@db/comment/commentRepository.js"
import { createExpressError } from "@src/errors.js"

export function makeGetPostCommentsService(commentRepo: CommentRepository): GetPostCommentsSpecifications {
  return {
    async getPostComments({ postId }) {
      const comments = await commentRepo.getPostComments({ postId })
      if (comments.length === 0)
        throw createExpressError(403, "no comments exist")
      return comments
    }
  }
}
