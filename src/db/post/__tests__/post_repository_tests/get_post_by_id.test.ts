import sqlClient from "@src/db.js"
import { postRepository } from "@db/post/post_repository.js"
import { createExpressError } from "@src/errors.js"

jest.mock("@src/db.js")

describe("postRepository", () => {
  describe("getPostById", () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it("Success", async () => {
      // Arrange
      const mockResponse = [
        { id: 123, mPost: "somethingsomething haha", userId: 321, userName: "jimpo" }
      ];

      (sqlClient as unknown as jest.Mock).mockResolvedValue(mockResponse)

      // Act
      const result = await postRepository(sqlClient).getPostById({ id: 123 })

      // Assert
      expect(result).toMatchObject({
        id: 123,
        mPost: "somethingsomething haha",
        userId: 321,
        userName: "jimpo"
      })
    })

    it("no posts failure", async () => {
      // Arrange
      (sqlClient as unknown as jest.Mock).mockResolvedValue([])

      // Act & Assert
      await expect(postRepository(sqlClient).getPostById({
        id: 123, // MOCKED
      })).rejects.toMatchObject({
        statusCode: 500,
        message: "should be *exactly* 1 row"
      })
    })

    it("Multiple post response failure", async () => {
      // Arrange
      const mockResponse = [
        { id: 123, mPost: "somethingsomething haha", userId: 321, userName: "jimpo" },
        { id: 124, mPost: "something else", userId: 321, userName: "jimpo" }
      ];
      (sqlClient as unknown as jest.Mock).mockResolvedValue(mockResponse)

      // Act & Assert
      await expect(postRepository(sqlClient).getPostById({
        id: 123, // MOCKED
      })).rejects.toMatchObject({
        statusCode: 500,
        message: "should be *exactly* 1 row"
      })
    })


    it("Simple case rejection", async () => {
      // Arrange
      const expressError = createExpressError(403, "forbidden");
      (sqlClient as unknown as jest.Mock).mockRejectedValue(expressError)

      // Act & Assert
      await expect(postRepository(sqlClient).getPostById({
        id: 333
      })).rejects.toMatchObject({
        statusCode: 403,
        message: "forbidden"
      })
    })

    it("!e.code case", async () => {
      const error = new Error("oops");
      (sqlClient as unknown as jest.Mock).mockRejectedValue(error)

      // Act & Assert
      await expect(postRepository(sqlClient).getPostById({
        id: 333
      })).rejects.toMatchObject({
        statusCode: 500,
        message: "STATUSCODE NOT FOUND oops"
      })
    })

    it("Postgres error", async () => {
      (sqlClient as unknown as jest.Mock).mockRejectedValue({
        code: "23505",  // This is a Postgres error code, like unique_violation
        message: "duplicate key value violates unique constraint"
      })

      // Act & Assert
      await expect(postRepository(sqlClient).getPostById({
        id: 333
      })).rejects.toMatchObject({
        statusCode: 400,
        message: "duplicate key value violates unique constraint"
      })
    })

  })
})
