import { mockCommentRepo } from "@db/comment/__mocks__/commentRepository.mock.js"
import { makeDeleteCommentService } from "@business/comment/delete-comment/deleteCommentService.js"
import { userIdExists, verifyUser, verifyUserBool } from "@business/aux.js"
import { createExpressError } from "@src/errors.js"

jest.mock("@src/db.js")
jest.mock("@business/aux.js", () => ({
  verifyUser: jest.fn(),
  verifyUserBool: jest.fn(),
  userIdExists: jest.fn()
}))

describe("makeDeleteCommentService", () => {
  describe("deleteComment", () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it("Success; comment userId match", async () => {
      // Arrange
      mockCommentRepo.deleteComment.mockResolvedValue()
      mockCommentRepo.checkCommentOwnership.mockResolvedValue({ userId: 3, userName: "bro" });
      (userIdExists as jest.Mock<undefined>).mockReturnValue(undefined);
      (verifyUserBool as jest.Mock<boolean>).mockReturnValue(true)

      // Act
      const result = await makeDeleteCommentService(mockCommentRepo).deleteComment({
        id: 2,
        userId: 3
      })

      // Assert
      expect(result).toEqual(undefined)
    })

    it("Success; post userId match", async () => {
      // Arrange
      mockCommentRepo.deleteComment.mockResolvedValue()
      mockCommentRepo.checkCommentPostOwnership.mockResolvedValue({ userId: 3, mComment: "bra", mPost: "wot" });
      (userIdExists as jest.Mock<undefined>).mockReturnValue(undefined);
      (verifyUserBool as jest.Mock<boolean>).mockReturnValue(false);
      (verifyUser as jest.Mock<undefined>).mockReturnValue(undefined)

      // Act
      const result = await makeDeleteCommentService(mockCommentRepo).deleteComment({
        id: 2,
        userId: 3
      })

      // Assert
      expect(result).toEqual(undefined)
    })

    it("Failure; userId doesnt match", async () => {
      // Arrange
      mockCommentRepo.deleteComment.mockResolvedValue();
      (userIdExists as jest.Mock<undefined>).mockReturnValue(undefined);
      (verifyUserBool as jest.Mock<boolean>).mockReturnValue(false);
      (verifyUser as jest.Mock<undefined>).mockImplementation(() => {
        throw createExpressError(500, "user verification failed")
      })

      // Act && Assert
      await expect(makeDeleteCommentService(mockCommentRepo).deleteComment({
        id: 2,
        userId: 3
      })).rejects.toMatchObject({
        statusCode: 500,
        message: "user verification failed"
      })
    })

    it("Failure; userId doesnt exist", async () => {
      // Arrange
      mockCommentRepo.deleteComment.mockResolvedValue();
      (userIdExists as jest.Mock<undefined>).mockImplementation(() => {
        throw createExpressError(500, "req.userId does not exist")
      })

      // Act && Assert
      await expect(makeDeleteCommentService(mockCommentRepo).deleteComment({
        id: 2,
        userId: 3
      })).rejects.toMatchObject({
        statusCode: 500,
        message: "req.userId does not exist"
      })
    })

    it("Failure; generic error", async () => {
      // Arrange
      const expressError = createExpressError(500, "generic error")
      mockCommentRepo.deleteComment.mockRejectedValue(expressError);
      (userIdExists as jest.Mock<undefined>).mockReturnValue(undefined);
      (verifyUser as jest.Mock<undefined>).mockReturnValue(undefined)

      // Act && Assert
      await expect(makeDeleteCommentService(mockCommentRepo).deleteComment({
        id: 2,
        userId: 3
      })).rejects.toMatchObject({
        statusCode: 500,
        message: "generic error"
      })
    })
  })
})
