import { PostRepository } from "@db/post/post_repository.js"
import { GetPostResult } from "@db/post/post_repository.js"

interface ReadPostService {
  readPost: (params: { id: number }) => Promise<GetPostResult>
}

export function readPostService(postRepo: PostRepository): ReadPostService {
  return {
    async readPost({ id }) {
      return await postRepo.getPostById({ id })
    }
  }
}
