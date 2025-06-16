import { mockCommentRepo } from "@db/comment/__mocks__/comment_repository.mock.js"
import { makeEditCommentService } from "@business/comment/edit-comment/editCommentService.js"
import { verifyUser, userIdExists } from "@business/aux.js"
import { createExpressError } from "@src/errors.js"

jest.mock("@src/db.js")
jest.mock("@business/aux.js", () => ({
  verifyUser: jest.fn(),
  userIdExists: jest.fn()
}))

describe("makeEditCommentService", () => {
  describe("editComment", () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it("Success", async () => {
      // Arrange
      mockCommentRepo.editComment.mockResolvedValue()
      mockCommentRepo.checkCommentOwnership.mockResolvedValue({ userId: 3, userName: "boo" });
      (verifyUser as jest.Mock<undefined>).mockReturnValue(undefined);
      (userIdExists as jest.Mock<undefined>).mockReturnValue(undefined)

      // Act
      const result = await makeEditCommentService(mockCommentRepo).editComment({
        id: 2,
        mComment: "ahha",
        userId: 3
      })

      // Assert
      expect(result).toEqual(undefined)
    })

    it("Failure; userId doesnt exist", async () => {
      // Arrange
      const expressError = createExpressError(500, "req.userId does not exist")
      mockCommentRepo.editComment.mockResolvedValue()
      mockCommentRepo.checkCommentOwnership.mockResolvedValue({ userId: 3, userName: "boo" });
      (verifyUser as jest.Mock<undefined>).mockReturnValue(undefined);
      (userIdExists as jest.Mock<undefined>).mockImplementation(() => {
        throw expressError
      })

      // Act & Assert
      await expect(makeEditCommentService(mockCommentRepo).editComment({
        id: 2,
        mComment: "ahha",
        userId: 3
      })).rejects.toMatchObject(expressError)
    })

    it("Failure; user not same", async () => {
      // Arrange
      const expressError = createExpressError(500, "user verification failed")

      // throw createExpressError(500, "post doesnt belong to user")
      mockCommentRepo.editComment.mockResolvedValue()
      mockCommentRepo.checkCommentOwnership.mockResolvedValue({ userId: 3, userName: "boo" });
      (verifyUser as jest.Mock<undefined>).mockImplementation(() => {
        throw expressError
      });
      (userIdExists as jest.Mock<undefined>).mockReturnValue(undefined)

      // Act & Assert
      await expect(makeEditCommentService(mockCommentRepo).editComment({
        id: 2,
        mComment: "ahha",
        userId: 3
      })).rejects.toMatchObject(expressError)
    })

    it("Generic service failure from editComment", async () => {
      const genericError = createExpressError(500, "generic error")
      mockCommentRepo.editComment.mockRejectedValue(genericError)
      mockCommentRepo.checkCommentOwnership.mockResolvedValue({ userId: 3, userName: "boo" });
      (verifyUser as jest.Mock<undefined>).mockReturnValue(undefined);
      (userIdExists as jest.Mock<undefined>).mockReturnValue(undefined)

      // Act & Assert
      await expect(makeEditCommentService(mockCommentRepo).editComment({
        id: 2,
        mComment: "ahha",
        userId: 3
      })).rejects.toMatchObject(genericError)
    })

    it("Generic service failure from checkCommentOwnership", async () => {
      const genericError = createExpressError(500, "generic error")
      mockCommentRepo.editComment.mockResolvedValue(undefined)
      mockCommentRepo.checkCommentOwnership.mockRejectedValue(genericError);
      (verifyUser as jest.Mock<undefined>).mockReturnValue(undefined);
      (userIdExists as jest.Mock<undefined>).mockReturnValue(undefined)

      // Act & Assert
      await expect(makeEditCommentService(mockCommentRepo).editComment({
        id: 2,
        mComment: "ahha",
        userId: 3
      })).rejects.toMatchObject(genericError)
    })

  })
})
