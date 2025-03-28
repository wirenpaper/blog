import sqlClient from "@src/db.js"
import { postRepository } from "@db/post/post_repository.js"
import { createExpressError } from "@src/errors.js"

jest.mock("@src/db.js")

describe("postRepository", () => {
  describe("createPost", () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it("Success", async () => {
      // Arrange
      const mockResponse = [
        { id: 1, mPost: "haha you lolol", userId: 123 }
      ];
      (sqlClient as unknown as jest.Mock).mockResolvedValue(mockResponse)

      // Act
      const result = await postRepository(sqlClient).createPost({
        userId: 123,
        mPost: "some post"
      })

      expect(result).toMatchObject({
        id: 1,
        mPost: "haha you lolol",
        userId: 123
      })
    })

    it("failure: no posts", async () => {
      // Arrange
      (sqlClient as unknown as jest.Mock).mockResolvedValue([])

      // Act && Assert
      await expect(postRepository(sqlClient).createPost({
        userId: 123,
        mPost: "some post"
      })).rejects.toMatchObject({
        statusCode: 500,
        message: "should be *exactly* 1 row"
      })
    })

    it("failure: multiple posts", async () => {
      // Arrange
      const mockResponse = [
        { id: 1, mPost: "haha you lolol", userId: 123 },
        { id: 2, mPost: "boomboom", userId: 123 }
      ];
      (sqlClient as unknown as jest.Mock).mockResolvedValue(mockResponse)

      // Act && Assert
      await expect(postRepository(sqlClient).createPost({
        userId: 123,
        mPost: "some post"
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
      await expect(postRepository(sqlClient).createPost({
        userId: 123,
        mPost: "some post"
      })).rejects.toMatchObject({
        statusCode: 403,
        message: "forbidden"
      })
    })

    it("!e.code case", async () => {
      const error = new Error("oops");
      (sqlClient as unknown as jest.Mock).mockRejectedValue(error)

      // Act & Assert
      await expect(postRepository(sqlClient).createPost({
        userId: 123,
        mPost: "some post"
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
      await expect(postRepository(sqlClient).createPost({
        userId: 123,
        mPost: "some post"
      })).rejects.toMatchObject({
        statusCode: 400,
        message: "duplicate key value violates unique constraint"
      })
    })

  })
})
