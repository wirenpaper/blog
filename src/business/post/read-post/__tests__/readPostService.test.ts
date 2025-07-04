import { mockPostRepo } from "@db/post/__mocks__/postRepository.mock.js"
import { makeReadPostService } from "@business/post/read-post/readPostService.js"

jest.mock("@src/db.js")

describe("makeReadPostService", () => {
  describe("readPost", () => {
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
      const result = await makeReadPostService(mockPostRepo).readPost({
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

