import sqlClient from "@src/db.js"
import { createExpressError } from "@src/errors.js"
import { commentRepository } from "@db/comment/comment_repository.js"

jest.mock("@src/db.js")

describe("commentRepository", () => {
  describe("checkCommentOwnership", () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it("Success; single value", async () => {
      // Arrange
      const mockResponse = [{ id: 123 }];
      (sqlClient as unknown as jest.Mock<Promise<{ id: number }[]>, []>).mockResolvedValue(mockResponse)

      // Act
      const result = await commentRepository(sqlClient).checkCommentOwnership({
        id: 123,
        userId: 321
      })

      // Assert
      expect(result).toMatchObject({
        id: 123,
      })
    })

    it("Success; 0 values", async () => {
      // Arrange
      (sqlClient as unknown as jest.Mock<Promise<{ id: number }[]>, []>).mockResolvedValue([])

      // Act
      const result = await commentRepository(sqlClient).checkCommentOwnership({
        id: 123,
        userId: 321
      })

      // Assert
      expect(result).toEqual(undefined)
    })

    it("Multiple post response failure", async () => {
      // Arrange
      const mockResponse = [
        { id: 123 },
        { id: 234 }
      ];
      (sqlClient as unknown as jest.Mock<Promise<{ id: number }[]>, []>).mockResolvedValue(mockResponse)

      // Act & Assert
      await expect(commentRepository(sqlClient).checkCommentOwnership({
        id: 123, // MOCKED
        userId: 321
      })).rejects.toMatchObject({
        statusCode: 500,
        message: "should be 0 or 1 rows"
      })
    })

    it("Simple case rejection", async () => {
      // Arrange
      const expressError = createExpressError(403, "forbidden");
      (sqlClient as unknown as jest.Mock<Promise<{ id: number }[]>, []>).mockRejectedValue(expressError)

      // Act & Assert
      await expect(commentRepository(sqlClient).checkCommentOwnership({
        id: 333,
        userId: 321
      })).rejects.toMatchObject({
        statusCode: 403,
        message: "forbidden"
      })
    })

    it("!e.code case", async () => {
      const error = new Error("oops");
      (sqlClient as unknown as jest.Mock<Promise<{ id: number }[]>, []>).mockRejectedValue(error)

      // Act & Assert
      await expect(commentRepository(sqlClient).checkCommentOwnership({
        id: 333,
        userId: 334
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
      await expect(commentRepository(sqlClient).checkCommentOwnership({
        id: 333,
        userId: 350
      })).rejects.toMatchObject({
        statusCode: 400,
        message: "duplicate key value violates unique constraint"
      })
    })

  })
})
