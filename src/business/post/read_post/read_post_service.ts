import { PostRepository } from "@db/post/post_repository.js";
import { PostError } from "@src/errors.js";
import { GetPostResult } from "@db/post/post_repository.js";

interface MakeReadPostService {
  readPost: (params: { id: number }) => Promise<GetPostResult>
}

export function makeReadPostService(postRepo: PostRepository): MakeReadPostService {
  return {
    async readPost({ id }) {
      try {
        const post = await postRepo.getPostById({ id })
        if (!post) {
          throw new PostError(500, this.readPost, "post does not exist")
        }
        return post
      } catch (error) {
        throw error
      }
    }
  }
}
