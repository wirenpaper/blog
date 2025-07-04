import sqlClient from "@src/db.js"
import { userRepository } from "@db/user/userRepository.js"
import { UserModel } from "@db/user/userModel.js"
import { createExpressError } from "@src/errors.js"

jest.mock("@src/db.js")

describe("userRepository", () => {
  describe("deleteUserById", () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it("Success", async () => {
      // Arrange
      const mockResponse: UserModel[] = [
        { id: 1, userName: "user1", hashedPassword: "hash1", firstName: "John", lastName: "Doe" }
      ];
      (sqlClient as unknown as jest.Mock<Promise<UserModel[]>, []>).mockResolvedValue(mockResponse)

      // Act
      const result = await userRepository(sqlClient).createUser({
        userName: "testUser",
        hashedPassword: "hashedPass123",
        firstName: "John",
        lastName: "Doe"
      })

      // Assert
      expect(result).toMatchObject({
        id: 1,
        userName: "user1",
        hashedPassword: "hash1",
        firstName: "John",
        lastName: "Doe",
        resetToken: undefined,
        resetTokenExpires: undefined,
      })

    })

    it("Success", async () => {
      (sqlClient as unknown as jest.Mock<Promise<{ id: number }[]>, []>).mockResolvedValue([{ id: 2 }])

      // Act && Assert
      const res = await userRepository(sqlClient).deleteUserById({
        userId: 3
      })

      expect(res).toEqual(undefined)
    })

    it("failure, no results", async () => {
      (sqlClient as unknown as jest.Mock<Promise<{ id: number }[]>, []>).mockResolvedValue([])

      // Act && Assert
      await expect(userRepository(sqlClient).deleteUserById({
        userId: 3
      })).rejects.toMatchObject({
        statusCode: 500,
        message: "no rows deleted"
      })
    })

    it("failure, multiple results", async () => {
      (sqlClient as unknown as jest.Mock<Promise<{ id: number }[]>, []>).mockResolvedValue([{ id: 3 }, { id: 2 }])

      // Act && Assert
      await expect(userRepository(sqlClient).deleteUserById({
        userId: 3
      })).rejects.toMatchObject({
        statusCode: 500,
        message: "fatal error; multiple results"
      })
    })

    it("Simple case rejection", async () => {
      // Arrange
      const expressError = createExpressError(403, "forbidden");
      (sqlClient as unknown as jest.Mock<Promise<{ id: number }>, []>).mockRejectedValue(expressError)

      // Act & Assert
      await expect(userRepository(sqlClient).deleteUserById({
        userId: 3
      })).rejects.toMatchObject({
        statusCode: 403,
        message: "forbidden"
      })
    })

    it("!e.code case", async () => {
      const error = new Error("oops");
      (sqlClient as unknown as jest.Mock<Promise<{ id: number }[]>, []>).mockRejectedValue(error)
      // console.log(error.message)

      // Act & Assert
      await expect(userRepository(sqlClient).deleteUserById({
        userId: 3
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
      await expect(userRepository(sqlClient).deleteUserById({
        userId: 3
      })).rejects.toMatchObject({
        statusCode: 400,
        message: "duplicate key value violates unique constraint"
      })
    })

  })
})
