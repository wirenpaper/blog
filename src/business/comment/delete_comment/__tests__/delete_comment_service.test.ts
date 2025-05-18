import { mockCommentRepo } from "@db/comment/__mocks__/comment_repository.mock.js"
import { makeDeleteCommentService } from "@business/comment/delete_comment/delete_comment_service.js"

jest.mock("@src/db.js")

describe("makeDeleteCommentService", () => {
  describe("deleteComment", () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it("Success", async () => {
      // Arrange
      mockCommentRepo.deleteComment.mockResolvedValue()
      mockCommentRepo.checkCommentOwnership.mockResolvedValue({ userId: 3, userName: "bro" })

      // Act
      const result = await makeDeleteCommentService(mockCommentRepo).deleteComment({
        id: 2,
        userId: 3
      })

      // Assert
      expect(result).toEqual(undefined)
    })

    /*
     *     it("Failure; !ownership", async () => {
     *       // Arrange
     *       mockCommentRepo.deleteComment.mockResolvedValue()
     *       mockCommentRepo.checkCommentOwnership.mockResolvedValue(undefined)
     * 
     *       // Act & Assert
     *       await expect(makeDeleteCommentService(mockCommentRepo).deleteComment({
     *         id: 3,
     *         userId: 4
     *       })).rejects.toMatchObject({
     *         statusCode: 403,
     *         message: "User does not own comment"
     *       })
     *     })
     */
  })
})
