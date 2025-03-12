import sqlClient from "@src/db.js"
import { userRepository } from "@db/user/user_repository.js"

jest.mock("@src/db.js")

describe("userRepository", () => {
  describe("updateUserPassword", () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it("Success; empty result", async () => {
      // Arrange
      (sqlClient as unknown as jest.Mock).mockResolvedValue(undefined)

      // Act
      const result = await userRepository(sqlClient).updateUserPassword({
        hashedPassword: "sdklj",
        userId: 123
      })

      // Assert
      expect(result).toEqual(undefined)
    })

    it("!e.code case", async () => {
      const error = new Error("oops");
      (sqlClient as unknown as jest.Mock).mockRejectedValue(error)

      // Act & Assert
      await expect(userRepository(sqlClient).updateUserPassword({
        hashedPassword: "sdlfkj3#*717!",
        userId: 123
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
      await expect(userRepository(sqlClient).updateUserPassword({
        hashedPassword: "sdlfkj3#*717!",
        userId: 123
      })).rejects.toMatchObject({
        statusCode: 400,
        message: "duplicate key value violates unique constraint"
      })
    })

  })
})
