import sqlClient from "@src/db.js"
import { CheckCommentOwnershipResult, commentRepository } from "@db/comment/comment_repository.js"
import { createExpressError } from "@src/errors.js"

jest.mock("@src/db.js")

describe("commentRepository", () => {
  describe("checkCommentOwnership", () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it("Success; single value", async () => {
      // Arrange
      const mockResponse: CheckCommentOwnershipResult[] = [{ userId: 123, userName: "mao" }];
      (sqlClient as unknown as jest.Mock<Promise<CheckCommentOwnershipResult[]>, []>).mockResolvedValue(mockResponse)

      // Act
      const result = await commentRepository(sqlClient).checkCommentOwnership({
        id: 12
      })

      // Assert
      expect(result).toEqual({ userId: 123, userName: "mao" })
    })

    it("fail; no rows", async () => {
      // Arrange
      (sqlClient as unknown as jest.Mock<Promise<{ id: number }[]>, []>).mockResolvedValue([])

      // Act & Assert
      await expect(commentRepository(sqlClient).checkCommentOwnership({
        id: 123, // MOCKED
      })).rejects.toMatchObject({
        statusCode: 500,
        message: "should be 1 row exactly"
      })
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
      })).rejects.toMatchObject({
        statusCode: 500,
        message: "should be 1 row exactly"
      })
    })

    it("Simple case rejection", async () => {
      // Arrange
      const expressError = createExpressError(403, "forbidden");
      (sqlClient as unknown as jest.Mock<Promise<{ id: number }[]>, []>).mockRejectedValue(expressError)

      // Act & Assert
      await expect(commentRepository(sqlClient).checkCommentOwnership({
        id: 333,
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
      })).rejects.toMatchObject({
        statusCode: 400,
        message: "duplicate key value violates unique constraint"
      })
    })

  })
})
