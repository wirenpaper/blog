import { mockPostRepo } from "@db/post/__mocks__/post_repository.mock.js"
import { makeDeletePostService } from "@business/post/delete_post/delete_post_service.js"

jest.mock("@src/db.js")

describe("makeDeletePostService", () => {
  describe("deletePost", () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it("Success", async () => {
      // Arrange
      mockPostRepo.checkPostOwnership.mockResolvedValue({ userId: 1 })
      mockPostRepo.deletePostById.mockResolvedValue(undefined)

      // Act
      const result = await makeDeletePostService(mockPostRepo).deletePost({
        id: 1,
        userId: 2
      })

      // Assert
      expect(result).toEqual(undefined)
    })

    it("!ownership", async () => {
      // Arrange
      mockPostRepo.checkPostOwnership.mockResolvedValue(undefined)
      mockPostRepo.deletePostById.mockResolvedValue(undefined)

      // Act & Assert
      await expect(makeDeletePostService(mockPostRepo).deletePost({
        id: 1,
        userId: 2
      })).rejects.toMatchObject({
        statusCode: 403,
        message: "User is not the owner of this post"
      })
    })
  })
})
