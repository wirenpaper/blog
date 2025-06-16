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
  describe("updateUserResetToken", () => {
    it("Success; getting user", async () => {
      // Arrange

      // Assert
      await userRepo.updateUserResetToken({
        resetTokenHash: "somehash",
        expiryTime: new Date("2024-12-31T23:59:59"),
        userId: 1
      })

      // get
      const check = await sqlClient.unsafe("select reset_token, reset_token_expires from users where id=1")

      // Assert
      expect(check).toEqual([{
        reset_token: "somehash",
        reset_token_expires: new Date("2024-12-31T23:59:59")
      }])

    })

    it("Success; empty", async () => {
      await expect(userRepo.updateUserResetToken({
        resetTokenHash: "somehash",
        expiryTime: new Date("2024-12-31T23:59:59"),
        userId: 3
      })).rejects.toMatchObject({
        statusCode: 500,
        message: "should be *exactly* 1 row"
      })
    })

  })
})
