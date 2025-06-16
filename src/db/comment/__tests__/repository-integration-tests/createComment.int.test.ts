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
  describe("createComment", () => {
    it("should successfully create a user", async () => {
      await commentRepo.createComment({
        mComment: "jaja",
        postId: 1,
        userId: 1,
      })
      const res = await sqlClient.unsafe("select * from comments")
      expect(res).toMatchObject(
        [{ id: 1, comment: "jaja", user_id: 1, post_id: 1 }]
      )
    })

    it("fail, userId dont exist", async () => {
      await expect(commentRepo.createComment({
        mComment: "haha",
        postId: 1,
        userId: 3
      })).rejects.toMatchObject({
        statusCode: 400,
        message: "insert or update on table \"comments\" violates foreign key constraint \"comments_user_id_fkey\""
      })
    })

    it("fail, postId dont exist", async () => {
      await expect(commentRepo.createComment({
        mComment: "haha",
        postId: 4,
        userId: 1
      })).rejects.toMatchObject({
        statusCode: 400,
        message: "insert or update on table \"comments\" violates foreign key constraint \"comments_post_id_fkey\""
      })
    })

    it("fail, userId && postId dont exist", async () => { // user_id violation detected, not post_id
      await expect(commentRepo.createComment({
        mComment: "haha",
        postId: 4,
        userId: 3
      })).rejects.toMatchObject({
        statusCode: 400,
        message: "insert or update on table \"comments\" violates foreign key constraint \"comments_user_id_fkey\""
      })
    })

  })
})
