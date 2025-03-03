import { PostRepository } from "@db/post/post_repository.js";
import { UserError } from "@src/errors.js";

interface EditPostParams {
  id: number,
  mPost: string,
  userId: number
}

interface MakeEditPostService {
  editPost: (params: EditPostParams) => Promise<void>
}

export function makeEditPostService(postRepo: PostRepository): MakeEditPostService {
  return {
    async editPost({ id, mPost, userId }) {
      try {
        const ownership = await postRepo.checkPostOwnership({ id, userId })
        if (!ownership)
          throw new UserError(403, makeEditPostService, "User trying to edit post not owned by them")
        await postRepo.editPostById({ id, mPost })
      } catch (error) {
        throw error
      }
    }
  }
}
