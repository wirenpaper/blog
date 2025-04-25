import { userRepository } from "@db/user/user_repository.js"
import sqlClient, { createTables, dropTables } from "@db/db_test_setup.js"

describe("userRepository", () => {
  const userRepo = userRepository(sqlClient)

  // Setup before all tests
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
      const result = await userRepo.getUserById({ userId: 1 })

      // Assert
      expect(result).toEqual({
        id: 1,
        hashedPassword: "hashedpassword123",
      })
    })

    it("Success; empty", async () => {
      // Arrange

      // Act & Assert
      await expect(userRepo.getUserById({ userId: 5 })).rejects.toMatchObject({
        statusCode: 500,
        message: "should be *exactly* 1 row"
      })
    })

  })
})
