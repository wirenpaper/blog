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
  describe("getPosts", () => {
    it("Success; a single post", async () => {
      // Act
      await postRepo.createPost({
        mPost: "blabla",
        userId: 2
      })

      const posts = await postRepo.getPosts()
      expect(posts).toMatchObject([{ id: 1, mPost: "blabla", userId: 2, userName: "jany" }])
    })

    it("Success; multiple posts", async () => {
      // Act
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

      const posts = await postRepo.getPosts()
      expect(posts).toMatchObject([
        { id: 3, mPost: "rara", userId: 1, userName: "johnny" },
        { id: 2, mPost: "jaja", userId: 2, userName: "jany" },
        { id: 1, mPost: "blabla", userId: 2, userName: "jany" }
      ])
    })

    it("Success; empty", async () => {
      // Act
      const posts = await postRepo.getPosts()
      expect(posts).toMatchObject([])
    })

  })
})
