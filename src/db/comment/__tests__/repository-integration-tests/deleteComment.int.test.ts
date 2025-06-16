import { postRepository } from "@db/post/postRepository.js"
import { userRepository } from "@db/user/userRepository.js"
import { commentRepository } from "@db/comment/commentRepository.js"
import sqlClient, { createTables, dropTables } from "@db/dbTestSetup.js"

describe("commentRepository", () => {
  const postRepo = postRepository(sqlClient)
  const userRepo = userRepository(sqlClient)
  const commentRepo = commentRepository(sqlClient)

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
    await postRepo.createPost({ mPost: "blabla", userId: 2 })
    await postRepo.createPost({ mPost: "jaja", userId: 2 })
    await postRepo.createPost({ mPost: "rara", userId: 1 })
    await commentRepo.createComment({ mComment: "just say it", postId: 1, userId: 2 })
    await commentRepo.createComment({ mComment: "u wot m8", postId: 1, userId: 1 })
    await commentRepo.createComment({ mComment: "g,g,", postId: 2, userId: 1 })
  })

  // Final cleanup
  afterAll(async () => {
    // Drop all tables
    await sqlClient.unsafe(dropTables)
    // Close connection - postgres.js specific method
    await sqlClient.end()
  })

  // Tests
  describe("deleteComment", () => {
    it("successfully deletes comment", async () => {
      const commentBefore = await sqlClient.unsafe("select * from comments where id=2")
      expect(commentBefore).toEqual([{ id: 2, comment: "u wot m8", user_id: 1, post_id: 1 }])
      await commentRepo.deleteComment({ id: 2 })
      const commentAfter = await sqlClient.unsafe("select * from comments where id=2")
      expect(commentAfter).toEqual([])
    })

    it("failure; tries to delete non existent comment", async () => {
      await expect(commentRepo.deleteComment({ id: 4 })).rejects.toMatchObject({
        statusCode: 500,
        message: "comment does not exist"
      })
    })
  })
})
