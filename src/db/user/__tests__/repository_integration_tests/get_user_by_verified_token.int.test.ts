import { userRepository } from "@db/user/user_repository.js"
import sqlClient, { createTables, dropTables } from "@db/db_test_setup.js"

describe("userRepository", () => {
  const userRepo = userRepository(sqlClient)

  beforeAll(async () => {
    await sqlClient.unsafe(createTables)
  })

  // Clean up before each test
  beforeEach(async () => {
    // Clear data but keep tables - using postgres.js tagged template syntax
    await sqlClient.unsafe(dropTables)
    await sqlClient.unsafe(createTables)

    await userRepo.createUser({
      userName: "johnny",
      hashedPassword: "hashedpassword123",
      firstName: "john",
      lastName: "doe"
    })
    await userRepo.createUser({
      userName: "jany",
      hashedPassword: "somepassword333",
      firstName: "jane",
      lastName: "smith"
    })
    await userRepo.createUser({
      userName: "jam",
      hashedPassword: "somethingelse",
      firstName: "jalabibo",
      lastName: "jolololo"
    })
  })

  // Final cleanup
  afterAll(async () => {
    // Drop all tables
    await sqlClient.unsafe(dropTables)
    // Close connection - postgres.js specific method
    await sqlClient.end()
  })

  // Tests
  describe("getUserByVerifiedToken", () => {
    it("Success; no results", async () => {
      // Arrange
      // const userRepo = userRepository(sqlClient)

      // Assert
      const result = await userRepo.getUserByVerifiedToken({ userName: "bunga" })
      expect(result).toEqual(undefined)

    })

    it("Success; multiple results", async () => {
      // Arrange
      const userRepo = userRepository(sqlClient)

      // Assert
      await userRepo.updateUserResetToken({
        resetTokenHash: "somehash",
        expiryTime: new Date("2024-12-31T23:59:59"),
        userId: 1
      })

      await userRepo.updateUserResetToken({
        resetTokenHash: "blabla",
        expiryTime: new Date("2026-12-31T23:59:59"),
        userId: 2
      })

      await userRepo.updateUserResetToken({
        resetTokenHash: "joomooom",
        expiryTime: new Date("2026-12-31T23:59:59"),
        userId: 3
      })
      const result = await userRepo.getResetTokens()
      expect(result).toEqual([
        { id: 2, resetToken: "blabla" },
        { id: 3, resetToken: "joomooom" }
      ])
    })

  })
})
