import { postRepository } from "@db/post/post_repository.js"
import { userRepository } from "@db/user/userRepository.js"
import sqlClient, { createTables, dropTables } from "@db/dbTestSetup.js"

describe("postRepository", () => {
  const postRepo = postRepository(sqlClient)
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
  describe("createPost", () => {
    it("should successfully create a user", async () => {
      // Act
      const result = await postRepo.createPost({
        mPost: "blabla",
        userId: 2
      })

      // Assert
      expect(result).toMatchObject({
        id: 1,
        mPost: "blabla",
        userId: 2
      })
    })

    it("failure; foreign key contstraint violation", async () => {
      await expect(postRepo.createPost({
        mPost: "blabla",
        userId: 3
      })).rejects.toMatchObject({
        statusCode: 400,
        message: "insert or update on table \"posts\" violates foreign key constraint \"posts_user_id_fkey\""
      })
    })

  })
})
