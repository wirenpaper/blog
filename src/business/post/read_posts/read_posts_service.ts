import { PostRepository } from "../../../db/post/post_repository.js"
import { PostError } from "../../../errors.js"
import { GetPostResult } from "../../../db/post/post_repository.js"

export interface MakeReadPostsService {
  readPosts: (params: void) => Promise<GetPostResult[]>
}

export function makeReadPostsService(postRepo: PostRepository): MakeReadPostsService {
  return {
    async readPosts() {
      try {
        const posts = await postRepo.getPosts()
        if (!posts) {
          throw new PostError(500, this.readPosts, "Post doesnt exist")
        }
        return posts
      } catch (error) {
        throw error
      }
    }
  }
}
