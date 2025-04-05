import { mockPostRepo } from "@db/post/__mocks__/post_repository.mock.js"
import { makePostService } from "@business/post/create_post/create_post_service.js"

jest.mock("@src/db.js")

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
      })

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
  })
})

