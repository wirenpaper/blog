import { CommentRepository, CheckCommentOwnershipParams } from "../../../db/comment/comment_repository.js";
import { UserError } from "../../../errors.js";

interface MakeDeleteCommentService {
  deleteComment: (params: CheckCommentOwnershipParams) => Promise<void>
}

export function makeDeleteCommentService(commentRepo: CommentRepository): MakeDeleteCommentService {
  return {
    async deleteComment({ id, userId }) {
      try {
        const ownership = await commentRepo.checkCommentOwnership({ id, userId })
        if (!ownership) {
          throw new UserError(403, makeDeleteCommentService, "User does not own comment")
        }
        await commentRepo.deleteComment({ id })
      } catch (error) {
        throw error
      }
    }
  }
}
