import { mockCommentRepo } from "@db/comment/__mocks__/comment_repository.mock.js"
import { makeEditCommentService } from "@business/comment/edit_comment/edit_comment_service.js"

jest.mock("@src/db.js")

describe("makeEditCommentService", () => {
  describe("editComment", () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it("Success", async () => {
      // Arrange
      mockCommentRepo.editComment.mockResolvedValue()
      mockCommentRepo.checkCommentOwnership.mockResolvedValue({ id: 3 })

      // Act
      const result = await makeEditCommentService(mockCommentRepo).editComment({
        id: 3,
        mComment: "ahha",
        userId: 2
      })

      // Assert
      expect(result).toEqual(undefined)
    })

    it("Failure; !ownership", async () => {
      // Arrange
      mockCommentRepo.editComment.mockResolvedValue()
      mockCommentRepo.checkCommentOwnership.mockResolvedValue(undefined)

      // Act & Assert
      await expect(makeEditCommentService(mockCommentRepo).editComment({
        id: 3,
        mComment: "ahha",
        userId: 2
      })).rejects.toMatchObject({
        statusCode: 403,
        message: "User does not own comment"
      })
    })
  })
})
