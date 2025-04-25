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
    await userRepo.createUser({
      userName: "boom",
      hashedPassword: "gggg",
      firstName: "Boom",
      lastName: "Doom"
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
      const result = await userRepo.getUserByVerifiedToken({ userName: "bunga" })
      expect(result).toEqual(undefined)

    })

    it("Success; empty, johnny boy expirey time is over", async () => {
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
      await userRepo.updateTokenVerified({ userId: 1 })
      await userRepo.updateTokenVerified({ userId: 2 })

      const res = await userRepo.getUserByVerifiedToken({ userName: "johnny" })
      expect(res).toEqual(undefined)
    })

    it("Success; jany token verified successfully", async () => {
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
      await userRepo.updateTokenVerified({ userId: 1 })
      await userRepo.updateTokenVerified({ userId: 2 })

      const res = await userRepo.getUserByVerifiedToken({ userName: "jany" })
      expect(res).toEqual({
        id: 2,
        resetToken: "blabla"
      })
    })

  })
})
