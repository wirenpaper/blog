import sqlClient from "@src/db.js"
import { commentRepository } from "@db/comment/comment_repository.js"

jest.mock("@src/db.js")

describe("commentRepository", () => {
  describe("deleteComment", () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it("Success", async () => {
      (sqlClient as unknown as jest.Mock<Promise<void>, []>).mockResolvedValue(undefined)

      // Act
      const result = await commentRepository(sqlClient).deleteComment({
        id: 3
      })

      // Assert
      expect(result).toEqual(undefined)
    })

    it("!e.code case", async () => {
      const error = new Error("oops");
      (sqlClient as unknown as jest.Mock<Promise<void>, []>).mockRejectedValue(error)

      // Act & Assert
      await expect(commentRepository(sqlClient).deleteComment({
        id: 3
      })).rejects.toMatchObject({
        statusCode: 500,
        message: "STATUSCODE NOT FOUND oops"
      })
    })

    it("Postgres error", async () => {
      (sqlClient as unknown as jest.Mock<Promise<void>, []>).mockRejectedValue({
        code: "23505",  // This is a Postgres error code, like unique_violation
        message: "duplicate key value violates unique constraint"
      })

      // Act & Assert
      await expect(commentRepository(sqlClient).deleteComment({
        id: 3
      })).rejects.toMatchObject({
        statusCode: 400,
        message: "duplicate key value violates unique constraint"
      })
    })

  })
})
