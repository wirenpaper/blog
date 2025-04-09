import { PostRepository } from "@db/post/post_repository.js"

export interface PostParams {
  mPost: string,
  userId: number
}

export interface PostResult {
  id: number,
  mPost: string,
  userId: number
}

export interface MakePostService {
  createPost: (params: PostParams) => Promise<PostResult>
}

export function makePostService(postRepo: PostRepository): MakePostService {
  return {
    async createPost({ mPost, userId }) {
      const post = await postRepo.createPost({ mPost, userId })
      return { id: post.id!, mPost: post.mPost, userId: post.userId }
    }
  }
}
