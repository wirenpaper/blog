import { mockCommentRepo } from "@db/comment/__mocks__/comment_repository.mock.js"
import { makeGetPostCommentsService } from "@business/comment/get-post-comments/getPostCommentsService.js"

jest.mock("@src/db.js")

describe("makeEditCommentService", () => {
  describe("editComment", () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it("Success; single result", async () => {
      // Arrange
      mockCommentRepo.getPostComments.mockResolvedValue
        ([{ commentId: 3, mComment: "haha", userId: 1, userName: "Johnny" }])

      const result = await makeGetPostCommentsService(mockCommentRepo).getPostComments({
        postId: 32
      })

      // Assert
      expect(result).toEqual([{ commentId: 3, mComment: "haha", userId: 1, userName: "Johnny" }])
    })

    it("Success; multiple result", async () => {
      // Arrange
      mockCommentRepo.getPostComments.mockResolvedValue([
        { commentId: 3, mComment: "haha", userId: 1, userName: "Johnny" },
        { commentId: 4, mComment: "some comment", userId: 2, userName: "Jany" }
      ])

      const result = await makeGetPostCommentsService(mockCommentRepo).getPostComments({
        postId: 32
      })

      // Assert
      expect(result).toEqual([
        { commentId: 3, mComment: "haha", userId: 1, userName: "Johnny" },
        { commentId: 4, mComment: "some comment", userId: 2, userName: "Jany" }
      ])
    })

    it("Failure; !comments", async () => {
      // Arrange
      mockCommentRepo.getPostComments.mockResolvedValue([])

      await expect(makeGetPostCommentsService(mockCommentRepo).getPostComments({
        postId: 32
      })).rejects.toMatchObject({
        statusCode: 403,
        message: "no comments exist"
      })

    })
  })
})
