import sqlClient from "@src/db.js"
import { userRepository } from "@db/user/user_repository.js"
import { createExpressError } from "@src/errors.js"

jest.mock("@src/db.js")

describe("userRepository", () => {
  describe("updateUserPassword", () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it("Success; empty result", async () => {
      // Arrange
      (sqlClient as unknown as jest.Mock<Promise<{ id: number }[]>, []>).mockResolvedValue([{ id: 1 }])

      // Act
      const result = await userRepository(sqlClient).updateLoggedInUserPassword({
        hashedPassword: "sdklj",
        userId: 123
      })

      // Assert
      expect(result).toEqual(undefined)
    })

    it("Simple case rejection", async () => {
      // Arrange
      const expressError = createExpressError(403, "forbidden");
      (sqlClient as unknown as jest.Mock<Promise<{ id: number }[]>, []>).mockRejectedValue(expressError)

      // Act & Assert
      await expect(userRepository(sqlClient).updateLoggedInUserPassword({
        hashedPassword: "sdklj",
        userId: 123
      })).rejects.toMatchObject({
        statusCode: 403,
        message: "forbidden"
      })
    })

    it("!e.code case", async () => {
      const error = new Error("oops");
      (sqlClient as unknown as jest.Mock<Promise<{ id: number }[]>, []>).mockRejectedValue(error)

      // Act & Assert
      await expect(userRepository(sqlClient).updateLoggedInUserPassword({
        hashedPassword: "sdlfkj3#*717!",
        userId: 123
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
      await expect(userRepository(sqlClient).updateLoggedInUserPassword({
        hashedPassword: "sdlfkj3#*717!",
        userId: 123
      })).rejects.toMatchObject({
        statusCode: 400,
        message: "duplicate key value violates unique constraint"
      })
    })

  })
})
