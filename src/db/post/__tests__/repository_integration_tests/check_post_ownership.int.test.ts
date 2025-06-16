import { userRepository } from "@db/user/userRepository.js"
import { postRepository } from "@db/post/post_repository.js"
import sqlClient, { createTables, dropTables } from "@db/dbTestSetup.js"

describe("checkPostOwnership", () => {
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
  describe("checkPostOwnership", () => {
    it("Success; check a post", async () => {
      // Arrange
      const result = await postRepo.checkPostOwnership({ id: 1 })

      // Assert
      expect(result).toEqual({ userId: 2, userName: "jany" })
    })

    it("Success; check a post", async () => {
      // Arrange
      const result = await postRepo.checkPostOwnership({ id: 2 })

      // Assert
      expect(result).toEqual({ userId: 2, userName: "jany" })
    })

    it("Success; check a post", async () => {
      // Arrange
      const result = await postRepo.checkPostOwnership({ id: 3 })

      // Assert
      expect(result).toEqual({ userId: 1, userName: "johnny" })
    })

    it("Failure; check a post", async () => {
      // Arrange
      await expect(postRepo.checkPostOwnership({ id: 4 })).rejects.toMatchObject({
        statusCode: 500,
        message: "no results"
      })
    })

    it("Failure; check a deleted post", async () => {
      // Arrange
      await userRepo.deleteUserById({ userId: 1 })
      await expect(postRepo.checkPostOwnership({ id: 4 })).rejects.toMatchObject({
        statusCode: 500,
        message: "no results"
      })
    })

  })
})
