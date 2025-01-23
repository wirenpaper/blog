import { CommentRepository, GetPostCommentsSpecifications } from "../../../db/comment/comment_repository.js";
import { CommentError } from "../../../errors.js";

export function makeGetPostCommentsService(commentRepo: CommentRepository): GetPostCommentsSpecifications {
  return {
    async getPostComments({ postId }) {
      try {
        const comments = await commentRepo.getPostComments({ postId })
        if (!comments) {
          throw new CommentError(403, makeGetPostCommentsService, "no comments exist")
        }
        return comments
      } catch (error) {
        throw error
      }
    }
  }
}
