import { PostRepository } from "@db/post/post_repository.js"
import { GetPostResult } from "@db/post/post_repository.js"

interface MakeReadPostService {
  readPost: (params: { id: number }) => Promise<GetPostResult>
}

export function makeReadPostService(postRepo: PostRepository): MakeReadPostService {
  return {
    async readPost({ id }) {
      return await postRepo.getPostById({ id })
    }
  }
}
