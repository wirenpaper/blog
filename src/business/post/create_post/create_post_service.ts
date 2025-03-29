import { PostRepository } from "@db/post/post_repository.js"
import { PostError } from "@src/errors.js"

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
