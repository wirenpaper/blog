import { mockPostRepo } from "@db/post/__mocks__/post_repository.mock.js"
import { readPostService } from "@business/post/read_post/read_post_service.js"

jest.mock("@src/db.js")

describe("makePostService", () => {
  describe("createPost", () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it("Success", async () => {
      // Arrange
      mockPostRepo.getPostById.mockResolvedValue({
        id: 1,
        mPost: "hahapost",
        userId: 2,
        userName: "jom"
      })

      // Act
      const result = await readPostService(mockPostRepo).readPost({
        id: 1
      })

      // Assert
      expect(result).toMatchObject({
        id: 1,
        mPost: "hahapost",
        userId: 2,
        userName: "jom"
      })
    })
  })
})

