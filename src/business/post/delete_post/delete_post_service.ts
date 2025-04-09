import { PostRepository } from "@db/post/post_repository.js"
import { createExpressError } from "@src/errors.js"

export interface DeletePostParams {
  id: number,
  userId: number
}

export interface MakeDeletePostService {
  deletePost: (params: DeletePostParams) => Promise<void>
}

export function makeDeletePostService(postRepo: PostRepository): MakeDeletePostService {
  return {
    async deletePost({ id, userId }) {
      const ownership = await postRepo.checkPostOwnership({ id, userId })
      if (!ownership)
        throw createExpressError(403, "User is not the owner of this post")
      await postRepo.deletePostById({ id })
    }
  }
}
