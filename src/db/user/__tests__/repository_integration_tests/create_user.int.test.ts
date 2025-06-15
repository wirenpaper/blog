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
  })

  // Final cleanup
  afterAll(async () => {
    // Drop all tables
    await sqlClient.unsafe(dropTables)
    // Close connection - postgres.js specific method
    await sqlClient.end()
  })

  // Tests
  describe("createUser", () => {
    it("should successfully create a user", async () => {
      // Arrange
      const testUser = {
        userName: "testuser",
        hashedPassword: "hashedpassword123",
        firstName: "Test",
        lastName: "User"
      }

      // Act
      const result = await userRepo.createUser(testUser)

      // Assert
      expect(result).toMatchObject({
        userName: testUser.userName,
        hashedPassword: testUser.hashedPassword,
        firstName: testUser.firstName,
        lastName: testUser.lastName
      })
      expect(result.id).toBeDefined()

      // Verify in database - postgres.js tagged template syntax
      const dbResult = await sqlClient`SELECT * FROM users WHERE user_name = ${testUser.userName}`
      expect(dbResult.length).toBe(1)
      expect(dbResult).toMatchObject([
        {
          first_name: "Test",
          hashed_password: "hashedpassword123",
          last_name: "User",
          reset_token: null,
          reset_token_expires: null,
          user_name: "testuser"
        }
      ])
    })

    it("should throw error when creating duplicate user", async () => {
      // Arrange
      const testUser = {
        userName: "duplicateuser",
        hashedPassword: "password123",
        firstName: "Duplicate",
        lastName: "User"
      }
      const testUser2 = {
        userName: "duplicateuser",
        hashedPassword: "somethingelse",
        firstName: "dupper",
        lastName: "jaja"
      }

      // Create first user
      await userRepo.createUser(testUser)

      // Act & Assert - Attempt to create duplicate
      await expect(userRepo.createUser(testUser2)).rejects.toMatchObject({
        statusCode: 400,
        message: expect.stringContaining("duplicate") as string
      })
    })

    it("should handle null first and last names (using \"\")", async () => {
      // Arrange
      const testUser = {
        userName: "nonamestestuser",
        hashedPassword: "password123",
        firstName: "",
        lastName: ""
      }

      // Act
      const result = await userRepo.createUser(testUser)

      // Assert
      expect(result.firstName).toBeNull()
      expect(result.lastName).toBeNull()

      // Verify in database - postgres.js tagged template syntax
      const dbResult = await sqlClient`SELECT * FROM users WHERE user_name = ${testUser.userName}`
      expect(dbResult[0].first_name).toBeNull()
      expect(dbResult[0].last_name).toBeNull()
    })

    it("should handle null first and last names (using null)", async () => {
      // Arrange
      const testUser = {
        userName: "nonamestestuser",
        hashedPassword: "password123",
      }

      // Act
      const result = await userRepo.createUser(testUser)

      // Assert
      expect(result.firstName).toBeNull()
      expect(result.lastName).toBeNull()

      // Verify in database - postgres.js tagged template syntax
      const dbResult = await sqlClient`SELECT * FROM users WHERE user_name = ${testUser.userName}`
      expect(dbResult[0].first_name).toBeNull()
      expect(dbResult[0].last_name).toBeNull()
    })
  })
})
