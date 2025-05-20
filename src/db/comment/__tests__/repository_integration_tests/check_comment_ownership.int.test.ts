import { userRepository } from "@db/user/user_repository.js"
import { postRepository } from "@db/post/post_repository.js"
import { commentRepository } from "@db/comment/comment_repository.js"
import sqlClient, { createTables, dropTables } from "@db/db_test_setup.js"

describe("checkPostOwnership", () => {
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
    await commentRepo.createComment({
      mComment: "just say it",
      postId: 1,
      userId: 2
    })
    await commentRepo.createComment({
      mComment: "u wot m8",
      postId: 1,
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
  describe("checkCommentOwnership", () => {
    it("Success; check user_id 2", async () => {
      const res = await commentRepo.checkCommentOwnership({ id: 1 })
      expect(res).toMatchObject({
        userId: 2,
        userName: "jany"
      })
    })

    it("Success; check user_id 1", async () => {
      const res = await commentRepo.checkCommentOwnership({ id: 2 })
      expect(res).toMatchObject({
        userId: 1,
        userName: "johnny"
      })
    })

    it("Success; user_id is null", async () => {
      // Arrange
      await sqlClient.unsafe("delete from users where id=1")
      const res = await commentRepo.checkCommentOwnership({ id: 2 })
      expect(res).toMatchObject({
        userId: null,
        userName: null
      })
    })

    it("Failure; comment doesnt exist", async () => {
      // Arrange
      await expect(commentRepo.checkCommentOwnership({ id: 3 })).rejects.toMatchObject({
        statusCode: 500,
        message: "no owner"
      })
    })

  })
})
