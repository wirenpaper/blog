import sqlClient from "@src/db.js"
import { GetPostResult, postRepository } from "@db/post/postRepository.js"

jest.mock("@src/db.js")

describe("postRepository", () => {
  describe("getPosts", () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it("Success; empty case", async () => {
      // Arrange
      (sqlClient as unknown as jest.Mock<Promise<GetPostResult[]>, []>).mockResolvedValue([])

      // Act
      const result = await postRepository(sqlClient).getPosts()

      // Assert
      expect(result).toEqual([])
    })

    it("Success; one result", async () => {
      // Arrange
      (sqlClient as unknown as jest.Mock<Promise<GetPostResult[]>, []>).mockResolvedValue([
        { id: 123, mPost: "haha", userId: 123, userName: "lolcop" }
      ])

      // Act
      const result = await postRepository(sqlClient).getPosts()

      // Assert
      expect(result).toMatchObject([
        { id: 123, mPost: "haha", userId: 123, userName: "lolcop" }
      ])
    })

    it("Success; multiple results (2)", async () => {
      // Arrange
      (sqlClient as unknown as jest.Mock<Promise<GetPostResult[]>, []>).mockResolvedValue([
        { id: 123, mPost: "haha", userId: 123, userName: "lolcop" },
        { id: 124, mPost: "jaja", userId: 123, userName: "bro" }
      ])

      // Act
      const result = await postRepository(sqlClient).getPosts()

      // Assert
      expect(result).toMatchObject([
        { id: 123, mPost: "haha", userId: 123, userName: "lolcop" },
        { id: 124, mPost: "jaja", userId: 123, userName: "bro" }
      ])
    })

    it("!e.code case", async () => {
      const error = new Error("oops");
      (sqlClient as unknown as jest.Mock<Promise<GetPostResult[]>, []>).mockRejectedValue(error)

      // Act & Assert
      await expect(postRepository(sqlClient).getPosts()).rejects.toMatchObject({
        statusCode: 500,
        message: "STATUSCODE NOT FOUND oops"
      })
    })

    it("Postgres error", async () => {
      (sqlClient as unknown as jest.Mock<Promise<GetPostResult[]>, []>).mockRejectedValue({
        code: "23505",  // This is a Postgres error code, like unique_violation
        message: "duplicate key value violates unique constraint"
      })

      // Act & Assert
      await expect(postRepository(sqlClient).getPosts()).rejects.toMatchObject({
        statusCode: 400,
        message: "duplicate key value violates unique constraint"
      })
    })

  })
})
