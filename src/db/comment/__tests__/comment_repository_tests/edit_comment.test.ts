import sqlClient from "@src/db.js"
import { commentRepository } from "@db/comment/comment_repository.js"

jest.mock("@src/db.js")

describe("commentRepository", () => {
  describe("editComment", () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it("Success", async () => {
      (sqlClient as unknown as jest.Mock<Promise<{ id: number }[]>, []>).mockResolvedValue([{ id: 2 }])

      // Act
      const result = await commentRepository(sqlClient).editComment({
        id: 3,
        mComment: "a comment"
      })

      // Assert
      expect(result).toEqual(undefined)
    })

    it("Failure; empty result", async () => {
      (sqlClient as unknown as jest.Mock<Promise<{ id: number }[]>, []>).mockResolvedValue([])

      // Act && Assert
      await expect(commentRepository(sqlClient).editComment({
        id: 3,
        mComment: "a comment"
      })).rejects.toMatchObject({
        statusCode: 500,
        message: "comment does not exist"
      })
    })

    it("!e.code case", async () => {
      const error = new Error("oops");
      (sqlClient as unknown as jest.Mock<Promise<{ id: number }[]>, []>).mockRejectedValue(error)

      // Act & Assert
      await expect(commentRepository(sqlClient).editComment({
        id: 3,
        mComment: "a comment"
      })).rejects.toMatchObject({
        statusCode: 500,
        message: "STATUSCODE NOT FOUND oops"
      })
    })

    it("Postgres error", async () => {
      (sqlClient as unknown as jest.Mock<Promise<{ id: number }[]>, []>).mockRejectedValue({
        code: "23505",  // This is a Postgres error code, like unique_violation
        message: "duplicate key value violates unique constraint"
      })

      // Act & Assert
      await expect(commentRepository(sqlClient).editComment({
        id: 3,
        mComment: "a comment"
      })).rejects.toMatchObject({
        statusCode: 400,
        message: "duplicate key value violates unique constraint"
      })
    })

  })
})
