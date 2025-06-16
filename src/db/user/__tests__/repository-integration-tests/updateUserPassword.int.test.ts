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
  describe("updateUserPassword", () => {
    it("Success", async () => {
      // Assert
      const hashedPassword = await sqlClient.unsafe("select hashed_password from users where id=1")
      await userRepo.updateUserPassword({
        hashedPassword: "jumbodumbo",
        userId: 1
      })
      const hashedPasswordUpdated = await sqlClient.unsafe("select hashed_password from users where id=1")

      expect(hashedPassword).toEqual([{ hashed_password: "hashedpassword123" }])
      expect(hashedPasswordUpdated).toEqual([{ hashed_password: "jumbodumbo" }])

    })

    /*
     * it("failure; password not reset", async () => {
     *   await expect(userRepo.updateUserPassword({
     *     hashedPassword: "jumbodumbo",
     *     userId: 1
     *   })).rejects.toMatchObject({
     *     statusCode: 500,
     *     message: "password not reset"
     *   })
     * })
     */

  })
})
