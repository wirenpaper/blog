import sqlClient from "@src/db.js"
import { GetUserByVerifiedTokenResult, userRepository } from "@db/user/user_repository.js"

jest.mock("@src/db.js")

describe("userRepository", () => {
  describe("getUserByVerifiedToken", () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it("Success; empty result", async () => {
      // Arrange
      (sqlClient as unknown as jest.Mock<Promise<GetUserByVerifiedTokenResult[]>, []>).mockResolvedValue([])

      // Act
      const result = await userRepository(sqlClient).getUserByVerifiedToken({ userName: "bob" })

      // Assert
      expect(result).toEqual(undefined)
    })

    it("Success; one result", async () => {
      // Arrange
      (sqlClient as unknown as jest.Mock<Promise<GetUserByVerifiedTokenResult[]>, []>)
        .mockResolvedValue([{ id: 123, resetToken: "abc123#*!" }])

      // Act
      const result = await userRepository(sqlClient).getUserByVerifiedToken({ userName: "bob" })

      // Assert
      expect(result).toMatchObject({ id: 123, resetToken: "abc123#*!" })
    })

    it("Failure; multiple results", async () => {
      // Arrange
      (sqlClient as unknown as jest.Mock<Promise<GetUserByVerifiedTokenResult[]>, []>).mockResolvedValue([
        { id: 123, resetToken: "abc123#*!" },
        { id: 124, resetToken: "abc323#*!" }
      ])

      // Act
      await expect(userRepository(sqlClient).getUserByVerifiedToken({
        userName: "bob"
      })).rejects.toMatchObject({
        statusCode: 500,
        message: "should be 0 or 1 rows"
      })

    })


    it("!e.code case", async () => {
      const error = new Error("oops");
      (sqlClient as unknown as jest.Mock<Promise<GetUserByVerifiedTokenResult[]>, []>).mockRejectedValue(error)

      // Act & Assert
      await expect(userRepository(sqlClient).getUserByVerifiedToken({
        userName: "bob"
      })).rejects.toMatchObject({
        statusCode: 500,
        message: "STATUSCODE NOT FOUND oops"
      })
    })

    it("Postgres error", async () => {
      (sqlClient as unknown as jest.Mock<Promise<GetUserByVerifiedTokenResult[]>, []>).mockRejectedValue({
        code: "23505",  // This is a Postgres error code, like unique_violation
        message: "duplicate key value violates unique constraint"
      })

      // Act & Assert
      await expect(userRepository(sqlClient).getUserByVerifiedToken({
        userName: "bob"
      })).rejects.toMatchObject({
        statusCode: 400,
        message: "duplicate key value violates unique constraint"
      })
    })

  })
})
