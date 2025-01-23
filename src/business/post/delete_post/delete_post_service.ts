import { PostRepository } from "../../../db/post/post_repository.js";
import { UserError } from "../../../errors.js";

interface DeletePostParams {
  id: number,
  userId: number
}

interface MakeDeletePostService {
  deletePost: (params: DeletePostParams) => Promise<void>
}

export function makeDeletePostService(postRepo: PostRepository): MakeDeletePostService {
  return {
    async deletePost({ id, userId }) {
      try {
        const ownership = await postRepo.checkPostOwnership({ id, userId })
        if (!ownership) {
          throw new UserError(403, makeDeletePostService, "User is not the owner of this post")
        }

        await postRepo.deletePostById({ id })
      } catch (error) {
        throw error
      }
    }
  }
}
