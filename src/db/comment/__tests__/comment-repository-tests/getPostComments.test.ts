import sqlClient from "@src/db.js"
import { commentRepository, GetPostCommentResult } from "@db/comment/commentRepository.js"

jest.mock("@src/db.js")

describe("commentRepository", () => {
  describe("getPostComments", () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it("Success; empty case", async () => {
      // Arrange
      (sqlClient as unknown as jest.Mock<Promise<GetPostCommentResult[]>, []>).mockResolvedValue([])

      // Act
      const result = await commentRepository(sqlClient).getPostComments({ postId: 3 })

      // Assert
      expect(result).toEqual([])
    })

    it("Success; one result", async () => {
      // Arrange
      (sqlClient as unknown as jest.Mock<Promise<GetPostCommentResult[]>, []>).mockResolvedValue([
        { commentId: 3, mComment: "oh jea", userId: 2, userName: "jany" }
      ])

      // Act
      const result = await commentRepository(sqlClient).getPostComments({ postId: 3 })

      // Assert
      expect(result).toEqual([
        { commentId: 3, mComment: "oh jea", userId: 2, userName: "jany" }
      ])
    })

    it("Success; multiple results (2)", async () => {
      // Arrange
      (sqlClient as unknown as jest.Mock<Promise<GetPostCommentResult[]>, []>).mockResolvedValue([
        { commentId: 3, mComment: "oh jea", userId: 2, userName: "jany" },
        { commentId: 4, mComment: "oh no", userId: 1, userName: "johnny" }
      ])

      // Act
      const result = await commentRepository(sqlClient).getPostComments({ postId: 3 })

      // Assert
      expect(result).toEqual([
        { commentId: 3, mComment: "oh jea", userId: 2, userName: "jany" },
        { commentId: 4, mComment: "oh no", userId: 1, userName: "johnny" }
      ])
    })

    it("!e.code case", async () => {
      const error = new Error("oops");
      (sqlClient as unknown as jest.Mock<Promise<GetPostCommentResult[]>, []>).mockRejectedValue(error)

      // Act & Assert
      await expect(commentRepository(sqlClient).getPostComments({ postId: 3 })).rejects.toMatchObject({
        statusCode: 500,
        message: "STATUSCODE NOT FOUND oops"
      })
    })

    it("Postgres error", async () => {
      (sqlClient as unknown as jest.Mock<Promise<GetPostCommentResult[]>, []>).mockRejectedValue({
        code: "23505",  // This is a Postgres error code, like unique_violation
        message: "duplicate key value violates unique constraint"
      })

      // Act & Assert
      await expect(commentRepository(sqlClient).getPostComments({ postId: 3 })).rejects.toMatchObject({
        statusCode: 400,
        message: "duplicate key value violates unique constraint"
      })
    })

  })
})
