import { CommentRepository } from "@db/comment/comment_repository.js"
import { createExpressError } from "@src/errors.js"

interface EditCommentParams {
  id: number
  mComment: string
  userId: number
}

interface MakeEditCommentService {
  editComment: (params: EditCommentParams) => Promise<void>
}

export function makeEditCommentService(commentRepo: CommentRepository): MakeEditCommentService {
  return {
    async editComment({ id, mComment, userId }) {
      const ownership = await commentRepo.checkCommentOwnership({ id, userId })
      if (!ownership)
        throw createExpressError(403, "User does not own comment")

      await commentRepo.editComment({ id, mComment })
    }
  }
}
