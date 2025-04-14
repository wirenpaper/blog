import { mockCommentRepo } from "@db/comment/__mocks__/comment_repository.mock.js"
// import { makeEditCommentService } from "@business/comment/edit_comment/edit_comment_service.js"
import { makeGetPostCommentsService } from "@business/comment/get_post_comments/get_post_comments_service.js"

jest.mock("@src/db.js")

describe("makeEditCommentService", () => {
  describe("editComment", () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it("Success; single result", async () => {
      // Arrange
      mockCommentRepo.getPostComments.mockResolvedValue([{ id: 3, mComment: "haha" }])

      const result = await makeGetPostCommentsService(mockCommentRepo).getPostComments({
        postId: 32
      })

      // Assert
      expect(result).toEqual([{ id: 3, mComment: "haha" }])
    })

    it("Success; multiple result", async () => {
      // Arrange
      mockCommentRepo.getPostComments.mockResolvedValue([
        { id: 3, mComment: "haha" },
        { id: 4, mComment: "some comment" }
      ])

      const result = await makeGetPostCommentsService(mockCommentRepo).getPostComments({
        postId: 32
      })

      // Assert
      expect(result).toEqual([
        { id: 3, mComment: "haha" },
        { id: 4, mComment: "some comment" }
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
