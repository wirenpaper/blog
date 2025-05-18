import { userIdExists } from "@business/aux.js"
import { PostRepository } from "@db/post/post_repository.js"

export interface PostParams {
  mPost: string,
  userId?: number
}

export interface PostResult {
  id?: number,
  mPost: string,
  userId: number
}

export interface MakePostService {
  createPost: (params: PostParams) => Promise<PostResult>
}

export function makePostService(postRepo: PostRepository): MakePostService {
  return {
    async createPost({ mPost, userId }) {
      userIdExists(userId)
      const post = await postRepo.createPost({ mPost, userId: userId! })
      return { id: post.id, mPost: post.mPost, userId: post.userId }
    }
  }
}
