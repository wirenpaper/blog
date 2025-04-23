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
  describe("getUserById", () => {
    it("Success; getting user", async () => {
      // Arrange
      const userRepo = userRepository(sqlClient)
      const result = await userRepo.getUserById({ userId: 1 })

      // Assert
      expect(result).toEqual({
        id: 1,
        hashedPassword: "hashedpassword123",
      })
    })

    it("Success; empty", async () => {
      // Arrange
      const userRepo = userRepository(sqlClient)

      // Act & Assert
      await expect(userRepo.getUserById({ userId: 5 })).rejects.toMatchObject({
        statusCode: 500,
        message: "should be *exactly* 1 row"
      })
    })

  })
})
