import { CommentRepository, CheckCommentOwnershipParams } from "@db/comment/comment_repository.js"
import { createExpressError } from "@src/errors.js"

interface MakeDeleteCommentService {
  deleteComment: (params: CheckCommentOwnershipParams) => Promise<void>
}

export function makeDeleteCommentService(commentRepo: CommentRepository): MakeDeleteCommentService {
  return {
    async deleteComment({ id, userId }) {
      const ownership = await commentRepo.checkCommentOwnership({ id, userId })
      if (!ownership)
        throw createExpressError(403, "User does not own comment")

      await commentRepo.deleteComment({ id })
    }
  }
}
