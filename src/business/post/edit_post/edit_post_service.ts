import { PostRepository } from "@db/post/post_repository.js"
import { createExpressError } from "@src/errors.js"

export interface EditPostParams {
  id: number,
  mPost: string,
  userId: number
}

export interface MakeEditPostService {
  editPost: (params: EditPostParams) => Promise<void>
}

export function makeEditPostService(postRepo: PostRepository): MakeEditPostService {
  return {
    async editPost({ id, mPost }) {
      const ownership = await postRepo.checkPostOwnership({ id })
      if (!ownership)
        throw createExpressError(403, "User trying to edit post not owned by them")
      await postRepo.editPostById({ id, mPost })
    }
  }
}
