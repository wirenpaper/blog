import { postRepository } from "@db/post/post_repository.js"
import { userRepository } from "@db/user/user_repository.js"
import { commentRepository } from "@db/comment/comment_repository.js"
import sqlClient, { createTables, dropTables } from "@db/db_test_setup.js"

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
  describe("getPostComments", () => {
    it("successfully edits comment", async () => {
      const comment2Before = await sqlClient.unsafe("select * from comments where id=2")
      await commentRepo.editComment({ id: 2, mComment: "jar" })
      const comment2After = await sqlClient.unsafe("select * from comments where id=2")
      expect(comment2Before).toEqual([{ id: 2, comment: "u wot m8", user_id: 1, post_id: 1 }])
      expect(comment2After).toEqual([{ id: 2, comment: "jar", user_id: 1, post_id: 1 }])
    })

    it("failure; edit non existent comment", async () => {
      await expect(commentRepo.editComment({ id: 4, mComment: "lol" })).rejects.toMatchObject({
        statusCode: 500,
        message: "comment does not exist"
      })
    })

  })
})
