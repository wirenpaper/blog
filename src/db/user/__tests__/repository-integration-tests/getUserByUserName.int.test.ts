import { userRepository } from "@db/user/userRepository.js"
import sqlClient, { createTables, dropTables } from "@db/dbTestSetup.js"

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
  describe("getUserByUserName", () => {
    it("Success; getting user", async () => {
      // Arrange
      const result = await userRepo.getUserByUsername({ userName: "jany" })

      // Assert
      expect(result).toEqual({
        id: 2,
        userName: "jany",
        hashedPassword: "somepassword333",
        firstName: "jane",
        lastName: "smith"
      })
    })

    it("Success; empty", async () => {
      // Arrange
      const result = await userRepo.getUserByUsername({ userName: "wot" })

      // Assert
      expect(result).toEqual(undefined)
    })

  })
})
