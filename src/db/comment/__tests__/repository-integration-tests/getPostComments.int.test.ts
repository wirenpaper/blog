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
  describe("getPostComments", () => {
    it("should successfully get comments in post 1", async () => {
      const res = await commentRepo.getPostComments({ postId: 1 })
      expect(res).toMatchObject([
        { userName: "johnny", mComment: "u wot m8", userId: 1, commentId: 2 },
        { userName: "jany", mComment: "just say it", userId: 2, commentId: 1 }
      ])
    })

    it("should successfully get comments whose users were deleted", async () => {
      await userRepo.createUser({
        userName: "jobs",
        hashedPassword: "lol123",
        firstName: "steve",
        lastName: "jobs"
      })
      await commentRepo.createComment({ mComment: "ey yo", postId: 1, userId: 3 })
      await sqlClient.unsafe("delete from users where id=3")
      const res = await commentRepo.getPostComments({ postId: 1 })
      expect(res).toMatchObject([
        { userName: "johnny", mComment: "u wot m8", userId: 1, commentId: 2 },
        { userName: "jany", mComment: "just say it", userId: 2, commentId: 1 },
        { userName: null, mComment: "ey yo", userId: null, commentId: 4 }
      ])
    })

    it("should successfully show one comment", async () => {
      const res = await commentRepo.getPostComments({ postId: 2 })
      expect(res).toMatchObject([{ userName: "johnny", mComment: "g,g,", userId: 1, commentId: 3 }])
    })

    it("should successfully show NO comments", async () => {
      await sqlClient.unsafe("delete from comments where id=3")
      const res = await commentRepo.getPostComments({ postId: 2 })
      expect(res).toMatchObject([])
    })

  })
})
