import sqlClient from "@src/db.js"
import { postRepository } from "@db/post/post_repository.js"
import { createExpressError } from "@src/errors.js"

jest.mock("@src/db.js")

describe("postRepository", () => {
  describe("checkPostOwnership", () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it("Success", async () => {
      // Arrange
      const mockResponse: { userId: number }[] = [{ userId: 123 }];

      (sqlClient as unknown as jest.Mock<Promise<{ userId: number }[]>, []>).mockResolvedValue(mockResponse)

      // Act
      const result = await postRepository(sqlClient).checkPostOwnership({
        id: 123
      })

      // Assert
      expect(result).toMatchObject({
        userId: 123
      })
    })

    it("failure; no results", async () => {
      (sqlClient as unknown as jest.Mock<Promise<{ userId: number }[]>, []>).mockResolvedValue([])

      await expect(postRepository(sqlClient).checkPostOwnership({
        id: 123, // MOCKED
      })).rejects.toMatchObject({
        statusCode: 500,
        message: "no results"
      })
    })

    it("failure; multiple post response", async () => {
      // Arrange
      const mockResponse: { userId: number }[] = [
        { userId: 123 },
        { userId: 234 }
      ];
      (sqlClient as unknown as jest.Mock<Promise<{ userId: number }[]>, []>).mockResolvedValue(mockResponse)

      // Act & Assert
      await expect(postRepository(sqlClient).checkPostOwnership({
        id: 123, // MOCKED
      })).rejects.toMatchObject({
        statusCode: 500,
        message: "fatal error; multiple results"
      })
    })

    it("Simple case rejection", async () => {
      // Arrange
      const expressError = createExpressError(403, "forbidden");
      (sqlClient as unknown as jest.Mock<Promise<{ userId: number }[]>, []>).mockRejectedValue(expressError)

      // Act & Assert
      await expect(postRepository(sqlClient).checkPostOwnership({
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
      await expect(postRepository(sqlClient).checkPostOwnership({
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
      await expect(postRepository(sqlClient).checkPostOwnership({
        id: 333,
      })).rejects.toMatchObject({
        statusCode: 400,
        message: "duplicate key value violates unique constraint"
      })
    })

  })
})
