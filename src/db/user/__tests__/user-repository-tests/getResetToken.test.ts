import sqlClient from "@src/db.js"
import { GetResetTokenResult, userRepository } from "@db/user/userRepository.js"
import { createExpressError } from "@src/errors.js"

jest.mock("@src/db.js")

describe("userRepository", () => {
  describe("getResetToken", () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it("Success", async () => {
      // Arrange
      const mockResponse: GetResetTokenResult[] = [{ id: 123, resetToken: "maresettokenbraa" }];
      (sqlClient as unknown as jest.Mock<Promise<GetResetTokenResult[]>, []>).mockResolvedValue(mockResponse)

      // Act
      const result = await userRepository(sqlClient).getResetToken({
        userName: "lol@gmail.com"
      })

      // Assert
      expect(result).toMatchObject({ id: 123, resetToken: "maresettokenbraa" })
    })


    it("Multiple user response failure", async () => {
      // Arrange
      const mockResponse: GetResetTokenResult[] = [
        { id: 123, resetToken: "hashed_32@2mM" },
        { id: 124, resetToken: "hashed_12@2nQ" }
      ];
      (sqlClient as unknown as jest.Mock<Promise<GetResetTokenResult[]>, []>).mockResolvedValue(mockResponse)

      // Act & Assert
      await expect(userRepository(sqlClient).getResetToken({
        userName: "lol@gmail.com", // MOCKED
      })).rejects.toMatchObject({
        statusCode: 500,
        message: "should be 0 or 1 rows"
      })
    })

    it("Simple case rejection", async () => {
      // Arrange
      const expressError = createExpressError(403, "forbidden");
      (sqlClient as unknown as jest.Mock<Promise<GetResetTokenResult[]>, []>).mockRejectedValue(expressError)

      // Act & Assert
      await expect(userRepository(sqlClient).getResetToken({
        userName: "lol@gmail.com"
      })).rejects.toMatchObject({
        statusCode: 403,
        message: "forbidden"
      })
    })

    it("!e.code case", async () => {
      const error = new Error("oops");
      (sqlClient as unknown as jest.Mock<Promise<GetResetTokenResult[]>, []>).mockRejectedValue(error)

      // Act & Assert
      await expect(userRepository(sqlClient).getResetToken({
        userName: "lol@gmail.com"
      })).rejects.toMatchObject({
        statusCode: 500,
        message: "STATUSCODE NOT FOUND oops"
      })
    })

    it("Postgres error", async () => {
      (sqlClient as unknown as jest.Mock<Promise<GetResetTokenResult[]>, []>).mockRejectedValue({
        code: "23505",  // This is a Postgres error code, like unique_violation
        message: "duplicate key value violates unique constraint"
      })

      // Act & Assert
      await expect(userRepository(sqlClient).getResetToken({
        userName: "lol@gmail.com"
      })).rejects.toMatchObject({
        statusCode: 400,
        message: "duplicate key value violates unique constraint"
      })
    })

  })
})
