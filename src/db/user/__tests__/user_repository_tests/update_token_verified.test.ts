import sqlClient from "@src/db.js"
import { userRepository } from "@db/user/user_repository.js"
import { createExpressError } from "@src/errors.js"

jest.mock("@src/db.js")

describe("userRepository", () => {
  describe("updateTokenVerified", () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it("success", async () => {
      // Arrange
      (sqlClient as unknown as jest.Mock<Promise<{ id: number }[]>, []>).mockResolvedValue([{ id: 1 }])

      // Act
      const res = await userRepository(sqlClient).updateTokenVerified({
        userId: 32
      })

      // Assert
      expect(res).toEqual(undefined)
    })

    it("res.length !== 1; no query result", async () => {
      // Arrange
      (sqlClient as unknown as jest.Mock<Promise<{ id: number }[]>, []>).mockResolvedValue([])

      // Act & Assert
      await expect(userRepository(sqlClient).updateTokenVerified({
        userId: 32
      })).rejects.toMatchObject({
        statusCode: 500,
        message: "should be *exactly* 1 row"
      })
    })

    it("res.length !== 1; multiple query results", async () => {
      // Arrange
      (sqlClient as unknown as jest.Mock<Promise<{ id: number }[]>, []>).mockResolvedValue([{ id: 1 }, { id: 2 }])

      // Act & Assert
      await expect(userRepository(sqlClient).updateTokenVerified({
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
      await expect(userRepository(sqlClient).updateTokenVerified({
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
      await expect(userRepository(sqlClient).updateTokenVerified({
        userId: 123
      })).rejects.toMatchObject({
        statusCode: 400,
        message: "duplicate key value violates unique constraint"
      })
    })

  })
})
