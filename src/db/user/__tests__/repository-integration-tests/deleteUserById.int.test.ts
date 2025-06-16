import { userRepository } from "@db/user/userRepository.js"
import sqlClient, { createTables, dropTables } from "@db/dbTestSetup.js"
import { postRepository } from "@db/post/postRepository.js"

describe("userRepository", () => {
  const userRepo = userRepository(sqlClient)
  const postRepo = postRepository(sqlClient)

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
  describe("deleteUserById", () => {
    it("Success; delete user", async () => {
      const usersBefore = await sqlClient.unsafe("select id, user_name from users")
      await userRepo.deleteUserById({ userId: 1 })
      const usersAfter = await sqlClient.unsafe("select id, user_name from users")
      expect(usersBefore).toEqual([
        { id: 1, user_name: "johnny" },
        { id: 2, user_name: "jany" }
      ])
      expect(usersAfter).toEqual([{ id: 2, user_name: "jany" }])
    })

    it("Success; delete user with posts", async () => { // using cascading
      await postRepo.createPost({ mPost: "haha", userId: 1 })
      await postRepo.createPost({ mPost: "lel", userId: 1 })
      const usersBefore = await sqlClient.unsafe("select id, user_name from users")
      const postsBefore = await sqlClient.unsafe("select * from posts")
      await userRepo.deleteUserById({ userId: 1 })
      const usersAfter = await sqlClient.unsafe("select id, user_name from users")
      const postsAfter = await sqlClient.unsafe("select * from posts")
      expect(usersBefore).toEqual([
        { id: 1, user_name: "johnny" },
        { id: 2, user_name: "jany" }
      ])
      expect(usersAfter).toEqual([{ id: 2, user_name: "jany" }])
      expect(postsBefore).toEqual([
        { id: 1, post: "haha", user_id: 1 },
        { id: 2, post: "lel", user_id: 1 }
      ])
      expect(postsAfter).toEqual([])
    })

    it("Failure; non existent row", async () => {
      await expect(userRepo.deleteUserById({ userId: 3 })).rejects.toMatchObject({
        statusCode: 500,
        message: "no rows deleted"
      })
    })

    // TODO -> comments of deleted users should not be deleted

  })
})
