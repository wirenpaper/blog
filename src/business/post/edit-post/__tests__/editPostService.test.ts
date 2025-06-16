import { mockPostRepo } from "@db/post/__mocks__/post_repository.mock.js"
import { makeEditPostService } from "@business/post/edit-post/editPostService.js"
import { userIdExists, verifyUser } from "@business/aux.js"
import { createExpressError } from "@src/errors.js"

jest.mock("@src/db.js")
jest.mock("@business/aux.js", () => ({
  userIdExists: jest.fn(),
  verifyUser: jest.fn()
}))

describe("makeEditPostService", () => {
  describe("editPost", () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it("Success", async () => {
      // Arrange
      mockPostRepo.checkPostOwnership.mockResolvedValue({ userId: 1, id: 1 })
      mockPostRepo.editPostById.mockResolvedValue(undefined);
      (userIdExists as jest.Mock<undefined>).mockReturnValue(undefined);
      (verifyUser as jest.Mock<undefined>).mockReturnValue(undefined)

      // Act
      const result = await makeEditPostService(mockPostRepo).editPost({
        id: 22,
        mPost: "bobob",
        userId: 33
      })

      // Assert
      expect(result).toEqual(undefined)
    })

    it("userId doesnt exist", async () => {
      // Arrange
      const expressError = createExpressError(500, "req.userId does not exist")
      mockPostRepo.checkPostOwnership.mockResolvedValue({ userId: 1, id: 1 })
      mockPostRepo.editPostById.mockResolvedValue(undefined);
      (userIdExists as jest.Mock<number>).mockImplementation(() => {
        throw expressError // Executes this code and throws synchronously
      });
      (verifyUser as jest.Mock<undefined>).mockReturnValue(undefined)

      // Act & Assert
      await expect(makeEditPostService(mockPostRepo).editPost({
        id: 22,
        mPost: "bobob",
        userId: 33
      })).rejects.toMatchObject(expressError)
    })

    it("post doesnt have owner", async () => {
      // Arrange
      const expressError = createExpressError(500, "no results")
      mockPostRepo.checkPostOwnership.mockRejectedValue(expressError)
      mockPostRepo.editPostById.mockResolvedValue(undefined);
      (userIdExists as jest.Mock<undefined>).mockReturnValue(undefined);
      (verifyUser as jest.Mock<undefined>).mockReturnValue(undefined)

      // Act & Assert
      await expect(makeEditPostService(mockPostRepo).editPost({
        id: 22,
        mPost: "bobob",
        userId: 33
      })).rejects.toMatchObject(expressError)
    })

    it("user not verified", async () => {
      // Arrange
      const expressError = createExpressError(500, "post doesnt belong to user")
      mockPostRepo.checkPostOwnership.mockRejectedValue(expressError)
      mockPostRepo.editPostById.mockResolvedValue(undefined);
      (userIdExists as jest.Mock<undefined>).mockReturnValue(undefined);
      (verifyUser as jest.Mock<undefined>).mockImplementation(() => {
        throw expressError
      })

      // throw createExpressError(500, "post doesnt belong to user")

      // Act & Assert
      await expect(makeEditPostService(mockPostRepo).editPost({
        id: 22,
        mPost: "bobob",
        userId: 33
      })).rejects.toMatchObject(expressError)
    })

  })
})
