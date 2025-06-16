import { mockCommentRepo } from "@db/comment/__mocks__/commentRepository.mock.js"
import { makeCreateCommentService } from "@business/comment/create-comment/createCommentService.js"
import { userIdExists } from "@business/aux.js"
import { createExpressError } from "@src/errors.js"

jest.mock("@src/db.js")
jest.mock("@business/aux.js", () => ({
  userIdExists: jest.fn()
}))

describe("makeCreateCommentService", () => {
  describe("createComment", () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it("Success", async () => {
      // Arrange
      mockCommentRepo.createComment.mockResolvedValue();
      (userIdExists as jest.Mock<undefined>).mockReturnValue(undefined)

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

    it("userId doesnt exist", async () => {
      mockCommentRepo.createComment.mockResolvedValue();
      (userIdExists as jest.Mock<undefined>).mockImplementation(() => {
        throw createExpressError(500, "req.userId does not exist")
      })

      // Act
      await expect(makeCreateCommentService(mockCommentRepo).createComment({
        mComment: "a new comment",
        postId: 32,
        userId: 23,
        id: 2
      })).rejects.toMatchObject({
        statusCode: 500,
        message: "req.userId does not exist"
      })
    })

    it("generic service error", async () => {
      const expressError = createExpressError(500, "some generic error")
      mockCommentRepo.createComment.mockRejectedValue(expressError);
      (userIdExists as jest.Mock<undefined>).mockReturnValue(undefined)


      await expect(makeCreateCommentService(mockCommentRepo).createComment({
        mComment: "a new comment",
        postId: 32,
        userId: 23,
        id: 2
      })).rejects.toMatchObject({
        statusCode: 500,
        message: "some generic error"
      })
    })
  })
})
