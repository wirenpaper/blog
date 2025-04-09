import { PostRepository } from "@db/post/post_repository.js"

export const mockPostRepo: jest.Mocked<PostRepository> = {
  createPost: jest.fn(),
  getPosts: jest.fn(),
  getPostById: jest.fn(),
  checkPostOwnership: jest.fn(),
  editPostById: jest.fn(),
  deletePostById: jest.fn()
}
