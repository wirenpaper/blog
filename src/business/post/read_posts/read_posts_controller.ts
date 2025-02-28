import { PostRepository } from "../../../db/post/post_repository.js";
import { Router } from "express"
import { makeReadPostsService } from "./read_posts_service.js";
import { PostgressDBError, PostError } from "../../../errors.js";

export function makeReadPostsRouter(postRepo: PostRepository) {
  const readPostsService = makeReadPostsService(postRepo)

  return Router().get("/", async (_, res) => {
    try {
      const result = await readPostsService.readPosts()
      res.json(result)
    } catch (error) {
      if (error instanceof PostgressDBError || error instanceof PostError) {
        const { statusCode, name, func, message } = error
        res.status(statusCode).json({ name, func, message })
      }
      res.status(500).json(error)
    }
  })
}
