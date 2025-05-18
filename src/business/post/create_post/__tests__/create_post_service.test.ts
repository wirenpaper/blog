import { mockPostRepo } from "@db/post/__mocks__/post_repository.mock.js"
import { makePostService } from "@business/post/create_post/create_post_service.js"
import { userIdExists } from "@business/aux.js"
import { createExpressError } from "@src/errors.js"

jest.mock("@src/db.js")
jest.mock("@business/aux.js", () => ({
  userIdExists: jest.fn()
}))

describe("makePostService", () => {
  describe("createPost", () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it("Success", async () => {
      // Arrange
      mockPostRepo.createPost.mockResolvedValue({
        id: 3,
        mPost: "haha you lolol",
        userId: 32
      });
      (userIdExists as jest.Mock<undefined>).mockReturnValue(undefined)

      // Act
      const result = await makePostService(mockPostRepo).createPost({
        mPost: "haha",
        userId: 321
      })

      // Assert
      expect(result).toMatchObject({
        id: 3,
        mPost: "haha you lolol",
        userId: 32
      })
    })

    it("some failure", async () => {
      // Arrange
      mockPostRepo.createPost.mockResolvedValue({
        id: 3,
        mPost: "haha you lolol",
        userId: 32
      });
      (userIdExists as jest.Mock<undefined>).mockImplementation(() => {
        throw createExpressError(500, "req.userId does not exist")
      })

      // throw createExpressError(500, "req.userId does not exist")

      // Act & Assert
      await expect(makePostService(mockPostRepo).createPost({
        mPost: "haha",
        userId: 321
      })).rejects.toMatchObject({
        statusCode: 500,
        message: "req.userId does not exist"
      })
    })

    it("some generic error", async () => {
      // Arrange
      const expressError = createExpressError(500, "generic error")
      mockPostRepo.createPost.mockRejectedValue(expressError);
      (userIdExists as jest.Mock<undefined>).mockReturnValue(undefined)

      // throw createExpressError(500, "req.userId does not exist")

      // Act & Assert
      await expect(makePostService(mockPostRepo).createPost({
        mPost: "haha",
        userId: 321
      })).rejects.toMatchObject({
        statusCode: 500,
        message: "generic error"
      })
    })
  })
})
