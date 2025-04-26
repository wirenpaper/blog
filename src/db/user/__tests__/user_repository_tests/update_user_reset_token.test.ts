import sqlClient from "@src/db.js"
import { userRepository } from "@db/user/user_repository.js"
import { createExpressError } from "@src/errors.js"

jest.mock("@src/db.js")

describe("userRepository", () => {
  describe("updateUserResetToken", () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it("Success", async () => {
      (sqlClient as unknown as jest.Mock<Promise<{ id: number }[]>, []>).mockResolvedValue([{ id: 3 }])

      // Act
      const res = await userRepository(sqlClient).updateUserResetToken({
        resetTokenHash: "resetTokenHashed##230Nv__fio",
        expiryTime: new Date("2025-12-31"),
        userId: 32
      })

      expect(res).toEqual(undefined)
    })

    it("res.length !== 0; sqlClient returns nothing", async () => {
      (sqlClient as unknown as jest.Mock<Promise<{ id: number }[]>, []>).mockResolvedValue([])

      // Act
      await expect(userRepository(sqlClient).updateUserResetToken({
        resetTokenHash: "resetTokenHashed##230Nv__fio",
        expiryTime: new Date("2025-12-31"),
        userId: 32
      })).rejects.toMatchObject({
        statusCode: 500,
        message: "should be *exactly* 1 row"
      })
    })

    it("res.length !== 0; returns multiple ids", async () => {
      (sqlClient as unknown as jest.Mock<Promise<{ id: number }[]>, []>).mockResolvedValue([{ id: 3 }, { id: 4 }])

      // Act
      await expect(userRepository(sqlClient).updateUserResetToken({
        resetTokenHash: "resetTokenHashed##230Nv__fio",
        expiryTime: new Date("2025-12-31"),
        userId: 32
      })).rejects.toMatchObject({
        statusCode: 500,
        message: "should be *exactly* 1 row"
      })
    })

    it("Simple case rejection", async () => {
      // Arrange
      const expressError = createExpressError(403, "forbidden");
      (sqlClient as unknown as jest.Mock<Promise<{ id: number }[]>, []>).mockRejectedValue(expressError)

      // Act & Assert
      await expect(userRepository(sqlClient).getUserById({
        userId: 333
      })).rejects.toMatchObject({
        statusCode: 403,
        message: "forbidden"
      })
    })

    it("!e.code case", async () => {
      const error = new Error("oops");
      (sqlClient as unknown as jest.Mock<Promise<{ id: number }[]>, []>).mockRejectedValue(error)

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
      (sqlClient as unknown as jest.Mock<Promise<{ id: number }[]>, []>).mockRejectedValue({
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
