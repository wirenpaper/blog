import { CommentRepository } from "@db/comment/comment_repository.js"

export const mockCommentRepo: jest.Mocked<CommentRepository> = {
  checkCommentOwnership: jest.fn(),
  createComment: jest.fn(),
  deleteComment: jest.fn(),
  editComment: jest.fn(),
  checkCommentPostOwnership: jest.fn(),
  getPostComments: jest.fn()
}
