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
  describe("updateTokenVerified", () => {
    it("Success; getting user", async () => {
      await userRepo.updateTokenVerified({ userId: 1 })
      const check = await sqlClient.unsafe("select token_verified from users where id=1")
      expect(check).toEqual([{ token_verified: true }])
    })

    it("Success; token verification", async () => {
      await expect(userRepo.updateTokenVerified({ userId: 3 })).rejects.toMatchObject({
        statusCode: 500,
        message: "need at least 1 row"
      })

    })

  })
})
