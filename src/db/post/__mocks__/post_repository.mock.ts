import {
  CheckPostOwnershipParams, EditPostByIdParams,
  GetPostResult, PostRepository
} from "@db/post/post_repository.js"
import { PostModel } from "../post_model.js"

export const mockPostRepo: jest.Mocked<PostRepository> = {
  createPost: jest.fn<Promise<PostModel>, [PostModel]>(),
  getPosts: jest.fn<Promise<GetPostResult[]>, [void]>(),
  getPostById: jest.fn<Promise<GetPostResult>, [{ id: number }]>(),
  checkPostOwnership: jest.fn<Promise<{ id: number } | undefined>, [CheckPostOwnershipParams]>(),
  editPostById: jest.fn<Promise<void>, [EditPostByIdParams]>(),
  deletePostById: jest.fn<Promise<void>, [{ id: number }]>()
}
