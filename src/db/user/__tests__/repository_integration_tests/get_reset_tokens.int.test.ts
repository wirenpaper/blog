import { userRepository } from "@db/user/user_repository.js"
import sql, { PostgresClient, createTables, dropTables, truncateTables } from "@db/db_test_setup.js"

describe("userRepository", () => {
  let sqlClient: PostgresClient

  // Setup before all tests
  beforeAll(async () => {
    // Create test database connection using postgres.js
    sqlClient = sql

    // Create tables using postgres.js's unsafe method for multi-statement SQL
    await sqlClient.unsafe(createTables)
  })

  // Clean up before each test
  beforeEach(async () => {
    // Clear data but keep tables - using postgres.js tagged template syntax
    await sqlClient.unsafe(truncateTables)
    const userRepo = userRepository(sqlClient)
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
  describe("updateUserResetToken", () => {
    it("Success; no results", async () => {
      // Arrange
      const userRepo = userRepository(sqlClient)

      // Assert
      const result = await userRepo.getResetTokens()
      expect(result).toEqual([])

    })

    it("Success; no valid results", async () => {
      // Arrange
      const userRepo = userRepository(sqlClient)

      // Assert
      await userRepo.updateUserResetToken({
        resetTokenHash: "somehash",
        expiryTime: new Date("2024-12-31T23:59:59"),
        userId: 7
      })
      const result = await userRepo.getResetTokens()
      expect(result).toEqual([])
    })

    it("Success; no valid results", async () => {
      // Arrange
      const userRepo = userRepository(sqlClient)

      // Assert
      await userRepo.updateUserResetToken({
        resetTokenHash: "somehash",
        expiryTime: new Date("2024-12-31T23:59:59"),
        userId: 7
      })

      await userRepo.updateUserResetToken({
        resetTokenHash: "blabla",
        expiryTime: new Date("2026-12-31T23:59:59"),
        userId: 8
      })

      await userRepo.updateUserResetToken({
        resetTokenHash: "joomooom",
        expiryTime: new Date("2026-12-31T23:59:59"),
        userId: 9
      })
      const result = await userRepo.getResetTokens()
      expect(result).toEqual([
        { id: 8, resetToken: "blabla" },
        { id: 9, resetToken: "joomooom" }
      ])
    })

  })
})
