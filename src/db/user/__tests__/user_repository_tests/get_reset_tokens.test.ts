import sqlClient from "@src/db.js"
import { GetResetTokensResult, userRepository } from "@db/user/user_repository.js"

jest.mock("@src/db.js")

describe("userRepository", () => {
  describe("getResetTokens", () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it("Success; empty case", async () => {
      // Arrange
      (sqlClient as unknown as jest.Mock<Promise<GetResetTokensResult[]>, []>).mockResolvedValue([])

      // Act
      const result = await userRepository(sqlClient).getResetTokens()

      // Assert
      expect(result).toEqual([])
    })

    it("Success; one result", async () => {
      // Arrange
      (sqlClient as unknown as jest.Mock<Promise<GetResetTokensResult[]>, []>).mockResolvedValue([{ id: 123, resetToken: "sldfj@l132" }])

      // Act
      const result = await userRepository(sqlClient).getResetTokens()

      // Assert
      expect(result).toMatchObject([{ id: 123, resetToken: "sldfj@l132" }])
    })

    it("Success; multiple results (2)", async () => {
      // Arrange
      (sqlClient as unknown as jest.Mock<Promise<GetResetTokensResult[]>, []>).mockResolvedValue([
        { id: 123, resetToken: "sldfj@l132" },
        { id: 234, resetToken: "blablabla" }
      ])

      // Act
      const result = await userRepository(sqlClient).getResetTokens()

      // Assert
      expect(result).toMatchObject([
        { id: 123, resetToken: "sldfj@l132" },
        { id: 234, resetToken: "blablabla" }
      ])
    })

    it("!e.code case", async () => {
      const error = new Error("oops");
      (sqlClient as unknown as jest.Mock<Promise<GetResetTokensResult[]>, []>).mockRejectedValue(error)

      // Act & Assert
      await expect(userRepository(sqlClient).getResetTokens()).rejects.toMatchObject({
        statusCode: 500,
        message: "STATUSCODE NOT FOUND oops"
      })
    })

    it("Postgres error", async () => {
      (sqlClient as unknown as jest.Mock<Promise<GetResetTokensResult[]>, []>).mockRejectedValue({
        code: "23505",  // This is a Postgres error code, like unique_violation
        message: "duplicate key value violates unique constraint"
      })

      // Act & Assert
      await expect(userRepository(sqlClient).getResetTokens()).rejects.toMatchObject({
        statusCode: 400,
        message: "duplicate key value violates unique constraint"
      })
    })

  })
})
