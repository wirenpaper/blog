import { PostRepository } from "@db/post/post_repository.js"
import { userIdExists, verifyUser } from "@business/aux.js"

export interface EditPostParams {
  id: number,
  mPost: string,
  userId?: number
}

export interface MakeEditPostService {
  editPost: (params: EditPostParams) => Promise<void>
}

export function makeEditPostService(postRepo: PostRepository): MakeEditPostService {
  return {
    async editPost({ id, mPost, userId }) {
      userIdExists(userId)
      const post_ownership = await postRepo.checkPostOwnership({ id })
      verifyUser(post_ownership.userId, userId)
      await postRepo.editPostById({ id, mPost })
    }
  }
}
