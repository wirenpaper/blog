import { CommentRepository } from "../../../db/comment/comment_repository.js";
import { UserError } from "../../../errors.js";

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
      try {
        const ownership = await commentRepo.checkCommentOwnership({ id, userId })
        if (!ownership) {
          throw new UserError(403, makeEditCommentService, "User does not exist")
        }

        await commentRepo.editComment({ id, mComment })
      } catch (error) {
        throw error
      }
    }
  }
}
