import { PostRepository } from "@db/post/post_repository.js"
import { createExpressError } from "@src/errors.js"
import { GetPostResult } from "@db/post/post_repository.js"

export interface MakeReadPostsService {
  readPosts: (params: void) => Promise<GetPostResult[]>
}

export function makeReadPostsService(postRepo: PostRepository): MakeReadPostsService {
  return {
    async readPosts() {
      const posts = await postRepo.getPosts()
      if (posts.length === 0)
        throw createExpressError(500, "Post doesnt exist")
      return posts
    }
  }
}
