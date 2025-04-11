import sqlClient from "@src/db.js"
import { postRepository } from "@db/post/post_repository.js"

jest.mock("@src/db.js")

describe("postRepository", () => {
  describe("DeletePostById", () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it("Success", async () => {
      (sqlClient as unknown as jest.Mock<Promise<void>, []>).mockResolvedValue(undefined)

      // Act
      const result = await postRepository(sqlClient).deletePostById({
        id: 123,
      })

      // Assert
      expect(result).toBe(undefined)
    })

    it("!e.code case", async () => {
      const error = new Error("oops");
      (sqlClient as unknown as jest.Mock<Promise<void>, []>).mockRejectedValue(error)

      // Act & Assert
      await expect(postRepository(sqlClient).deletePostById({
        id: 123,
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
      await expect(postRepository(sqlClient).deletePostById({
        id: 123,
      })).rejects.toMatchObject({
        statusCode: 400,
        message: "duplicate key value violates unique constraint"
      })
    })

  })
})
