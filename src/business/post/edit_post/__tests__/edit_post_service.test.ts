import { mockPostRepo } from "@db/post/__mocks__/post_repository.mock.js"
import { makeEditPostService } from "@business/post/edit_post/edit_post_service.js"

jest.mock("@src/db.js")

describe("makeEditPostService", () => {
  describe("editPost", () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it("Success", async () => {
      // Arrange
      mockPostRepo.checkPostOwnership.mockResolvedValue({ id: 1 })
      mockPostRepo.editPostById.mockResolvedValue(undefined)

      // Act
      const result = await makeEditPostService(mockPostRepo).editPost({
        id: 22,
        mPost: "bobob",
        userId: 33
      })

      // Assert
      expect(result).toEqual(undefined)
    })

    it("!ownership", async () => {
      // Arrange
      mockPostRepo.checkPostOwnership.mockResolvedValue(undefined)
      mockPostRepo.editPostById.mockResolvedValue(undefined)

      // Act & Assert
      await expect(makeEditPostService(mockPostRepo).editPost({
        id: 22,
        mPost: "bobob",
        userId: 33
      })).rejects.toMatchObject({
        statusCode: 403,
        message: "User trying to edit post not owned by them"
      })
    })
  })
})
