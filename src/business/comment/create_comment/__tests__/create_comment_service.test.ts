import { mockCommentRepo } from "@db/comment/__mocks__/comment_repository.mock.js"
import { makeCreateCommentService } from "@business/comment/create_comment/create_comment_service.js"

jest.mock("@src/db.js")

describe("makeCreateCommentService", () => {
  describe("createComment", () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it("Success", async () => {
      // Arrange
      mockCommentRepo.createComment.mockResolvedValue()

      // Act
      const result = await makeCreateCommentService(mockCommentRepo).createComment({
        mComment: "a new comment",
        postId: 32,
        userId: 23,
        id: 2
      })

      // Assert
      expect(result).toEqual(undefined)
    })
  })
})
