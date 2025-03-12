import sqlClient from "@src/db.js"
import { userRepository } from "@db/user/user_repository.js"
import { createExpressError } from "@src/errors.js"

jest.mock("@src/db.js")

describe("userRepository", () => {
  describe("getUserById", () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it("Success", async () => {
      // Arrange
      const mockResponse = [{ id: 123, hashedPassword: "hashed_32@2mM" }];
      (sqlClient as unknown as jest.Mock).mockResolvedValue(mockResponse)

      // Act
      const result = await userRepository(sqlClient).getUserById({
        userId: 333 // MOCKED
      })

      // Assert
      expect(result).toMatchObject({ id: 123, hashedPassword: "hashed_32@2mM" })
    })


    it("Multiple user response failure", async () => {
      // Arrange
      const mockResponse = [
        { id: 123, hashedPassword: "hashed_32@2mM" },
        { id: 124, hashedPassword: "hashed_12@2nQ" }
      ];
      (sqlClient as unknown as jest.Mock).mockResolvedValue(mockResponse)

      // Act & Assert
      await expect(userRepository(sqlClient).getUserById({
        userId: 333, // MOCKED
      })).rejects.toMatchObject({
        statusCode: 500,
        message: "should be only 1 row"
      })
    })


    it("Simple case rejection", async () => {
      // Arrange
      const expressError = createExpressError(403, "forbidden");
      (sqlClient as unknown as jest.Mock).mockRejectedValue(expressError)

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
      (sqlClient as unknown as jest.Mock).mockRejectedValue(error)

      // Act & Assert
      await expect(userRepository(sqlClient).getUserById({
        userId: 333
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
      await expect(userRepository(sqlClient).getUserById({
        userId: 333
      })).rejects.toMatchObject({
        statusCode: 400,
        message: "duplicate key value violates unique constraint"
      })
    })

  })
})
