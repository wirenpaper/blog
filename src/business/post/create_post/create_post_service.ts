import { PostRepository } from "../../../db/post/post_repository.js";
import { PostError } from "../../../errors.js";

interface PostParams {
  mPost: string,
  userId: number
}

interface PostResult {
  id: number,
  mPost: string,
  userId: number
}

export interface MakePostService {
  createPost: (params: PostParams) => Promise<PostResult | undefined>
}

export function makePostService(postRepo: PostRepository): MakePostService {
  return {
    async createPost({ mPost, userId }) {
      try {
        const post = await postRepo.createPost({ mPost, userId })
        if (!post) {
          throw new PostError(500, this.createPost, "failed to create post")
        }

        if (!post.id) {
          throw new PostError(500, this.createPost, "post id missing")
        }

        return { id: post.id, mPost: post.mPost, userId: post.userId }
      } catch (error) {
        throw error
      }
    }
  }
}
