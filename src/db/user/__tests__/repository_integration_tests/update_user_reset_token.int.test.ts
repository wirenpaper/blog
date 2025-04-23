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
    it("Success; getting user", async () => {
      // Arrange
      const userRepo = userRepository(sqlClient)

      // Assert
      await userRepo.updateUserResetToken({
        resetTokenHash: "somehash",
        expiryTime: new Date("2024-12-31T23:59:59"),
        userId: 1
      })

      // get
      const check = await sqlClient.unsafe(`
        select reset_token, reset_token_expires from users where id=1
      `)

      // Assert
      expect(check).toEqual([{
        reset_token: "somehash",
        reset_token_expires: new Date("2024-12-31T23:59:59")
      }])

    })

    it("Success; empty", async () => {
      // Arrange
      const userRepo = userRepository(sqlClient)

      // Assert
      await userRepo.updateUserResetToken({
        resetTokenHash: "somehash",
        expiryTime: new Date("2024-12-31T23:59:59"),
        userId: 3
      })

      // get
      const check = await sqlClient.unsafe(`
        select reset_token, reset_token_expires from users where id=1
      `)

      // Assert
      expect(check).toEqual([])
    })

  })
})
