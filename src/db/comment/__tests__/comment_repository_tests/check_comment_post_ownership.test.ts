import sqlClient from "@src/db.js"
import { commentRepository } from "@db/comment/comment_repository.js"
import { createExpressError } from "@src/errors.js"

jest.mock("@src/db.js")

describe("commentRepository", () => {
  describe("checkPostComment", () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it("Success; single value", async () => {
      // Arrange
      const mockResponse: { userId: number }[] = [{ userId: 123 }];
      (sqlClient as unknown as jest.Mock<Promise<{ userId: number }[]>, []>).mockResolvedValue(mockResponse)

      // Act
      const result = await commentRepository(sqlClient).checkCommentOwnership({
        id: 12
      })

      // Assert
      expect(result).toEqual({ userId: 123 })
    })

    it("fail; no rows", async () => {
      // Arrange
      (sqlClient as unknown as jest.Mock<Promise<{ userId: number }[]>, []>).mockResolvedValue([])

      // Act & Assert
      await expect(commentRepository(sqlClient).checkCommentPostOwnership({
        id: 12
      })).rejects.toMatchObject({
        statusCode: 500,
        message: "fatal error, post does not exist"
      })
    })

    it("fail; multiple rows", async () => {
      // Arrange
      const mockResponse: { userId: number }[] = [{ userId: 123 }, { userId: 321 }];
      (sqlClient as unknown as jest.Mock<Promise<{ userId: number }[]>, []>).mockResolvedValue(mockResponse)

      // Act & Assert
      await expect(commentRepository(sqlClient).checkCommentPostOwnership({
        id: 12
      })).rejects.toMatchObject({
        statusCode: 500,
        message: "fatal error, same comment (id) on multiple posts?!"
      })
    })

    it("Simple case rejection", async () => {
      // Arrange
      const expressError = createExpressError(403, "forbidden");
      (sqlClient as unknown as jest.Mock<Promise<{ userId: number }[]>, []>).mockRejectedValue(expressError)

      // Act & Assert
      await expect(commentRepository(sqlClient).checkCommentPostOwnership({
        id: 333,
      })).rejects.toMatchObject({
        statusCode: 403,
        message: "forbidden"
      })
    })

    it("!e.code case", async () => {
      const error = new Error("oops");
      (sqlClient as unknown as jest.Mock<Promise<{ userId: number }[]>, []>).mockRejectedValue(error)

      // Act & Assert
      await expect(commentRepository(sqlClient).checkCommentPostOwnership({
        id: 333,
      })).rejects.toMatchObject({
        statusCode: 500,
        message: "STATUSCODE NOT FOUND oops"
      })
    })

    it("Postgres error", async () => {
      (sqlClient as unknown as jest.Mock<Promise<{ userId: number }[]>, []>).mockRejectedValue({
        code: "23505",  // This is a Postgres error code, like unique_violation
        message: "duplicate key value violates unique constraint"
      })

      // Act & Assert
      await expect(commentRepository(sqlClient).checkCommentPostOwnership({
        id: 333,
      })).rejects.toMatchObject({
        statusCode: 400,
        message: "duplicate key value violates unique constraint"
      })
    })

  })
})
