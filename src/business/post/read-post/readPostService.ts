import { PostRepository } from "@db/post/postRepository.js"
import { GetPostResult } from "@db/post/postRepository.js"

export interface MakeReadPostService {
  readPost: (params: { id: number }) => Promise<GetPostResult>
}

export function makeReadPostService(postRepo: PostRepository): MakeReadPostService {
  return {
    async readPost({ id }) {
      return await postRepo.getPostById({ id })
    }
  }
}
