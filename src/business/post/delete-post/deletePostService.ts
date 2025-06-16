import { userIdExists, verifyUser } from "@business/aux.js"
import { CheckPostOwnershipResult, PostRepository } from "@db/post/postRepository.js"

export interface MakeDeletePostService {
  deletePost: (params: CheckPostOwnershipResult) => Promise<void>
}

export function makeDeletePostService(postRepo: PostRepository): MakeDeletePostService {
  return {
    async deletePost({ id, userId }) {
      const res = await postRepo.checkPostOwnership({ id })
      userIdExists(res.userId)
      userIdExists(userId)
      verifyUser(userId, res.userId)
      await postRepo.deletePostById({ id })
    }
  }
}
