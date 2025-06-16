import { mockPostRepo } from "@db/post/__mocks__/postRepository.mock.js"
import { makeReadPostsService } from "@business/post/read-posts/readPostsService.js"

jest.mock("@src/db.js")

describe("makeReadPostsService", () => {
  describe("readPosts", () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it("Success; single result", async () => {
      // Arrange
      mockPostRepo.getPosts.mockResolvedValue([
        { id: 1, mPost: "haha", userId: 3, userName: "boman" }
      ])

      // Act
      const result = await makeReadPostsService(mockPostRepo).readPosts()

      // Assert
      expect(result).toMatchObject([
        { id: 1, mPost: "haha", userId: 3, userName: "boman" }
      ])

    })

    it("Success; multiple results", async () => {
      // Arrange
      mockPostRepo.getPosts.mockResolvedValue([
        { id: 1, mPost: "haha", userId: 3, userName: "boman" },
        { id: 2, mPost: "taha", userId: 3, userName: "soman" }
      ])

      // Act
      const result = await makeReadPostsService(mockPostRepo).readPosts()

      // Assert
      expect(result).toMatchObject([
        { id: 1, mPost: "haha", userId: 3, userName: "boman" },
        { id: 2, mPost: "taha", userId: 3, userName: "soman" }
      ])

    })

    it("posts.length === 0", async () => {
      // Arrange
      mockPostRepo.getPosts.mockResolvedValue([])

      // Act & Assert
      await expect(makeReadPostsService(mockPostRepo).readPosts()).rejects.toMatchObject({
        statusCode: 500,
        message: "Post doesnt exist"
      })
    })
  })
})
