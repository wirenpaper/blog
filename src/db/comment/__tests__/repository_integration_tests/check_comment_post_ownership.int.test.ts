import { userRepository } from "@db/user/userRepository.js"
import { postRepository } from "@db/post/post_repository.js"
import { commentRepository } from "@db/comment/comment_repository.js"
import sqlClient, { createTables, dropTables } from "@db/dbTestSetup.js"

describe("CommentRepository", () => {
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
    await commentRepo.createComment({
      mComment: "my comment",
      postId: 2,
      userId: 1
    })
    await commentRepo.createComment({
      mComment: "so sorry",
      postId: 3,
      userId: 2
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
  describe("checkPostComment", () => {

    it("Success where id=2", async () => {
      const res1 = await sqlClient.unsafe("select * from comments where id=2")
      expect(res1).toMatchObject([{ "comment": "u wot m8", "id": 2, "post_id": 1, "user_id": 1 }])
      const res2 = await sqlClient.unsafe("select * from posts where id=1")
      expect(res2).toMatchObject([{ "id": 1, "post": "blabla", "user_id": 2 }])
      const res = await commentRepo.checkCommentPostOwnership({ id: 2 })
      expect(res).toMatchObject({ userId: 2 })
    })

    it("Success where id=3", async () => {
      const res1 = await sqlClient.unsafe("select * from comments where id=3")
      expect(res1).toMatchObject([{ "comment": "my comment", "id": 3, "post_id": 2, "user_id": 1 }])
      const res2 = await sqlClient.unsafe("select * from posts where id=2")
      expect(res2).toMatchObject([{ "id": 2, "post": "jaja", "user_id": 2 }])
      const res = await commentRepo.checkCommentPostOwnership({ id: 3 })
      expect(res).toMatchObject({ userId: 2 })
    })

    it("Success where id=4", async () => {
      const res1 = await sqlClient.unsafe("select * from comments where id=4")
      expect(res1).toMatchObject([{ id: 4, comment: "so sorry", user_id: 2, post_id: 3 }])
      const res2 = await sqlClient.unsafe("select * from posts where id=3")
      expect(res2).toMatchObject([{ id: 3, post: "rara", user_id: 1 }])
      const res = await commentRepo.checkCommentPostOwnership({ id: 4 })
      expect(res).toMatchObject({ userId: 1 })
    })

    it("Success where id=4, delete comment user", async () => {
      await sqlClient.unsafe("delete from users where id=2")
      const res1 = await sqlClient.unsafe("select * from comments where id=4")
      expect(res1).toMatchObject([{ id: 4, comment: "so sorry", user_id: null, post_id: 3 }])
      const res2 = await sqlClient.unsafe("select * from posts where id=3")
      expect(res2).toMatchObject([{ id: 3, post: "rara", user_id: 1 }])
      const res = await commentRepo.checkCommentPostOwnership({ id: 4 })
      expect(res).toMatchObject({ userId: 1 })
    })

  })
})
