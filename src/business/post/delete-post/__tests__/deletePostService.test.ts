import { mockPostRepo } from "@db/post/__mocks__/postRepository.mock.js"
import { makeDeletePostService } from "@business/post/delete-post/deletePostService.js"
import { userIdExists, verifyUser } from "@business/aux.js"
import { createExpressError } from "@src/errors.js"

jest.mock("@src/db.js")

jest.mock("@business/aux.js", () => ({
  userIdExists: jest.fn(),
  verifyUser: jest.fn()
}))

describe("makeDeletePostService", () => {
  describe("deletePost", () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it("Success", async () => {
      // Arrange
      mockPostRepo.checkPostOwnership.mockResolvedValue({ userId: 1, id: 1 })
      mockPostRepo.deletePostById.mockResolvedValue(undefined);
      (userIdExists as jest.Mock<undefined>).mockReturnValue(undefined);
      (verifyUser as jest.Mock<undefined>).mockReturnValue(undefined)

      // Act
      const result = await makeDeletePostService(mockPostRepo).deletePost({
        id: 2,
        userId: 1
      })

      // Assert
      expect(result).toEqual(undefined)
    })

    it("userId does not exist", async () => {
      // Arrange
      mockPostRepo.checkPostOwnership.mockResolvedValue({ userId: 1, id: 1 })
      mockPostRepo.deletePostById.mockResolvedValue(undefined)
      const expressError = createExpressError(500, "req.userId does not exist");
      (userIdExists as jest.Mock<undefined>).mockImplementation(() => {
        throw expressError // Executes this code and throws synchronously
      });
      (verifyUser as jest.Mock<undefined>).mockReturnValue(undefined)

      // Act & Assert
      await expect(makeDeletePostService(mockPostRepo).deletePost({
        id: 2,
        userId: 1
      })).rejects.toMatchObject(expressError)
    })

    it("verifyUser failure", async () => {
      // Arrange
      mockPostRepo.checkPostOwnership.mockResolvedValue({ userId: 1, id: 1 })
      mockPostRepo.deletePostById.mockResolvedValue(undefined)
      const expressError = createExpressError(500, "post doesnt belong to user");
      (verifyUser as jest.Mock<undefined>).mockImplementation(() => {
        throw expressError // Executes this code and throws synchronously
      });
      (userIdExists as jest.Mock<undefined>).mockReturnValue(undefined)

      // Act & Assert
      await expect(makeDeletePostService(mockPostRepo).deletePost({
        id: 2,
        userId: 1
      })).rejects.toMatchObject(expressError)
    })
  })
})
