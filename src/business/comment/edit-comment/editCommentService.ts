import { userIdExists, verifyUser } from "@business/aux.js"
import { CommentRepository } from "@db/comment/commentRepository.js"
import { createExpressError } from "@src/errors.js"

interface EditCommentParams {
  id: number
  mComment: string
  userId?: number
}

export interface MakeEditCommentService {
  editComment: (params: EditCommentParams) => Promise<void>
}

export function makeEditCommentService(commentRepo: CommentRepository): MakeEditCommentService {
  return {
    async editComment({ id, mComment, userId }) {
      userIdExists(userId)
      const comment_ownership = await commentRepo.checkCommentOwnership({ id })
      if (!comment_ownership)
        throw createExpressError(500, "Owner doesnt exist")
      verifyUser(comment_ownership.userId, userId)

      await commentRepo.editComment({ id, mComment })
    }
  }
}
