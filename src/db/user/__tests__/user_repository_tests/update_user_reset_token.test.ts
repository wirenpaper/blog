import sqlClient from "@src/db.js"
import { userRepository } from "@db/user/user_repository.js"

jest.mock("@src/db.js")

describe("userRepository", () => {
  describe("updateUserResetToken", () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it("Success", async () => {
      (sqlClient as unknown as jest.Mock).mockResolvedValue(undefined)

      // Act
      const result = await userRepository(sqlClient).updateUserResetToken({
        resetTokenHash: "resetTokenHashed##230Nv__fio",
        expiryTime: new Date("2025-12-31"),
        userId: 32
      })

      // Assert
      expect(result).toBe(undefined)
    })

    it("!e.code case", async () => {
      const error = new Error("oops");
      (sqlClient as unknown as jest.Mock).mockRejectedValue(error)

      // Act & Assert
      await expect(userRepository(sqlClient).updateUserResetToken({
        resetTokenHash: "resetTokenHashed##230Nv__fio",
        expiryTime: new Date("2025-12-31"),
        userId: 32
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
      await expect(userRepository(sqlClient).updateUserResetToken({
        resetTokenHash: "resetTokenHashed##230Nv__fio",
        expiryTime: new Date("2025-12-31"),
        userId: 32
      })).rejects.toMatchObject({
        statusCode: 400,
        message: "duplicate key value violates unique constraint"
      })
    })

  })
})
