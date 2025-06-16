import { userRepository } from "@db/user/userRepository.js"
import { postRepository } from "@db/post/post_repository.js"
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
    await postRepo.createPost({
      mPost: "blabla",
      userId: 2
    })
    await postRepo.createPost({
      mPost: "jaja",
      userId: 2
    })
    await postRepo.createPost({
      mPost: "rara",
      userId: 1
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
  describe("getPostById", () => {
    it("Success; getting post", async () => {
      // Arrange
      const result = await postRepo.getPostById({ id: 1 })

      // Assert
      expect(result).toEqual({ id: 1, mPost: "blabla", userId: 2, userName: "jany" })
    })

    it("failure; not found", async () => {
      // Arrange
      await expect(postRepo.getPostById({ id: 4 })).rejects.toMatchObject({
        statusCode: 500,
        message: "should be *exactly* 1 row"
      })
    })

  })
})
